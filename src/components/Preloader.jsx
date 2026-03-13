import { useEffect, useState } from "react";
import "./preloader.css";

import runnerGif from "../assets/W0gD.gif";
import bullGif from "../assets/bull.gif";
import tunnelImg from "../assets/tunnel2.webp";

export default function Preloader({ isReady = false }) {
  const [progress, setProgress] = useState(0);
  const [runnerLoaded, setRunnerLoaded] = useState(false);
  const [bullLoaded, setBullLoaded] = useState(false);
  const [liteMode] = useState(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return false;
    }
    const width = window.innerWidth || 0;
    const memory = navigator.deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 8;
    return width < 900 || memory <= 6 || cores <= 6;
  });
  const spritesReady = liteMode || (runnerLoaded && bullLoaded);

  useEffect(() => {
    if (isReady) {
      const completeId = setTimeout(() => {
        setProgress(100);
      }, 0);
      return () => clearTimeout(completeId);
    }

    // Use a lightweight timer instead of per-frame React updates.
    const duration = 3000;
    const start = performance.now();
    const timerId = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(Math.round((elapsed / duration) * 95), 95);
      setProgress((prev) => (pct > prev ? pct : prev));
    }, 80);

    return () => {
      clearInterval(timerId);
    };
  }, [isReady]);

  return (
    <div className="preloader">
      <h1 className="loading-text">
        Loading<span className="loading-dots">...</span>
      </h1>

      <div className="marquee">
        <img className="tunnel" src={tunnelImg} alt="" />
        {!liteMode && (
          <img
            className={`runner ${spritesReady ? "is-running" : ""}`}
            src={runnerGif}
            alt=""
            loading="eager"
            onLoad={() => setRunnerLoaded(true)}
          />
        )}
        {!liteMode && (
          <img
            className={`bull ${spritesReady ? "is-running" : ""}`}
            src={bullGif}
            alt=""
            loading="eager"
            onLoad={() => setBullLoaded(true)}
          />
        )}
      </div>

      <div className="progress-wrap">
        <p className="progress-text">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
