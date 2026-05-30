import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';

export const authRouter = Router();

// Aggressive Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-meridian-key-for-dev';
const COOKIE_NAME = 'meridian_auth_token';

// --- IN-MEMORY MOCK DATABASE ---
// In a real app, this would be PostgreSQL/MongoDB.
interface UserRecord {
  email: string;
  passwordHash: string;
  otp?: string;
  otpExpiry?: number;
}
const usersDb = new Map<string, UserRecord>();

// Seed a default user
const seedUser = () => {
  const defaultEmail = 'analyst@meridian.com';
  const defaultPassword = 'password123';
  usersDb.set(defaultEmail, {
    email: defaultEmail,
    passwordHash: bcrypt.hashSync(defaultPassword, 10),
  });
};
seedUser();

// Middleware to protect standard API routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to protect Socket.io connections
export const verifySocketAuth = (socket: any, next: (err?: Error) => void) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies[COOKIE_NAME];

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// --- AUTH ROUTES ---

authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = usersDb.get(email);
  if (!user) {
    // For testing: create a new user on the fly if they don't exist
    usersDb.set(email, {
      email,
      passwordHash: await bcrypt.hash(password, 10),
    });
  } else {
    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  // Generate real JWT
  const userPayload = {
    email,
    name: email.split('@')[0].toUpperCase(),
    role: 'Portfolio Manager',
  };

  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '8h' });

  // Issue HTTP-Only, Secure cookie
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  res.json({ success: true, user: userPayload });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

// --- FORGOT PASSWORD FLOW ---

authRouter.post('/forgot-password', authLimiter, (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = usersDb.get(email);
  if (!user) {
    // Security best practice: Don't reveal if user exists or not
    return res.json({ success: true, message: 'If email exists, OTP sent.', simulatedOtp: '000000' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes valid

  console.log(`[SIMULATED EMAIL TO ${email}]: Your OTP is ${otp}`);

  // We return it to the frontend only to simulate the pop-up notification requested by the user
  res.json({ success: true, simulatedOtp: otp });
});

authRouter.post('/verify-otp', (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = usersDb.get(email);

  if (!user || user.otp !== otp || !user.otpExpiry || Date.now() > user.otpExpiry) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // OTP verified, issue a short-lived reset token (could be a JWT, here we just return success to let them proceed)
  // In a real app, you'd issue a reset token. We'll simulate by just allowing it.
  res.json({ success: true, resetToken: 'mock-reset-token-' + otp });
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { email, resetToken, newPassword } = req.body;
  
  const user = usersDb.get(email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Validate the mock reset token
  if (resetToken !== 'mock-reset-token-' + user.otp) {
    return res.status(400).json({ error: 'Invalid reset token' });
  }

  // Hash new password and clear OTP
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpiry = undefined;

  res.json({ success: true });
});
