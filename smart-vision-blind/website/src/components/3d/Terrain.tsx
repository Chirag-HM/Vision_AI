import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Layered noise for organic terrain
function noise(x: number, z: number, time: number = 0): number {
  return (
    Math.sin(x * 0.3) * Math.cos(z * 0.2) * 3 +
    Math.sin(x * 0.15 + 1.2) * Math.sin(z * 0.25) * 5 +
    Math.cos(x * 0.07 + 0.5) * Math.cos(z * 0.1 + 1.8) * 8 +
    Math.sin(x * 0.05 + z * 0.04) * 12 +
    Math.sin(x * 0.6) * Math.cos(z * 0.5) * 0.8 +
    // Subtle time-based breathing
    Math.sin(x * 0.08 + time * 0.4) * Math.cos(z * 0.06 + time * 0.3) * 1.5
  );
}

// Pre-allocated color for lerping — avoids GC
const _color = new THREE.Color();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();

// Color stops for the terrain gradient
const COLOR_STOPS = [
  { t: 0.0, h: 0.72, s: 0.8, l: 0.04 },   // deep indigo abyss
  { t: 0.25, h: 0.68, s: 0.6, l: 0.08 },  // dark purple valleys
  { t: 0.45, h: 0.58, s: 0.55, l: 0.12 },  // teal slopes
  { t: 0.65, h: 0.48, s: 0.5, l: 0.16 },   // emerald ridges
  { t: 0.85, h: 0.22, s: 0.7, l: 0.22 },   // accent-tinted peaks
  { t: 1.0, h: 0.18, s: 0.9, l: 0.35 },    // bright accent tips
];

function getTerrainColor(normalizedHeight: number): THREE.Color {
  const t = Math.max(0, Math.min(1, normalizedHeight));
  let i = 0;
  for (; i < COLOR_STOPS.length - 2; i++) {
    if (t < COLOR_STOPS[i + 1].t) break;
  }
  const a = COLOR_STOPS[i];
  const b = COLOR_STOPS[i + 1];
  const localT = (t - a.t) / (b.t - a.t);
  const smooth = localT * localT * (3 - 2 * localT); // smoothstep

  _colorA.setHSL(a.h, a.s, a.l);
  _colorB.setHSL(b.h, b.s, b.l);
  _color.copy(_colorA).lerp(_colorB, smooth);
  return _color;
}

const SEGMENTS = 160;

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const { geometry, basePositions } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, SEGMENTS, SEGMENTS);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const h = noise(x, z, 0);

      pos.setZ(i, h);
      base[i * 3] = x;
      base[i * 3 + 1] = z;
      base[i * 3 + 2] = h;

      const normalizedH = (h + 20) / 45;
      const c = getTerrainColor(normalizedH);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    pos.needsUpdate = true;
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return { geometry: geo, basePositions: base };
  }, []);

  // Subtle breathing animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colors = meshRef.current.geometry.attributes.color as THREE.BufferAttribute;

    // Only animate every 2nd frame for performance
    if (Math.floor(time * 60) % 2 !== 0) return;

    const count = pos.count;
    for (let i = 0; i < count; i++) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 1];
      const h = noise(x, z, time);
      pos.setZ(i, h);

      // Update colors subtly
      const normalizedH = (h + 20) / 45;
      const c = getTerrainColor(normalizedH);
      colors.setXYZ(i, c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    colors.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Main terrain surface */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.8}
          metalness={0.15}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Wireframe overlay — sci-fi grid */}
      <mesh ref={wireRef} geometry={geometry}>
        <meshBasicMaterial
          color="#e8ff47"
          wireframe
          transparent
          opacity={0.018}
        />
      </mesh>
    </group>
  );
}
