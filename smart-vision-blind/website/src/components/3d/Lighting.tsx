import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Lighting() {
  const accentRef = useRef<THREE.PointLight>(null);
  const rimRef = useRef<THREE.PointLight>(null);

  // Animate accent light for a living feel
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (accentRef.current) {
      accentRef.current.position.x = Math.sin(t * 0.3) * 25;
      accentRef.current.position.z = Math.cos(t * 0.2) * 20;
      accentRef.current.intensity = 1.2 + Math.sin(t * 0.8) * 0.4;
    }
    if (rimRef.current) {
      rimRef.current.intensity = 3.5 + Math.sin(t * 0.15) * 1;
    }
  });

  return (
    <>
      {/* Ambient — very dark base */}
      <ambientLight intensity={0.1} color="#0d0820" />

      {/* Primary directional — cold cyan from above-left */}
      <directionalLight
        position={[-40, 60, -20]}
        intensity={1.0}
        color="#4af0d0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={200}
        shadow-bias={-0.001}
      />

      {/* Secondary fill — warm purple from right */}
      <directionalLight
        position={[50, 20, 30]}
        intensity={0.4}
        color="#a78bfa"
      />

      {/* Ground point — deep indigo glow from below */}
      <pointLight position={[0, -10, 0]} intensity={2.5} color="#2a0060" distance={100} />

      {/* Horizon rim — pulsing teal at distant z */}
      <pointLight
        ref={rimRef}
        position={[0, 6, -120]}
        intensity={3.5}
        color="#00d4ff"
        distance={180}
      />

      {/* Moving accent light — orbiting yellow highlight */}
      <pointLight
        ref={accentRef}
        position={[20, 12, 20]}
        intensity={1.2}
        color="#e8ff47"
        distance={70}
      />

      {/* Fog — exponential for depth */}
      <fogExp2 attach="fog" args={["#060912", 0.016]} />
    </>
  );
}
