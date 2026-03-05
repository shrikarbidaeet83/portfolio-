import { useEffect, useState } from "react";
import "./preloader.css";

import runnerGif from "../assets/W0gD.gif";
import bullGif from "../assets/bull.gif";
import tunnelImg from "../assets/tunnel2.png";

export default function Preloader({ isReady = false }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // use a requestAnimationFrame loop so the percentage can advance smoothly
    const duration = 7000;
    const start = performance.now();
    let frame = 0;

    const tick = (now) => {
      if (isReady) {
        // once the 3D scene is ready we can immediately finish
        setProgress(100);
        return;
      }

      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 95);
      setProgress((prev) => Math.max(prev, pct));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
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
