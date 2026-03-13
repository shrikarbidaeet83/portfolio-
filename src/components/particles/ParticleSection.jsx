import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import AsteroidField from "../particles/AsteroidField";

const MODEL_URLS = ["/about.glb", "/model.glb", "/react.glb", "/project.glb"];
const SEGMENTS = 8;
const HOLD_AMOUNT = 0.35;

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const lerp = (a, b, t) => a + (b - a) * t;

function getQualitySettings() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1366;
  const memory =
    typeof navigator !== "undefined" && navigator.deviceMemory
      ? navigator.deviceMemory
      : 8;
  const cores =
    typeof navigator !== "undefined" && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 8;

  const constrained = memory <= 4 || cores <= 6;
  const veryLargeScreen = width >= 1700;
  const largeScreen = width >= 1280;

  if (veryLargeScreen || constrained) {
    return {
      dpr: [1, 1],
      floatAmplitude: 0.04,
      rotationSpeed: 0.006,
      colorStride: 2,
      bloom: 0.06,
      positionLerp: 0.1,
      scrollLerp: 0.08,
    };
  }

  if (largeScreen) {
    return {
      dpr: [1, 1.2],
      floatAmplitude: 0.045,
      rotationSpeed: 0.0075,
      colorStride: 2,
      bloom: 0.08,
      positionLerp: 0.09,
      scrollLerp: 0.08,
    };
  }

  return {
    dpr: [1, 1.4],
    floatAmplitude: 0.055,
    rotationSpeed: 0.01,
    colorStride: 1,
    bloom: 0.1,
    positionLerp: 0.08,
    scrollLerp: 0.06,
  };
}

function ParticleModel({ onReady, quality }) {
  const m1 = useGLTF("/about.glb");
  const m2 = useGLTF("/model.glb");
  const m3 = useGLTF("/react.glb");
  const m4 = useGLTF("/project.glb");

  const { viewport } = useThree();

  const pointsRef = useRef();
  const geometryRef = useRef();
  const floatPhaseRef = useRef();

  const scrollProgress = useRef(0);
  const smoothScroll = useRef(0);
  const frameCount = useRef(0);

  const shapesRef = useRef([]);
  const stageColorsRef = useRef([]);
  const dustColorsRef = useRef();
  const explosionColorsRef = useRef();
  const readySentRef = useRef(false);

  useEffect(() => {
    const getModelPositions = (scene) => {
      let mesh;
      scene.traverse((c) => {
        if (c.isMesh && c.geometry?.attributes?.position?.array) mesh = c;
      });
      return mesh?.geometry?.attributes?.position?.array || null;
    };

    const rawModels = [
      getModelPositions(m1.scene),
      getModelPositions(m2.scene),
      getModelPositions(m3.scene),
      getModelPositions(m4.scene),
    ];

    if (rawModels.some((model) => !model)) return undefined;

    const model1 = rawModels[0];
    const model2 = rawModels[1];
    const model3 = rawModels[2];
    const model4 = rawModels[3];

    const count = model1.length;
    const makeBuffer = () => new Float32Array(count);

    const cloud = makeBuffer();
    const dust = makeBuffer();
    const spiral = makeBuffer();
    const explosion = makeBuffer();
    const floatPhase = new Float32Array(count / 3);

    for (let i = 0; i < count; i += 3) {
      const p = i / 3;
      const r = Math.random() * 3;
      const a = Math.random() * Math.PI * 2;

      cloud[i] = Math.cos(a) * r * 2;
      cloud[i + 1] = Math.random() * 0.6 - 1.5;
      cloud[i + 2] = Math.sin(a) * r * 1.6;

      const spread = 15;
      const x = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      const y = Math.sin(x * 0.5) + Math.cos(z * 0.5);

      dust[i] = x;
      dust[i + 1] = y;
      dust[i + 2] = z;

      const t = i * 0.0004;
      spiral[i] = Math.cos(t) * t * 1.3;
      spiral[i + 1] = (Math.random() - 0.5) * 1;
      spiral[i + 2] = Math.sin(t) * t * 1.3;

      const spreadXY = 20;
      const spreadZ = 25;
      explosion[i] = (Math.random() - 0.5) * spreadXY;
      explosion[i + 1] = (Math.random() - 0.5) * spreadXY;
      explosion[i + 2] = (Math.random() - 0.5) * spreadZ;

      const wave =
        Math.sin(explosion[i] * 0.3) + Math.cos(explosion[i + 2] * 0.3);
      explosion[i + 1] += wave * 1.2;

      floatPhase[p] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(cloud.slice(), 3));

    const colors = new Float32Array(count);
    const dustColors = new Float32Array(count);
    const explosionColors = new Float32Array(count);

    const stageColors = [
      new THREE.Color("#e699ff"),
      new THREE.Color("#e699ff"),
      new THREE.Color("#ffb36b"),
      new THREE.Color("#e699ff"),
      new THREE.Color("#8ea6ff"),
      new THREE.Color("#e699ff"),
      new THREE.Color("#ff77cf"),
      new THREE.Color("#e699ff"),
    ];

    const dustPalette = [
      new THREE.Color("#7ee3ff"),
      new THREE.Color("#a7b8ff"),
      new THREE.Color("#d7a4ff"),
      new THREE.Color("#ff9ed9"),
    ];

    const explosionPalette = [
      new THREE.Color("#6fd8ff"),
      new THREE.Color("#9a8eff"),
      new THREE.Color("#c79aff"),
      new THREE.Color("#ff86cf"),
      new THREE.Color("#ffd0f6"),
    ];

    const fract = (n) => n - Math.floor(n);
    const mixedColor = new THREE.Color();

    for (let i = 0; i < count; i += 3) {
      const p = i / 3;
      colors[i] = stageColors[0].r;
      colors[i + 1] = stageColors[0].g;
      colors[i + 2] = stageColors[0].b;

      const dSeedA = fract(Math.sin(p * 12.9898) * 43758.5453);
      const dSeedB = fract(Math.sin((p + 29) * 78.233) * 23421.631);
      const dSeedC = fract(Math.sin((p + 101) * 37.719) * 15431.197);

      const dPos = dSeedA * (dustPalette.length - 1);
      const dIdxA = Math.floor(dPos);
      const dIdxB = Math.min(dIdxA + 1, dustPalette.length - 1);
      mixedColor.lerpColors(dustPalette[dIdxA], dustPalette[dIdxB], dSeedB);
      const dIntensity = 0.82 + dSeedC * 0.34;

      dustColors[i] = mixedColor.r * dIntensity;
      dustColors[i + 1] = mixedColor.g * dIntensity;
      dustColors[i + 2] = mixedColor.b * dIntensity;

      const eSeedA = fract(Math.sin(p * 5.311) * 92345.123);
      const eSeedB = fract(Math.sin((p + 53) * 18.127) * 63214.776);
      const eSeedC = fract(Math.sin((p + 211) * 9.571) * 19753.447);

      const ePos = eSeedA * (explosionPalette.length - 1);
      const eIdxA = Math.floor(ePos);
      const eIdxB = Math.min(eIdxA + 1, explosionPalette.length - 1);
      mixedColor.lerpColors(
        explosionPalette[eIdxA],
        explosionPalette[eIdxB],
        eSeedB
      );
      const eIntensity = 0.8 + eSeedC * 0.38;

      explosionColors[i] = mixedColor.r * eIntensity;
      explosionColors[i + 1] = mixedColor.g * eIntensity;
      explosionColors[i + 2] = mixedColor.b * eIntensity;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    if (geometryRef.current) geometryRef.current.dispose();

    geometryRef.current = geometry;
    floatPhaseRef.current = floatPhase;

    if (pointsRef.current) {
      pointsRef.current.geometry = geometry;
    }

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
    stageColorsRef.current = stageColors;
    dustColorsRef.current = dustColors;
    explosionColorsRef.current = explosionColors;

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    if (!readySentRef.current) {
      readySentRef.current = true;
      onReady?.();
    }

    return () => {
      trigger.kill();
      geometry.dispose();
    };
  }, [m1.scene, m2.scene, m3.scene, m4.scene, onReady]);

  useFrame((state) => {
    if (!geometryRef.current || !pointsRef.current || !floatPhaseRef.current) return;
    if (!shapesRef.current.length) return;

    const shapes = shapesRef.current;
    const pos = geometryRef.current.attributes.position.array;
    const col = geometryRef.current.attributes.color.array;
    const phase = floatPhaseRef.current;

    smoothScroll.current = lerp(
      smoothScroll.current,
      scrollProgress.current,
      quality.scrollLerp
    );

    const progress = smoothScroll.current;
    const segmentSize = 1 / SEGMENTS;

    let stage = Math.floor(progress / segmentSize);
    stage = Math.min(stage, SEGMENTS - 1);

    const segmentStart = stage * segmentSize;
    const segmentProgress = (progress - segmentStart) / segmentSize;

    let morphProgress =
      segmentProgress < HOLD_AMOUNT
        ? 0
        : (segmentProgress - HOLD_AMOUNT) / (1 - HOLD_AMOUNT);

    if (stage === 4) morphProgress = morphProgress * morphProgress;

    const from = shapes[Math.min(stage, shapes.length - 1)];
    const to = shapes[Math.min(stage + 1, shapes.length - 1)];
    const stageColors = stageColorsRef.current;
    const dustColors = dustColorsRef.current;
    const explosionColors = explosionColorsRef.current;
    const fromColor = stageColors[Math.min(stage, stageColors.length - 1)];
    const toColor = stageColors[Math.min(stage + 1, stageColors.length - 1)];

    const time = state.clock.elapsedTime;
    const isModelStage = stage === 1 || stage === 3 || stage === 5 || stage === 7;
    const nextStage = stage + 1;
    const invMorph = 1 - morphProgress;
    const twinkle = 0.92 + Math.sin(time * 1.6) * 0.08;
    const updateColors = frameCount.current % quality.colorStride === 0;
    frameCount.current += 1;

    for (let i = 0; i < pos.length; i += 3) {
      const p = i / 3;

      const x = from[i] * invMorph + to[i] * morphProgress;
      const y = from[i + 1] * invMorph + to[i + 1] * morphProgress;
      const z = from[i + 2] * invMorph + to[i + 2] * morphProgress;

      const floatY = !isModelStage
        ? Math.sin(time * 1.2 + phase[p]) * quality.floatAmplitude
        : 0;

      pos[i] = x;
      pos[i + 1] = y + floatY;
      pos[i + 2] = z;

      if (updateColors) {
        const fromR =
          stage === 2 ? dustColors[i] : stage === 6 ? explosionColors[i] : fromColor.r;
        const fromG =
          stage === 2
            ? dustColors[i + 1]
            : stage === 6
            ? explosionColors[i + 1]
            : fromColor.g;
        const fromB =
          stage === 2
            ? dustColors[i + 2]
            : stage === 6
            ? explosionColors[i + 2]
            : fromColor.b;

        const toR =
          nextStage === 2
            ? dustColors[i]
            : nextStage === 6
            ? explosionColors[i]
            : toColor.r;
        const toG =
          nextStage === 2
            ? dustColors[i + 1]
            : nextStage === 6
            ? explosionColors[i + 1]
            : toColor.g;
        const toB =
          nextStage === 2
            ? dustColors[i + 2]
            : nextStage === 6
            ? explosionColors[i + 2]
            : toColor.b;

        col[i] = (fromR * invMorph + toR * morphProgress) * twinkle;
        col[i + 1] = (fromG * invMorph + toG * morphProgress) * twinkle;
        col[i + 2] = (fromB * invMorph + toB * morphProgress) * twinkle;
      }
    }

    geometryRef.current.attributes.position.needsUpdate = true;
    if (updateColors) geometryRef.current.attributes.color.needsUpdate = true;

    const isMobile = viewport.width < 6;
    const baseY = -viewport.height * 0.05;
    const rightOffset = viewport.width * 0.22;
    const leftOffset = viewport.width * 0.32;

    let currentTargetX = 0;
    let nextTargetX = 0;

    if (stage === 1 || stage === 5) currentTargetX = rightOffset;
    if (stage === 3 || stage === 7) currentTargetX = -leftOffset;

    if (nextStage === 1 || nextStage === 5) nextTargetX = rightOffset;
    if (nextStage === 3 || nextStage === 7) nextTargetX = -leftOffset;

    const blendedX = lerp(currentTargetX, nextTargetX, morphProgress);

    pointsRef.current.position.x = lerp(
      pointsRef.current.position.x,
      isMobile ? 0 : blendedX,
      quality.positionLerp
    );

    pointsRef.current.position.y = lerp(
      pointsRef.current.position.y,
      baseY,
      quality.positionLerp
    );

    if (isModelStage) {
      pointsRef.current.rotation.y += quality.rotationSpeed;
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

MODEL_URLS.forEach((url) => {
  useGLTF.preload(url);
});

export default function App({ onReady }) {
  const [quality, setQuality] = useState(() => getQualitySettings());

  useEffect(() => {
    let rafId = null;

    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setQuality(getQualitySettings());
      });
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
          dpr={quality.dpr}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
          }}
          camera={{ position: [2.6, 0.8, 4], fov: 50 }}
        >
          <ambientLight intensity={0.25} />

          <directionalLight position={[-2, 9, -1]} intensity={1.4} color="#fe6344" />
          <directionalLight position={[4, -2, -6]} intensity={0.7} color="#6b7cff" />
          <directionalLight position={[0, 3, 6]} intensity={0.5} />

          <AsteroidField />
          <ParticleModel onReady={onReady} quality={quality} />

          <EffectComposer multisampling={0} disableNormalPass>
            <Bloom intensity={quality.bloom} luminanceThreshold={0} />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
