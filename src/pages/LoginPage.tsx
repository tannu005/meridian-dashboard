import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuroraBackground } from '../components/AuroraBackground';
import { ShieldCheck, Loader2, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

type AuthMode = 'login' | 'forgot' | 'otp' | 'reset';

export function LoginPage() {
  const { login, requestOtp, verifyOtp, resetPassword } = useAuthStore();
  const navigate = useNavigate();
  
  // Form State
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mockEmailToast, setMockEmailToast] = useState<{ message: string, otp: string } | null>(null);

  // Always go to Landing Page after login
  const from = '/';

  const showToast = (message: string, code: string) => {
    setMockEmailToast({ message, otp: code });
    setTimeout(() => setMockEmailToast(null), 10000); // Hide after 10s
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setError('');
    setIsLoading(true);
    try {
      const res = await requestOtp(email);
      if (res?.simulatedOtp) {
        showToast('MOCK EMAIL RECEIVED', res.simulatedOtp);
        setMode('otp');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    
    setError('');
    setIsLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      if (res?.resetToken) {
        setResetToken(res.resetToken);
        setMode('reset');
      } else {
        setError('Invalid or expired OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !resetToken || !newPassword) return;
    
    setError('');
    setIsLoading(true);
    try {
      const success = await resetPassword(email, resetToken, newPassword);
      if (success) {
        setMode('login');
        setPassword('');
        alert('Password successfully reset. You can now login.');
      } else {
        setError('Failed to reset password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg-primary text-text-primary p-4">
      <AuroraBackground />

      {/* Mock Email Toast Popup */}
      {mockEmailToast && (
        <div className="fixed top-6 right-6 bg-bg-secondary border border-accent rounded-xl p-4 shadow-glow z-[100] max-w-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-accent" />
            <h4 className="font-sans font-black uppercase text-xs tracking-wider">{mockEmailToast.message}</h4>
          </div>
          <p className="text-xs text-text-secondary font-mono mb-3">
            Meridian Capital Security has generated a one-time password for your account.
          </p>
          <div className="bg-bg-primary border border-border-primary rounded p-3 text-center">
            <span className="text-2xl font-black tracking-[0.5em] text-accent font-mono ml-2">
              {mockEmailToast.otp}
            </span>
          </div>
          <p className="text-[9px] text-text-muted mt-2 uppercase tracking-widest text-center">Valid for 10 minutes</p>
        </div>
      )}
      
      <div className="w-full max-w-md bg-bg-secondary/80 backdrop-blur-2xl border border-border-primary rounded-3xl p-8 shadow-2xl z-10 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-accent/20 blur-[60px] pointer-events-none" />

        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center shadow-glow">
            {mode === 'login' ? <ShieldCheck className="w-8 h-8 text-bg-primary" /> : <KeyRound className="w-8 h-8 text-bg-primary" />}
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black font-sans tracking-tight mb-2">
            {mode === 'login' && 'Meridian Single Sign-On'}
            {mode === 'forgot' && 'Account Recovery'}
            {mode === 'otp' && 'Security Verification'}
            {mode === 'reset' && 'Create New Password'}
          </h1>
          <p className="text-sm font-mono text-text-muted">
            {mode === 'login' && 'Institutional Access Portal'}
            {mode === 'forgot' && 'Request a secure OTP code'}
            {mode === 'otp' && 'Enter the 6-digit code sent to you'}
            {mode === 'reset' && 'Secure your account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* --- LOGIN MODE --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                Corporate Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@meridian.com"
                className="w-full bg-bg-primary border border-border-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-muted font-mono"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-mono font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-primary border border-border-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-muted font-mono tracking-widest"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => { setMode('forgot'); setError(''); }}
                className="text-[11px] text-accent hover:text-accent-hover font-bold font-sans transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent-hover text-bg-primary font-bold py-3.5 px-4 rounded-xl shadow-glow transition-all disabled:opacity-70 flex items-center justify-center gap-2 font-sans tracking-wide mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Authenticate</span>}
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD MODE --- */}
        {mode === 'forgot' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@meridian.com"
                className="w-full bg-bg-primary border border-border-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-muted font-mono"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent-hover text-bg-primary font-bold py-3.5 px-4 rounded-xl shadow-glow transition-all disabled:opacity-70 flex items-center justify-center gap-2 font-sans tracking-wide"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send OTP Code</span>}
            </button>

            <button 
              type="button" 
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </form>
        )}

        {/* --- OTP VERIFICATION MODE --- */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-text-secondary uppercase tracking-widest mb-1.5 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-bg-primary border border-border-secondary rounded-xl px-4 py-4 text-2xl text-center focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-muted/30 font-mono tracking-[0.5em]"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-accent hover:bg-accent-hover text-bg-primary font-bold py-3.5 px-4 rounded-xl shadow-glow transition-all disabled:opacity-70 flex items-center justify-center gap-2 font-sans tracking-wide"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify OTP</span>}
            </button>

            <button 
              type="button" 
              onClick={() => { setMode('forgot'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Use different email
            </button>
          </form>
        )}

        {/* --- RESET PASSWORD MODE --- */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="flex justify-center mb-2">
              <div className="px-3 py-1 bg-status-success/10 text-status-success rounded-full flex items-center gap-2 text-xs font-bold font-sans">
                <CheckCircle2 className="w-4 h-4" /> OTP Verified
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-bg-primary border border-border-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-muted font-mono tracking-widest"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || newPassword.length < 8}
              className="w-full bg-accent hover:bg-accent-hover text-bg-primary font-bold py-3.5 px-4 rounded-xl shadow-glow transition-all disabled:opacity-70 flex items-center justify-center gap-2 font-sans tracking-wide"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Set New Password</span>}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border-secondary/50 text-center">
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider leading-relaxed">
            Unauthorised access is strictly prohibited.<br/>
            Activity is logged and monitored for compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
