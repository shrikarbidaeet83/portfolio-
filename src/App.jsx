"use client";

import ParticleSection from "./components/particles/ParticleSection";
import TextOverlay from "./components/particles/TextOverlay";
import Preloader from "./components/Preloader";
import { useCallback, useEffect, useState } from "react";

const MIN_PRELOADER_MS = 5000;
const READY_SETTLE_MS = 900;

export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [readySettled, setReadySettled] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, MIN_PRELOADER_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sceneReady) return;

    let rafA = 0;
    let rafB = 0;
    let settleTimer = 0;
    let idleHandle = 0;
    let cancelled = false;

    const markSettled = () => {
      if (!cancelled) setReadySettled(true);
    };

    rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        if ("requestIdleCallback" in window) {
          idleHandle = window.requestIdleCallback(
            () => {
              settleTimer = window.setTimeout(markSettled, READY_SETTLE_MS);
            },
            { timeout: READY_SETTLE_MS },
          );
        } else {
          settleTimer = window.setTimeout(markSettled, READY_SETTLE_MS);
        }
      });
    });

    return () => {
      cancelled = true;
      if (rafA) cancelAnimationFrame(rafA);
      if (rafB) cancelAnimationFrame(rafB);
      if (settleTimer) clearTimeout(settleTimer);
      if (idleHandle && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, [sceneReady]);

  useEffect(() => {
    if (!sceneReady || !minTimeElapsed || !readySettled) return;

    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [sceneReady, minTimeElapsed, readySettled]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = showPreloader ? "hidden" : "";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showPreloader]);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  return (
    <>
      {showPreloader && <Preloader isReady={sceneReady} />}

      <div style={{ position: "relative", width: "100%" }}>
        <ParticleSection onReady={handleSceneReady} />
        {!showPreloader && <TextOverlay />}
      </div>
    </>
  );
}
