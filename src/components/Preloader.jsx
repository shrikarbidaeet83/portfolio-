import { useEffect, useState } from "react";
import "./preloader.css";

import runnerGif from "../assets/W0gD.gif";
import bullGif from "../assets/bull.gif";
import tunnelImg from "../assets/tunnel2.png";

export default function Preloader({ isReady = false }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 7000;
    const start = Date.now();

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (isReady) return 100;

        const elapsed = Date.now() - start;
        // Move naturally but hold before completion until 3D scene is ready.
        const pct = Math.min((elapsed / duration) * 100, 95);
        return Math.max(prev, pct);
      });
    }, 50);

    return () => {
      clearInterval(progressTimer);
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
      <div className="progress-fill" style={{ width: `${progress}%` }} />
    </div>
  </div>
</div>

  );
}
