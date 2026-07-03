"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * Stylised recreation of the Visual Sky Radar simulation environment:
 * a satellite-image ground plane, translucent cones for the camera
 * fields of view (unlabelled), and a few aircraft crossing slowly.
 */

// procedural "satellite photo": patchwork fields, roads, a river, vignette
function makeSatelliteTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#33402a";
  ctx.fillRect(0, 0, size, size);

  const palette = [
    "#42522f", "#4f5c33", "#5a6b3a", "#6b7444", "#7d8050",
    "#8a815a", "#75683f", "#3c4a2c", "#57623d", "#8f8961",
  ];
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // field patches
  for (let i = 0; i < 160; i++) {
    ctx.save();
    ctx.translate(rand() * size, rand() * size);
    ctx.rotate((rand() - 0.5) * 0.5);
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    ctx.globalAlpha = 0.75 + rand() * 0.25;
    ctx.fillRect(0, 0, 40 + rand() * 170, 30 + rand() * 110);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // river
  ctx.strokeStyle = "#2e4148";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-20, size * 0.72);
  for (let x = 0; x <= size + 40; x += 40) {
    ctx.lineTo(x, size * 0.72 + Math.sin(x * 0.008) * 90 + Math.sin(x * 0.021) * 30);
  }
  ctx.stroke();

  // roads
  ctx.strokeStyle = "rgba(190, 190, 180, 0.55)";
  ctx.lineWidth = 4;
  for (const [x1, y1, x2, y2] of [
    [0, size * 0.35, size, size * 0.42],
    [size * 0.3, 0, size * 0.38, size],
    [0, size * 0.85, size, size * 0.6],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // settlement clusters along the road crossing
  ctx.fillStyle = "rgba(200, 195, 185, 0.5)";
  for (let i = 0; i < 260; i++) {
    const cx = size * 0.34 + (rand() - 0.5) * 260;
    const cy = size * 0.39 + (rand() - 0.5) * 220;
    ctx.fillRect(cx, cy, 3 + rand() * 6, 3 + rand() * 6);
  }

  // speckle noise
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)";
    ctx.fillRect(rand() * size, rand() * size, 2, 2);
  }

  // vignette so the tile fades into the page background
  const vg = ctx.createRadialGradient(size / 2, size / 2, size * 0.32, size / 2, size / 2, size * 0.72);
  vg.addColorStop(0, "rgba(10,12,16,0)");
  vg.addColorStop(1, "rgba(10,12,16,0.9)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function Terrain() {
  const texture = useMemo(() => makeSatelliteTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[26, 26]} />
      <meshStandardMaterial map={texture} roughness={1} metalness={0} />
    </mesh>
  );
}

// translucent rectangular FOV frustum: apex at the ground station, opening
// straight up like the camera's sensor footprint
function CameraFrustum({
  position,
  color = "#52d9c4",
}: {
  position: [number, number, number];
  color?: string;
}) {
  const height = 9;
  // half-extents of the sensor footprint at the top (rectangular aspect)
  const hw = 6.8;
  const hd = 5.8;

  const geometry = useMemo(() => {
    // 4-sided open pyramid, faces aligned to the axes, stretched to the
    // sensor aspect ratio
    const g = new THREE.ConeGeometry(1, height, 4, 1, true);
    g.rotateY(Math.PI / 4);
    g.rotateX(Math.PI); // apex to local origin, opening along +y
    g.translate(0, height / 2, 0);
    // after rotateY the square's corners sit at (±√½, ±√½) — scale so the
    // top opening spans ±hw in x and ±hd in z
    g.scale(hw * Math.SQRT2, 1, hd * Math.SQRT2);
    return g;
  }, []);

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 1), [geometry]);

  return (
    <group position={position}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.09}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} />
      </lineSegments>
      {/* ground station marker */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.3, 0.24, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// simple aircraft built from primitives, flying a slow circle
function Aircraft({
  radius,
  altitude,
  speed,
  phase,
  clockwise = false,
}: {
  radius: number;
  altitude: number;
  speed: number;
  phase: number;
  clockwise?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const dir = clockwise ? -1 : 1;
    const a = phase + dir * clock.getElapsedTime() * speed;
    g.position.set(Math.cos(a) * radius, altitude, Math.sin(a) * radius);
    // heading = tangent of the circle
    g.rotation.y = -a - (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
  });
  return (
    <group ref={ref} scale={0.32}>
      {/* fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.16, 1.6, 4, 10]} />
        <meshStandardMaterial color="#dfe6ee" roughness={0.4} />
      </mesh>
      {/* wings */}
      <mesh>
        <boxGeometry args={[0.5, 0.04, 2.6]} />
        <meshStandardMaterial color="#c7d0da" roughness={0.5} />
      </mesh>
      {/* tailplane */}
      <mesh position={[-0.85, 0, 0]}>
        <boxGeometry args={[0.3, 0.03, 1]} />
        <meshStandardMaterial color="#c7d0da" roughness={0.5} />
      </mesh>
      {/* fin */}
      <mesh position={[-0.85, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.45, 0.04]} />
        <meshStandardMaterial color="#dfe6ee" roughness={0.5} />
      </mesh>
      {/* nav-light blink */}
      <mesh position={[0.95, 0, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ff6a2c" emissive="#ff6a2c" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

export default function SimScene() {
  return (
    <Canvas
      camera={{ position: [10, 7.5, 11], fov: 42 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 1.75]}
    >
      <color attach="background" args={["#0a0c10"]} />
      <fog attach="fog" args={["#0a0c10", 18, 34]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 4]} intensity={1.1} color="#fff4e0" />
      <hemisphereLight args={["#3a4a5c", "#1c2418", 0.5]} />

      <Terrain />
      <gridHelper args={[26, 26, "#2a3442", "#1a212c"]} position={[0, 0.02, 0]} />

      {/* rectangular camera fields of view, straight up and overlapping over
          the shared patch of sky */}
      <CameraFrustum position={[-2.4, 0, -1.4]} />
      <CameraFrustum position={[2.4, 0, -2]} />
      <CameraFrustum position={[0.2, 0, 2.4]} color="#ff6a2c" />

      <Aircraft radius={6.5} altitude={6.2} speed={0.06} phase={0.4} />
      <Aircraft radius={4.2} altitude={7.4} speed={0.085} phase={2.6} clockwise />
      <Aircraft radius={8.2} altitude={5.2} speed={0.05} phase={4.4} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.55}
        enablePan={false}
        minDistance={6}
        maxDistance={22}
        maxPolarAngle={Math.PI * 0.46}
        target={[0, 2.5, 0]}
      />
    </Canvas>
  );
}
