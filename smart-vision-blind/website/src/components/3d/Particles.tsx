import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
  quality?: "high" | "low";
}

export function Particles({ count = 2500, quality = "high" }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Points>(null);

  const actualCount = quality === "low" ? Math.floor(count * 0.4) : count;
  const glowCount = quality === "low" ? 8 : 20;

  // Small dust particles
  const { positions, velocities, sizes, colorArray } = useMemo(() => {
    const positions = new Float32Array(actualCount * 3);
    const velocities = new Float32Array(actualCount * 3);
    const sizes = new Float32Array(actualCount);
    const colorArray = new Float32Array(actualCount * 3);

    const accentColor = new THREE.Color("#e8ff47");
    const whiteColor = new THREE.Color("#ffffff");
    const cyanColor = new THREE.Color("#4af0d0");

    for (let i = 0; i < actualCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = Math.random() * 45 - 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220;

      velocities[i * 3] = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 1] = Math.random() * 0.015 + 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;

      // Varying sizes for depth
      sizes[i] = Math.random() * 0.15 + 0.05;

      // Mix of colors: 60% accent, 25% white, 15% cyan
      const r = Math.random();
      const c = r < 0.6 ? accentColor : r < 0.85 ? whiteColor : cyanColor;
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
    }
    return { positions, velocities, sizes, colorArray };
  }, [actualCount]);

  // Larger glowing orbs
  const glowData = useMemo(() => {
    const positions = new Float32Array(glowCount * 3);
    const speeds = new Float32Array(glowCount);
    for (let i = 0; i < glowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 20 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
      speeds[i] = Math.random() * 0.5 + 0.2;
    }
    return { positions, speeds };
  }, [glowCount]);

  const dustGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes.slice(), 1));
    geo.setAttribute("color", new THREE.BufferAttribute(colorArray.slice(), 3));
    return geo;
  }, [positions, sizes, colorArray]);

  const glowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(glowData.positions.slice(), 3));
    return geo;
  }, [glowData.positions]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Animate dust particles
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < actualCount; i++) {
        const px = pos.getX(i) + velocities[i * 3] + Math.sin(time * 0.3 + i * 0.01) * 0.002;
        let py = pos.getY(i) + velocities[i * 3 + 1];
        const pz = pos.getZ(i) + velocities[i * 3 + 2] + Math.cos(time * 0.2 + i * 0.02) * 0.002;

        if (py > 40) py = -8 + Math.random() * 4;
        pos.setXYZ(i, px, py, pz);
      }
      pos.needsUpdate = true;
    }

    // Animate glow orbs — slow orbit
    if (glowRef.current) {
      const pos = glowRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < glowCount; i++) {
        const baseX = glowData.positions[i * 3];
        const baseY = glowData.positions[i * 3 + 1];
        const baseZ = glowData.positions[i * 3 + 2];
        const speed = glowData.speeds[i];

        pos.setXYZ(
          i,
          baseX + Math.sin(time * speed) * 8,
          baseY + Math.sin(time * speed * 0.7 + i) * 3,
          baseZ + Math.cos(time * speed) * 8
        );
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Small dust particles */}
      <points ref={pointsRef} geometry={dustGeometry}>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Larger floating glow orbs */}
      <points ref={glowRef} geometry={glowGeometry}>
        <pointsMaterial
          size={1.8}
          color="#e8ff47"
          transparent
          opacity={0.12}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
