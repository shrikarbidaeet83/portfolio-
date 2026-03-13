"use client";

import ParticleSection from "./components/particles/ParticleSection";
import TextOverlay from "./components/particles/TextOverlay";
import Preloader from "./components/Preloader";
import { useEffect, useState } from "react";

const MIN_PRELOADER_MS = 3000;

export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, MIN_PRELOADER_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sceneReady || !minTimeElapsed) return;

    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [sceneReady, minTimeElapsed]);

  return (
    <>
      {showPreloader && <Preloader isReady={sceneReady} />}

      <div style={{ position: "relative", width: "100%" }}>
        <ParticleSection onReady={() => setSceneReady(true)} />
        <TextOverlay />
      </div>
    </>
  );
}
