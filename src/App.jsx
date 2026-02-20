"use client";

// import HeroSection from "./components/navbar/HeroSection";
import ParticleSection from "./components/particles/ParticleSection";
import TextOverlay from "./components/particles/TextOverlay";
import Preloader from "./components/Preloader";
import { useState } from "react";



export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Preloader onFinish={() => setLoading(false)} />}

      {!loading && (
        <div style={{ position: "relative", width: "100%" }}>
          {/* <HeroSection /> */}
          <ParticleSection />
          <TextOverlay />


        </div>
      )}
    </>
  );
}
