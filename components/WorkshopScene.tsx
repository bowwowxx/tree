"use client";

import { Component, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WORKSHOP_ITEMS, type WorkshopItemId } from "@/lib/workshop";
import { WorkshopCatModel } from "./WorkshopCatModel";

type Props = {
  selected: WorkshopItemId | null;
  reducedMotion: boolean;
  onSelect: (id: WorkshopItemId) => void;
  onReady: () => void;
  onError: () => void;
};

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Box({ position, size, color, metalness = 0, emissive }: {
  position: [number, number, number]; size: [number, number, number]; color: string;
  metalness?: number; emissive?: string;
}) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={metalness ? 0.4 : 0.8} metalness={metalness}
      emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 0.7 : 0} />
  </mesh>;
}

function AiCat() {
  return <group rotation={[0, 0.12, 0]}>
    <Box position={[0, 0.045, 0]} size={[0.68, 0.07, 0.36]} color="#38484a" />
    <Box position={[0, 0.18, -0.04]} size={[0.08, 0.26, 0.07]} color="#465656" />
    <Box position={[0, 0.5, 0]} size={[0.9, 0.63, 0.1]} color="#ead9c8" />
    <Box position={[0, 0.5, 0.059]} size={[0.8, 0.52, 0.015]} color="#172e31" emissive="#1e5355" />
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * 0.32, 0.91, 0]} rotation={[0, 0, -side * 0.15]} castShadow>
        <coneGeometry args={[0.15, 0.26, 3]} /><meshStandardMaterial color="#d7b9c1" />
      </mesh>
      <mesh position={[side * 0.16, 0.53, 0.074]} rotation={[0, 0, side * -0.22]}>
        <capsuleGeometry args={[0.023, 0.07, 4, 8]} /><meshBasicMaterial color="#b9e8d5" />
      </mesh>
      <Box position={[side * 0.23, 0.41, 0.073]} size={[0.08, 0.025, 0.012]} color="#dba7c4" emissive="#dba7c4" />
    </group>)}
    <mesh position={[0, 0.425, 0.08]} rotation={[0, 0, Math.PI]}>
      <coneGeometry args={[0.036, 0.04, 3]} /><meshBasicMaterial color="#e8c5d3" />
    </mesh>
    <Box position={[0, 0.025, 0.4]} size={[0.77, 0.04, 0.2]} color="#d8cab7" />
    {Array.from({ length: 8 }, (_, i) => <Box key={i} position={[-0.3 + i * 0.085, 0.049, 0.4]} size={[0.055, 0.008, 0.12]} color="#b4b8a8" />)}
  </group>;
}

const PUPPY = ["..##..##..", "..######..", ".########.", ".##.##.##.", ".########.", "..######..", "...####...", "..######.."];
function StickBuddy() {
  return <group rotation={[0.05, -0.16, 0]}>
    <Box position={[0, 0.055, 0]} size={[0.39, 0.1, 0.28]} color="#584738" />
    <Box position={[0, 0.35, 0]} size={[0.32, 0.59, 0.13]} color="#ef9b4f" />
    <Box position={[0, 0.4, 0.073]} size={[0.26, 0.34, 0.025]} color="#12231d" emissive="#1c3c2b" />
    {PUPPY.flatMap((row, y) => [...row].map((pixel, x) => pixel === "#" && (
      <Box key={`${x}-${y}`} position={[(x - 4.5) * 0.021, 0.46 - y * 0.022, 0.09]} size={[0.02, 0.02, 0.01]} color="#bbdd9a" emissive="#9dcf7c" />
    )))}
    <mesh position={[0, 0.17, 0.072]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.052, 0.052, 0.015, 12]} /><meshStandardMaterial color="#3a3330" />
    </mesh>
    <Box position={[0.17, 0.39, 0]} size={[0.035, 0.085, 0.065]} color="#493829" />
  </group>;
}

function Spark() {
  return <group rotation={[0, -0.15, 0]}>
    <Box position={[0, 0.18, 0]} size={[0.85, 0.31, 0.65]} color="#aeb3aa" metalness={0.75} />
    <Box position={[0, 0.031, 0]} size={[0.73, 0.05, 0.54]} color="#29332e" />
    <Box position={[0, 0.18, 0.331]} size={[0.78, 0.19, 0.017]} color="#394340" />
    {Array.from({ length: 13 }, (_, i) => <Box key={i} position={[-0.32 + i * 0.047, 0.18, 0.345]} size={[0.014, 0.14, 0.01]} color="#1b2420" />)}
    <Box position={[0.3, 0.26, 0.354]} size={[0.042, 0.01, 0.009]} color="#a9dc6e" emissive="#9ed859" />
    <Box position={[0.17, 0.339, 0]} size={[0.17, 0.009, 0.16]} color="#758564" />
  </group>;
}

function Room({ selected, onSelect, onReady }: Pick<Props, "selected" | "onSelect" | "onReady">) {
  useEffect(onReady, [onReady]);
  return <group>
    {/* A cutaway treehouse: two walls keep all three desk objects visible. */}
    <Box position={[0, -0.15, 0]} size={[7.4, 0.25, 5.8]} color="#392c24" />
    {Array.from({ length: 20 }, (_, i) => <Box key={i} position={[-3.42 + i * 0.36, 0, 0]} size={[0.345, 0.06, 5.6]} color={i % 3 === 0 ? "#987046" : i % 3 === 1 ? "#a57f52" : "#b28b5b"} />)}
    <Box position={[0, 1.9, -2.75]} size={[7.4, 3.8, 0.15]} color="#c6b89a" />
    <Box position={[-3.65, 1.9, 0]} size={[0.16, 3.8, 5.6]} color="#bdac8b" />
    {[-3.5, 0, 3.5].map((x) => <Box key={x} position={[x, 1.9, -2.62]} size={[0.15, 3.85, 0.18]} color="#68503a" />)}
    <Box position={[0, 3.68, -2.6]} size={[7.15, 0.18, 0.22]} color="#68503a" />
    <Box position={[0, 0.18, -2.59]} size={[7.15, 0.24, 0.18]} color="#73563b" />
    {/* Window with a quiet miniature night sky. */}
    <Box position={[-2.1, 2.35, -2.64]} size={[1.7, 1.65, 0.055]} color="#172c35" emissive="#163344" />
    {[-2.98, -1.22].map((x) => <Box key={x} position={[x, 2.35, -2.53]} size={[0.1, 1.84, 0.16]} color="#765b3e" />)}
    {[1.47, 3.23].map((y) => <Box key={y} position={[-2.1, y, -2.53]} size={[1.88, 0.1, 0.16]} color="#765b3e" />)}
    <Box position={[-2.1, 2.35, -2.52]} size={[0.06, 1.7, 0.12]} color="#8a704e" />
    <Box position={[-2.1, 2.3, -2.52]} size={[1.7, 0.06, 0.12]} color="#8a704e" />
    <mesh position={[-1.59, 2.85, -2.595]}><sphereGeometry args={[0.15, 16, 12]} /><meshBasicMaterial color="#efddae" /></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-2.81 + (i * 0.37 % 1.4), 1.7 + (i * 0.51 % 1.3), -2.594]}>
      <sphereGeometry args={[0.012, 6, 4]} /><meshBasicMaterial color="#d9e7e2" />
    </mesh>)}
    {/* Desk, woven rug and stool. */}
    <Box position={[0, 1.46, -1.45]} size={[4.1, 0.2, 1.48]} color="#ad794a" />
    <Box position={[0, 1.34, -0.77]} size={[4.05, 0.12, 0.12]} color="#765336" />
    {[-1.75, 1.75].flatMap((x) => [-1.97, -0.97].map((z) => <Box key={`${x}-${z}`} position={[x, 0.69, z]} size={[0.13, 1.4, 0.13]} color="#674b34" />))}
    <Box position={[0, 0.047, 0.75]} size={[3.4, 0.025, 2.3]} color="#849783" />
    {[-1.56, 1.56].map((x) => <Box key={x} position={[x, 0.063, 0.75]} size={[0.12, 0.01, 2.3]} color="#c8b68e" />)}
    <mesh position={[0, 0.78, 0.23]} castShadow receiveShadow><cylinderGeometry args={[0.42, 0.42, 0.15, 20]} /><meshStandardMaterial color="#8d633d" /></mesh>
    {[-1, 1].flatMap((x) => [-1, 1].map((z) => <Box key={`${x}-${z}`} position={[x * 0.23, 0.4, 0.23 + z * 0.23]} size={[0.09, 0.73, 0.09]} color="#674b34" />))}
    {/* Shelf: books, a framed paw print, and a plant. */}
    <Box position={[1.55, 2.63, -2.37]} size={[2.4, 0.1, 0.55]} color="#88633f" />
    {["#7c9074", "#bd8069", "#d2b27b", "#8a98a5", "#aa8c9d"].map((color, i) => <Box key={color} position={[0.58 + i * 0.14, 2.95, -2.39]} size={[0.11, 0.52 + (i % 2) * 0.08, 0.28]} color={color} />)}
    <Box position={[1.75, 3, -2.4]} size={[0.5, 0.65, 0.05]} color="#8e6c47" />
    <Box position={[1.75, 3, -2.365]} size={[0.4, 0.55, 0.015]} color="#e7d8b9" />
    <mesh position={[1.75, 2.96, -2.35]} scale={[0.095, 0.08, 0.02]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color="#688571" /></mesh>
    {[-1, 0, 1].map((i) => <mesh key={i} position={[1.75 + i * 0.085, 3.1, -2.35]}><sphereGeometry args={[0.037, 8, 6]} /><meshStandardMaterial color="#688571" /></mesh>)}
    <group position={[-2.85, 0, -1.5]}>
      <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.34, 0.24, 0.6, 12]} /><meshStandardMaterial color="#ba8665" /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[Math.sin(i * 2.4) * 0.22, 0.75 + i * 0.06, Math.cos(i * 2.4) * 0.22]} rotation={[0.4, i * 2.4, 0.35]} scale={[0.15, 0.42, 0.08]} castShadow>
        <sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={i % 2 ? "#627e55" : "#81975e"} />
      </mesh>)}
    </group>
    {/* A warm brass desk lamp. */}
    <group position={[1.8, 1.57, -1.99]}>
      <mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.16, 0.18, 0.05, 16]} /><meshStandardMaterial color="#b99457" metalness={0.65} roughness={0.4} /></mesh>
      <Box position={[0, 0.34, 0]} size={[0.035, 0.64, 0.035]} color="#b99457" metalness={0.7} />
      <mesh position={[0, 0.72, 0]}><coneGeometry args={[0.28, 0.27, 20, 1, true]} /><meshStandardMaterial color="#789079" side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.61, 0]}><sphereGeometry args={[0.055, 8, 8]} /><meshBasicMaterial color="#ffdb94" /></mesh>
      <pointLight position={[0, 0.6, 0]} color="#ffc879" intensity={2.2} distance={4} decay={2} />
    </group>
    <group position={[2.4, 0.08, 0.9]} rotation={[0, -0.6, 0]} scale={0.85}><WorkshopCatModel animated={false} /></group>
    {WORKSHOP_ITEMS.map((item) => <group key={item.id} name={`workshop-${item.id}`} position={item.position}
      onClick={(event) => { event.stopPropagation(); onSelect(item.id); }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "auto"; }}>
      {item.id === "ai-cat" ? <AiCat /> : item.id === "stickbuddy" ? <StickBuddy /> : <Spark />}
      {selected === item.id && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, 0]}>
        <ringGeometry args={[0.49, 0.52, 40]} /><meshBasicMaterial color={item.color} side={THREE.DoubleSide} />
      </mesh>}
    </group>)}
  </group>;
}

function CameraRig({ selected, reducedMotion }: Pick<Props, "selected" | "reducedMotion">) {
  const { camera, invalidate, size, gl } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.25, -0.6));
  const destination = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  useEffect(() => { gl.domElement.dataset.cameraSettled = "false"; invalidate(); }, [selected, reducedMotion, size, invalidate, gl]);
  useFrame((_, delta) => {
    const item = WORKSHOP_ITEMS.find((entry) => entry.id === selected);
    const mobile = size.width < 600;
    const eye = item ? item.camera : mobile ? [6.6, 5.5, 9.5] : [5.6, 4.1, 6.6];
    const focus = item ? item.position : [0, 1.25, -0.6];
    destination.current.set(eye[0], eye[1], eye[2]);
    look.current.set(focus[0], focus[1], focus[2]);
    if (item) look.current.y += 0.32;
    if (mobile && item) destination.current.z += 0.8;
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-5 * Math.min(delta, 0.05));
    camera.position.lerp(destination.current, alpha);
    target.current.lerp(look.current, alpha);
    camera.lookAt(target.current);
    const moving = camera.position.distanceToSquared(destination.current) > 0.00001 || target.current.distanceToSquared(look.current) > 0.00001;
    gl.domElement.dataset.cameraSettled = String(!moving);
    if (moving) invalidate();
  });
  return null;
}

export default function WorkshopScene({ selected, reducedMotion, onSelect, onReady, onError }: Props) {
  return <SceneBoundary onError={onError}>
    <Canvas frameloop="demand" shadows dpr={[1, 1.5]} camera={{ position: [5.6, 4.1, 6.6], fov: 46, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.setClearColor("#17261f"); }}>
      <ambientLight intensity={0.65} color="#e9d6b3" />
      <hemisphereLight args={["#c7ded1", "#795439", 1.3]} />
      <directionalLight position={[2, 6, 4]} intensity={2.8} color="#ffe0ae" castShadow
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6}
        shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={0.04} />
      <CameraRig selected={selected} reducedMotion={reducedMotion} />
      <Room selected={selected} onSelect={onSelect} onReady={onReady} />
    </Canvas>
  </SceneBoundary>;
}
