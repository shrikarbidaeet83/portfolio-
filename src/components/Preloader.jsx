import { useEffect, useState } from "react";
import "./preloader.css";

import runnerGif from "../assets/W0gD.gif";
import bullGif from "../assets/bull.gif";
import tunnelImg from "../assets/tunnel2.webp";

export default function Preloader({ isReady = false }) {
  const [progress, setProgress] = useState(0);

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
    }, 50);

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
        <img className="runner" src={runnerGif} alt="" />
        <img className="bull" src={bullGif} alt="" />
      </div>

      <div className="progress-wrap">
        <p className="progress-text">{Math.round(progress)}%</p>
        <div className="progress-line">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
