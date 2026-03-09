"use client";

import * as React from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export function HeroParticles() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const options: ISourceOptions = React.useMemo(
    () => ({
      fullScreen: { enable: false },
      detectRetina: true,
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        number: { value: 80, density: { enable: true, width: 900, height: 900 } },
        color: { value: ["#0000fe", "#9fb0ff", "#ffffff"] },
        opacity: { value: { min: 0.15, max: 0.55 } },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          distance: 140,
          opacity: 0.18,
          color: "#0000fe",
          width: 1,
        },
        move: { enable: true, speed: 0.7, outModes: { default: "out" } },
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: { repulse: { distance: 110, duration: 0.2 } },
      },
    }),
    [],
  );

  if (!ready) return null;

  return (
    <Particles
      id="zentrfi-hero-particles"
      className="absolute inset-0"
      options={options}
      particlesLoaded={async () => {}}
    />
  );
}

