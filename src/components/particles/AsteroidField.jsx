import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* CIRCLE TEXTURE FOR ROUND PARTICLES */
function createCircleTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

/* DUST PARTICLES */
function AsteroidDust({ count = 160, size = 0.025, color = "#ffab36" }) {
  const ref = useRef();
  const circleTexture = useMemo(() => createCircleTexture(), []);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 1.7 + Math.random() * 0.5;
      const a = Math.random() * Math.PI * 2;
      const h = (Math.random() - 0.5) * 0.6;

      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = h;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }

    return arr;
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.001;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        map={circleTexture}
        transparent
        alphaTest={0.5}
        size={size}
        color={color}
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

/* ASTEROID */
function Asteroid({
  baseY,
  x = -4,
  z = -1,
  size = 1.6,
  color = "#f5bc5f",
  dustColor = "#ffab36",
}) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const scroll = window.scrollY * 0.01;
    const t = state.clock.elapsedTime;

    ref.current.position.set(
      x + Math.sin(t * 0.5) * 0.1,
      baseY + scroll,
      z
    );

    ref.current.rotation.z = Math.sin(t * 0.2) * 0.38;
    ref.current.scale.set(size, size * 0.7, size * 2.2);
  });

  return (
    <group ref={ref}>
      <mesh>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          roughness={0.95}
          flatShading
        />
      </mesh>

      {/* dust */}
      <AsteroidDust count={220} size={0.03} color={dustColor} />
    </group>
  );
}




export default function AsteroidField() {
  return (
    <>
    <Asteroid baseY={-8} x={-7} size={1.7} color="#f5bc5f" dustColor="#ffab36" />
<Asteroid baseY={-20} x={4} size={1.2} color="#982727" dustColor="#ffd3c4" />
<Asteroid baseY={-45} x={-16} size={1.4} color="#666565" dustColor="#a5e7ff" />
<Asteroid baseY={-55} x={3} size={0.6} color="#70056c" dustColor="#ffffff" />

    </>
  );
}
  