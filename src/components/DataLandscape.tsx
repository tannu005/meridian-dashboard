import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const GRID_SIZE = 40;
const SPACING = 1.2;

function BarMatrix({ isDarkMode }: { isDarkMode: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create grid coordinates
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = (i - GRID_SIZE / 2) * SPACING;
        const z = (j - GRID_SIZE / 2) * SPACING;
        temp.push({ x, z });
      }
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update heights and colors in animation loop
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    if (!meshRef.current) return;
    
    particles.forEach((particle, i) => {
      // Calculate wave height based on distance from center and time
      const distance = Math.sqrt(particle.x * particle.x + particle.z * particle.z);
      const wave1 = Math.sin(distance * 0.5 - time * 2);
      const wave2 = Math.cos(particle.x * 0.3 + time);
      
      const height = Math.max(0.1, (wave1 + wave2) * 0.8 + 1.5);
      
      dummy.position.set(particle.x, height / 2 - 2, particle.z);
      dummy.scale.set(0.8, height, 0.8);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current!.instanceMatrix.needsUpdate = true;
    
    // Smoothly tilt camera based on mouse position
    const targetX = (state.pointer.x * Math.PI) / 10;
    const targetY = (state.pointer.y * Math.PI) / 10 + 1.2;
    
    state.camera.position.x += (targetX * 10 - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY * 5 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, -2, 0);
  });

  // Theme colors
  const color = isDarkMode ? "#F97316" : "#FB923C"; // Coral/Peach glow

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, GRID_SIZE * GRID_SIZE]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.2} 
        metalness={0.8} 
        emissive={color}
        emissiveIntensity={isDarkMode ? 0.4 : 0.1}
      />
    </instancedMesh>
  );
}

export function DataLandscape({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="absolute inset-0 z-0 bg-transparent pointer-events-none">
      <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
        <ambientLight intensity={isDarkMode ? 0.5 : 1.5} />
        <directionalLight position={[10, 10, 5]} intensity={isDarkMode ? 1 : 2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <BarMatrix isDarkMode={isDarkMode} />
        
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.4} 
          scale={50} 
          blur={2} 
          far={4} 
        />
        <Environment preset={isDarkMode ? "night" : "city"} />
      </Canvas>
    </div>
  );
}
