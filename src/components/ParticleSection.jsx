import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

gsap.registerPlugin(ScrollTrigger);

function ParticleModel() {
  const m1 = useGLTF("/model.glb");
  const m2 = useGLTF("/model.glb");
  const m3 = useGLTF("/model.glb");
  const m4 = useGLTF("/model.glb");

  const { viewport } = useThree();

  const pointsRef = useRef();
  const geometryRef = useRef();

  const scrollProgress = useRef(0);
  const smoothScroll = useRef(0);

  const shapesRef = useRef([]);

  useEffect(() => {
    const getModelPositions = (scene) => {
      let mesh;
      scene.traverse((c) => c.isMesh && (mesh = c));
      return mesh.geometry.attributes.position.array;
    };

    const model1 = getModelPositions(m1.scene);
    const model2 = getModelPositions(m2.scene);
    const model3 = getModelPositions(m3.scene);
    const model4 = getModelPositions(m4.scene);

    const count = model1.length;
    const makeBuffer = () => new Float32Array(count);

    const cloud = makeBuffer();
    const dust = makeBuffer();
    const spiral = makeBuffer();
    const explosion = makeBuffer();

    for (let i = 0; i < count; i += 3) {
      const r = Math.random() * 3;
      const a = Math.random() * Math.PI * 2;

      cloud[i] = Math.cos(a) * r * 2;
      cloud[i + 1] = Math.random() * 0.6 - 1.5;
      cloud[i + 2] = Math.sin(a) * r * 1.6;

// TORNADO PARTICLE FIELD
const t2 = i * 0.0015;
const height2 = (i / count) * 3 - 1.5;
const radius2 = 0.3 + Math.abs(height2) * 0.8;

dust[i] = Math.cos(t2) * radius2;
dust[i + 1] = height2;
dust[i + 2] = Math.sin(t2) * radius2;



      const t = i * 0.0004;
      spiral[i] = Math.cos(t) * t * 1.3;
      spiral[i + 1] = (Math.random() - 0.5) * 1;
      spiral[i + 2] = Math.sin(t) * t * 1.3;

// TORUS RING FIELD
const index = i / 3;

const major = 1.5;
const minor = 0.5;

const u = (index % 200) / 200 * Math.PI * 2;
const v = Math.floor(index / 200) / 200 * Math.PI * 2;

explosion[i] = (major + minor * Math.cos(v)) * Math.cos(u);
explosion[i + 1] = minor * Math.sin(v);
explosion[i + 2] = (major + minor * Math.cos(v)) * Math.sin(u);








    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(cloud.slice(), 3));

    const colors = new Float32Array(count);
    for (let i = 0; i < count; i += 3) {
      colors[i] = 0.9;
      colors[i + 1] = 0.6;
      colors[i + 2] = 1;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    geometryRef.current = geometry;
    pointsRef.current.geometry = geometry;

    shapesRef.current = [
      cloud,
      model1,
      dust,
      model2,
      spiral,
      model3,
      explosion,
      model4,
    ];

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => (scrollProgress.current = self.progress),
    });
  }, [m1.scene, m2.scene, m3.scene, m4.scene]);

  useFrame((state) => {
    if (!geometryRef.current) return;
    if (!shapesRef.current.length) return;

    const shapes = shapesRef.current;
    const pos = geometryRef.current.attributes.position.array;

    smoothScroll.current = THREE.MathUtils.lerp(
      smoothScroll.current,
      scrollProgress.current,
      0.06
    );

    const progress = smoothScroll.current;

    const segments = 8;
    const segmentSize = 1 / segments;

    let stage = Math.floor(progress / segmentSize);
    stage = Math.min(stage, segments - 1);

    const segmentStart = stage * segmentSize;
    const segmentProgress = (progress - segmentStart) / segmentSize;

    const holdAmount = 0.35;

    let morphProgress =
      segmentProgress < holdAmount
        ? 0
        : (segmentProgress - holdAmount) / (1 - holdAmount);

    if (stage === 4) {
      morphProgress = Math.pow(morphProgress, 2.0);
    }

    const from = shapes[Math.min(stage, shapes.length - 1)];
    const to = shapes[Math.min(stage + 1, shapes.length - 1)];

    const time = state.clock.elapsedTime;

    const isModelStage =
      stage === 1 || stage === 3 || stage === 5 || stage === 7;

    for (let i = 0; i < pos.length; i += 3) {
      const x = THREE.MathUtils.lerp(from[i], to[i], morphProgress);
      const y = THREE.MathUtils.lerp(from[i + 1], to[i + 1], morphProgress);
      const z = THREE.MathUtils.lerp(from[i + 2], to[i + 2], morphProgress);

     const float = !isModelStage
  ? Math.sin(time * 1.2 + i * 0.02) * 0.06
  : 0;


      pos[i] = x;
      pos[i + 1] = y + float;
      pos[i + 2] = z;
    }

    geometryRef.current.attributes.position.needsUpdate = true;

    const isMobile = viewport.width < 6;

    let baseY = -viewport.height * 0.05;

    const rightOffset = viewport.width * 0.22;
    const leftOffset = viewport.width * 0.32;

    let currentTargetX = 0;
    let nextTargetX = 0;

    if (stage === 1 || stage === 5) currentTargetX = rightOffset;
    if (stage === 3 || stage === 7) currentTargetX = -leftOffset;

    if (stage + 1 === 1 || stage + 1 === 5) nextTargetX = rightOffset;
    if (stage + 1 === 3 || stage + 1 === 7) nextTargetX = -leftOffset;

    const blendedX = THREE.MathUtils.lerp(
      currentTargetX,
      nextTargetX,
      morphProgress
    );

    pointsRef.current.position.x = THREE.MathUtils.lerp(
      pointsRef.current.position.x,
      isMobile ? 0 : blendedX,
      0.08
    );

    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      baseY,
      0.08
    );

    if (isModelStage) {
      pointsRef.current.rotation.y += 0.002;
    }

    const s = isMobile ? 0.9 : 1;
    pointsRef.current.scale.set(s, s, s);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.004}
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function App() {
  return (
    <div style={{ background: "#000" }}>
      <div style={{ height: "900vh", position: "relative" }}>
        <Canvas
  style={{
    position: "sticky",
    top: 0,
    width: "100vw",
    height: "100vh",
    display: "block",
  }}


          camera={{ position: [2.6, 0.8, 4], fov: 50 }}
        >
          <ParticleModel />
          <EffectComposer>
            <Bloom intensity={0.25} luminanceThreshold={0} />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
