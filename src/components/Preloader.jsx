import { useEffect, useState } from "react";
import "./preloader.css";

import runnerGif from "../assets/W0gD.gif";
import bullGif from "../assets/bull.gif";
import tunnelImg from "../assets/tunnel2.png";

export default function Preloader({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const start = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
    }, 50);

    const timer = setTimeout(() => {
      setProgress(100);
      setVisible(false);
      onFinish?.();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, []);

  if (!visible) return null;

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
