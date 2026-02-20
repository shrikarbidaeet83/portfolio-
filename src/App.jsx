"use client";

// import HeroSection from "./components/navbar/HeroSection";
import ParticleSection from "./components/particles/ParticleSection";
import TextOverlay from "./components/particles/TextOverlay";
import Preloader from "./components/Preloader";
import { useEffect, useState } from "react";



export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    if (!sceneReady) return;

    // Let progress hit 100% before removing preloader.
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [sceneReady]);

  return (
    <>
      {showPreloader && <Preloader isReady={sceneReady} />}

      <div style={{ position: "relative", width: "100%" }}>
        {/* <HeroSection /> */}
        <ParticleSection onReady={() => setSceneReady(true)} />
        <TextOverlay />
      </div>
    </>
  );
}
