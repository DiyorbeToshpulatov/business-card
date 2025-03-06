'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}

interface Puddle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  growthRate: number;
  maxSize: number;
}

interface Lightning {
  opacity: number;
  duration: number;
  color: string;
}

interface ThunderBolt {
  points: { x: number; y: number }[];
  width: number;
  opacity: number;
  color: string;
  branches: ThunderBolt[];
  lifespan: number;
  currentLife: number;
}

interface FogParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface WeatherState {
  windIntensity: number;
  windDirection: number;
  rainIntensity: number;
  fogIntensity: number;
  thunderProbability: number;
}

export default function WeatherEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const reflectionCanvasRef = useRef<HTMLCanvasElement>(null);

  const [lightning, setLightning] = useState<Lightning>({
    opacity: 0,
    duration: 0,
    color: 'rgba(200, 230, 255, 0.8)',
  });

  const rainDropsRef = useRef<RainDrop[]>([]);
  const puddlesRef = useRef<Puddle[]>([]);
  const fogParticlesRef = useRef<FogParticle[]>([]);
  const thunderBoltsRef = useRef<ThunderBolt[]>([]);

  const requestRef = useRef<number>();
  const fogRequestRef = useRef<number>();
  const reflectionRequestRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const weatherTransitionRef = useRef<NodeJS.Timeout>();

  const audioRef = useRef<HTMLAudioElement>(null);
  const rainAudioRef = useRef<HTMLAudioElement>(null);

  const [audioLoaded, setAudioLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [weatherState, setWeatherState] = useState<WeatherState>({
    windIntensity: 0.2,
    windDirection: Math.PI / 6, // Slight angle
    rainIntensity: 0.15,
    fogIntensity: 0.3,
    thunderProbability: 0.7,
  });

  // Track time for animations
  const timeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Initialize rain drops
  useEffect(() => {
    const initRainDrops = () => {
      const rainDrops: RainDrop[] = [];
      // Density based on rain intensity
      const dropCount = Math.floor(
        window.innerWidth * weatherState.rainIntensity
      );

      for (let i = 0; i < dropCount; i++) {
        // Create more varied and subtle raindrops
        rainDrops.push(createRaindrop());
      }

      rainDropsRef.current = rainDrops;
    };

    const initPuddles = () => {
      const puddles: Puddle[] = [];
      const puddleCount = Math.floor(window.innerWidth / 200); // One puddle per 200px width

      for (let i = 0; i < puddleCount; i++) {
        puddles.push({
          x: Math.random() * window.innerWidth,
          y: window.innerHeight - 10 - Math.random() * 20,
          size: Math.random() * 5 + 5,
          opacity: 0.05 + Math.random() * 0.05,
          growthRate: 0.01 + Math.random() * 0.02,
          maxSize: 30 + Math.random() * 70,
        });
      }

      puddlesRef.current = puddles;
    };

    const initFogParticles = () => {
      const fogParticles: FogParticle[] = [];
      const particleCount = Math.floor(
        (window.innerWidth * weatherState.fogIntensity) / 10
      );

      for (let i = 0; i < particleCount; i++) {
        fogParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 100 + 50,
          opacity: Math.random() * 0.05 + 0.02,
          speed: Math.random() * 0.2 + 0.1,
        });
      }

      fogParticlesRef.current = fogParticles;
    };

    initRainDrops();
    initPuddles();
    initFogParticles();

    const handleResize = () => {
      initRainDrops();
      initPuddles();
      initFogParticles();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [weatherState.rainIntensity, weatherState.fogIntensity]);

  // Helper function to create a raindrop
  const createRaindrop = (atTop = false) => {
    const windAngle = weatherState.windDirection;
    const dropAngle = Math.PI / 2 + windAngle + (Math.random() * 0.2 - 0.1);

    return {
      x: Math.random() * window.innerWidth,
      y: atTop ? -20 : Math.random() * window.innerHeight,
      length: Math.random() * 6 + 4 + weatherState.rainIntensity * 10, // Longer drops in heavier rain
      speed: Math.random() * 8 + 6 + weatherState.rainIntensity * 10, // Faster drops in heavier rain
      opacity: Math.random() * 0.15 + 0.1 + weatherState.rainIntensity * 0.2, // More visible in heavier rain
      angle: dropAngle,
    };
  };

  // Load audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      setAudioLoaded(true);
    }

    if (rainAudioRef.current) {
      rainAudioRef.current.volume = 0.2;
      rainAudioRef.current.loop = true;
      rainAudioRef.current
        .play()
        .catch(e => console.log('Rain audio play failed:', e));
    }

    return () => {
      if (rainAudioRef.current) {
        rainAudioRef.current.pause();
      }
    };
  }, []);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Dynamic weather transitions
  useEffect(() => {
    const transitionWeather = () => {
      // Gradually change weather parameters
      setWeatherState(prev => {
        // Random changes to weather parameters
        const newWindIntensity = Math.min(
          Math.max(prev.windIntensity + (Math.random() * 0.2 - 0.1), 0.1),
          0.5
        );
        const newWindDirection =
          prev.windDirection + (Math.random() * 0.2 - 0.1);
        const newRainIntensity = Math.min(
          Math.max(prev.rainIntensity + (Math.random() * 0.1 - 0.05), 0.1),
          0.3
        );
        const newFogIntensity = Math.min(
          Math.max(prev.fogIntensity + (Math.random() * 0.1 - 0.05), 0.1),
          0.5
        );
        const newThunderProbability = Math.min(
          Math.max(prev.thunderProbability + (Math.random() * 0.2 - 0.1), 0.5),
          0.9
        );

        return {
          windIntensity: newWindIntensity,
          windDirection: newWindDirection,
          rainIntensity: newRainIntensity,
          fogIntensity: newFogIntensity,
          thunderProbability: newThunderProbability,
        };
      });

      // Update rain audio volume based on intensity
      if (rainAudioRef.current) {
        rainAudioRef.current.volume = 0.1 + weatherState.rainIntensity * 0.3;
      }

      // Schedule next transition
      weatherTransitionRef.current = setTimeout(
        transitionWeather,
        10000 + Math.random() * 20000
      );
    };

    // Start weather transitions
    weatherTransitionRef.current = setTimeout(transitionWeather, 15000);

    return () => {
      if (weatherTransitionRef.current) {
        clearTimeout(weatherTransitionRef.current);
      }
    };
  }, [weatherState]);

  // Create a thunder bolt with fractal patterns
  const createThunderBolt = (
    startX: number,
    startY: number,
    endY: number,
    width: number,
    color: string,
    branchChance = 0.5,
    complexity = 1
  ): ThunderBolt => {
    const points = [{ x: startX, y: startY }];
    let currentY = startY;

    // More segments for more complex bolts
    const segments = Math.floor(Math.random() * 5 * complexity) + 5;
    const segmentHeight = (endY - startY) / segments;

    // Fractal pattern - more jagged with higher complexity
    for (let i = 0; i < segments; i++) {
      currentY += segmentHeight;
      // Jitter increases with complexity
      const jitter = (Math.random() * 100 - 50) * complexity;
      points.push({
        x: startX + jitter,
        y: currentY,
      });
    }

    const branches: ThunderBolt[] = [];

    // Create branches with decreasing probability
    if (width > 1 && Math.random() < branchChance) {
      const branchCount = Math.floor(Math.random() * 2 * complexity) + 1;

      for (let i = 0; i < branchCount; i++) {
        const branchPoint = Math.floor(Math.random() * (points.length - 2)) + 1;
        const branchStartX = points[branchPoint].x;
        const branchStartY = points[branchPoint].y;
        const branchEndY =
          branchStartY + (endY - branchStartY) * (0.3 + Math.random() * 0.5);

        branches.push(
          createThunderBolt(
            branchStartX,
            branchStartY,
            branchEndY,
            width * 0.6,
            color,
            branchChance * 0.5,
            complexity * 0.8 // Reduce complexity for branches
          )
        );
      }
    }

    return {
      points,
      width,
      opacity: 0.8 + Math.random() * 0.2,
      color,
      branches,
      lifespan: 100 + Math.random() * 150,
      currentLife: 0,
    };
  };

  // Animation loop for rain and thunder
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = (timestamp: number) => {
      // Calculate delta time for smooth animations
      const deltaTime = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      timeRef.current += deltaTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw rain with a more subtle effect
      ctx.strokeStyle = '#a0b0c0'; // Lighter color for rain
      ctx.lineWidth = 0.5; // Thinner lines

      // Interactive ripple effect around mouse
      const rippleRadius = 100;
      const rippleStrength = 20;

      for (let i = 0; i < rainDropsRef.current.length; i++) {
        const drop = rainDropsRef.current[i];

        // Calculate distance from mouse
        const dx = drop.x - mousePosition.x;
        const dy = drop.y - mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply ripple effect if close to mouse
        let dropX = drop.x;
        let dropY = drop.y;

        if (distance < rippleRadius) {
          const force = (1 - distance / rippleRadius) * rippleStrength;
          dropX += (dx / distance) * force;
          dropY += (dy / distance) * force;
        }

        ctx.beginPath();
        // Calculate end point based on angle for a more realistic rain effect
        const endX = dropX + Math.cos(drop.angle) * drop.length;
        const endY = dropY + Math.sin(drop.angle) * drop.length;

        ctx.moveTo(dropX, dropY);
        ctx.lineTo(endX, endY);
        ctx.globalAlpha = drop.opacity;
        ctx.stroke();

        // Update position with angle and wind
        const windEffect =
          Math.sin(timeRef.current / 1000) * 0.2 * weatherState.windIntensity;
        drop.x += Math.cos(drop.angle + windEffect) * drop.speed * 0.1;
        drop.y += Math.sin(drop.angle) * drop.speed;

        // Reset rain drop when it goes off screen
        if (drop.y > canvas.height || drop.x < 0 || drop.x > canvas.width) {
          // Create a new drop at the top
          const newDrop = createRaindrop(true);
          rainDropsRef.current[i] = newDrop;

          // Chance to create a splash when a drop hits the bottom
          if (drop.y > canvas.height && Math.random() < 0.1) {
            createSplash(drop.x, canvas.height - 5);
          }
        }
      }

      // Add some very subtle splashes at the bottom
      ctx.fillStyle = 'rgba(150, 150, 150, 0.15)'; // More transparent
      for (let i = 0; i < 15; i++) {
        // Fewer splashes
        const size = Math.random() * 2 + 0.5; // Smaller splashes
        ctx.globalAlpha = Math.random() * 0.1; // More transparent
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          canvas.height - 5,
          size,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Draw puddles
      ctx.fillStyle = 'rgba(150, 170, 190, 0.1)';
      for (let i = 0; i < puddlesRef.current.length; i++) {
        const puddle = puddlesRef.current[i];

        // Grow puddles over time
        if (puddle.size < puddle.maxSize) {
          puddle.size += puddle.growthRate * (weatherState.rainIntensity * 2);
        }

        // Ripple effect
        const rippleSize = puddle.size + Math.sin(timeRef.current / 500) * 2;

        ctx.globalAlpha = puddle.opacity;
        ctx.beginPath();
        ctx.ellipse(
          puddle.x,
          puddle.y,
          rippleSize,
          rippleSize * 0.3, // Flatter ellipse
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Draw thunder bolts
      thunderBoltsRef.current = thunderBoltsRef.current.filter(bolt => {
        bolt.currentLife++;

        if (bolt.currentLife > bolt.lifespan) {
          return false;
        }

        // Calculate fade in/out
        let opacity = bolt.opacity;
        if (bolt.currentLife < bolt.lifespan * 0.2) {
          // Fade in
          opacity = (bolt.currentLife / (bolt.lifespan * 0.2)) * bolt.opacity;
        } else if (bolt.currentLife > bolt.lifespan * 0.6) {
          // Fade out
          opacity =
            bolt.opacity *
            (1 -
              (bolt.currentLife - bolt.lifespan * 0.6) / (bolt.lifespan * 0.4));
        }

        // Draw the main bolt
        drawBolt(ctx, bolt, opacity);

        return true;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    const createSplash = (x: number, y: number) => {
      // Add a splash effect
      ctx.fillStyle = 'rgba(150, 170, 190, 0.2)';
      ctx.globalAlpha = 0.2;

      // Draw a small circle
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBolt = (
      ctx: CanvasRenderingContext2D,
      bolt: ThunderBolt,
      opacity: number
    ) => {
      if (bolt.points.length < 2) return;

      ctx.strokeStyle = bolt.color;
      ctx.lineWidth = bolt.width;
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);

      for (let i = 1; i < bolt.points.length; i++) {
        ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      }

      ctx.stroke();

      // Draw a glow effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = bolt.width * 0.5;
      ctx.globalAlpha = opacity * 0.7;
      ctx.stroke();

      // Draw branches
      bolt.branches.forEach(branch => {
        drawBolt(ctx, branch, opacity * 0.8);
      });
    };

    lastFrameTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [
    mousePosition,
    weatherState,
    weatherState.rainIntensity,
    weatherState.windDirection,
    weatherState.fogIntensity,
  ]);

  // Fog animation on separate canvas
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animateFog = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw fog particles
      for (let i = 0; i < fogParticlesRef.current.length; i++) {
        const particle = fogParticlesRef.current[i];

        // Create a radial gradient for each fog particle
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size
        );

        gradient.addColorStop(0, `rgba(200, 200, 220, ${particle.opacity})`);
        gradient.addColorStop(1, 'rgba(200, 200, 220, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Move fog particles
        particle.x +=
          Math.cos(weatherState.windDirection) *
          particle.speed *
          weatherState.windIntensity;

        // Reset particles that go off screen
        if (particle.x > canvas.width + particle.size) {
          particle.x = -particle.size;
          particle.y = Math.random() * canvas.height;
        } else if (particle.x < -particle.size) {
          particle.x = canvas.width + particle.size;
          particle.y = Math.random() * canvas.height;
        }
      }

      // Enhance fog when lightning strikes
      if (lightning.opacity > 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${lightning.opacity * 0.2})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      fogRequestRef.current = requestAnimationFrame(animateFog);
    };

    fogRequestRef.current = requestAnimationFrame(animateFog);

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (fogRequestRef.current) {
        cancelAnimationFrame(fogRequestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [lightning.opacity, weatherState]);

  // Reflection effects on a third canvas
  useEffect(() => {
    const canvas = reflectionCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animateReflections = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Only draw reflections at the bottom of the screen
      const reflectionHeight = canvas.height * 0.3;
      const startY = canvas.height - reflectionHeight;

      // Create a gradient for the reflection area
      const gradient = ctx.createLinearGradient(0, startY, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(20, 20, 30, 0)');
      gradient.addColorStop(1, 'rgba(20, 20, 30, 0.15)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, startY, canvas.width, reflectionHeight);

      // Lightning reflection
      if (lightning.opacity > 0.1) {
        // Create a more intense reflection for lightning
        ctx.fillStyle = `rgba(255, 255, 255, ${lightning.opacity * 0.3})`;

        // Random reflection pattern
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * canvas.width;
          const width = 50 + Math.random() * 200;
          const height = 20 + Math.random() * 50;

          ctx.globalAlpha = lightning.opacity * (0.1 + Math.random() * 0.2);
          ctx.fillRect(x, startY + Math.random() * 50, width, height);
        }
      }

      reflectionRequestRef.current = requestAnimationFrame(animateReflections);
    };

    reflectionRequestRef.current = requestAnimationFrame(animateReflections);

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (reflectionRequestRef.current) {
        cancelAnimationFrame(reflectionRequestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [lightning.opacity, createThunderBolt]);

  // Lightning and thunder effect
  useEffect(() => {
    const triggerLightning = () => {
      // Only trigger lightning based on probability
      if (Math.random() > weatherState.thunderProbability) {
        // Schedule next check
        timeoutRef.current = setTimeout(
          triggerLightning,
          3000 + Math.random() * 5000
        );
        return;
      }

      // Choose a color - occasionally make it slightly purple/pink for a beautiful effect
      const isSpecial = Math.random() > 0.7;
      const baseColor = isSpecial
        ? `rgba(${200 + Math.random() * 55}, ${150 + Math.random() * 50}, ${
            230 + Math.random() * 25
          }, 0.8)`
        : `rgba(${200 + Math.random() * 55}, ${
            230 + Math.random() * 25
          }, ${255}, 0.8)`;

      // First flash
      setLightning({
        opacity: 0.6 + Math.random() * 0.3,
        duration: 50 + Math.random() * 50,
        color: baseColor,
      });

      // Create thunder bolts with varying complexity
      const boltCount = Math.floor(Math.random() * 3) + 1;
      const bolts: ThunderBolt[] = [];
      const complexity = 1 + Math.random() * 1.5; // Higher complexity for more detailed bolts

      for (let i = 0; i < boltCount; i++) {
        const startX = Math.random() * window.innerWidth;
        const bolt = createThunderBolt(
          startX,
          0,
          window.innerHeight * (0.3 + Math.random() * 0.5),
          2 + Math.random() * 3,
          isSpecial
            ? `rgba(${220 + Math.random() * 35}, ${
                180 + Math.random() * 40
              }, ${255}, 1)`
            : `rgba(${220 + Math.random() * 35}, ${
                220 + Math.random() * 35
              }, ${255}, 1)`,
          0.5,
          complexity
        );
        bolts.push(bolt);
      }

      thunderBoltsRef.current = [...thunderBoltsRef.current, ...bolts];

      // Play thunder sound with a slight delay
      if (audioLoaded && audioRef.current) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch(e => console.log('Audio play failed:', e));
          }
        }, 100 + Math.random() * 300);
      }

      // Secondary flashes
      setTimeout(() => {
        setLightning({
          opacity: 0.3 + Math.random() * 0.3,
          duration: 100 + Math.random() * 100,
          color: baseColor,
        });

        // Maybe a third flash
        if (Math.random() > 0.6) {
          setTimeout(() => {
            setLightning({
              opacity: 0.1 + Math.random() * 0.2,
              duration: 50 + Math.random() * 50,
              color: baseColor,
            });
          }, 100 + Math.random() * 200);
        }
      }, 50 + Math.random() * 100);

      // Schedule next lightning
      timeoutRef.current = setTimeout(
        triggerLightning,
        5000 + Math.random() * 15000 // Random interval between 5-20 seconds
      );
    };

    // Start the lightning effect
    timeoutRef.current = setTimeout(
      triggerLightning,
      2000 + Math.random() * 3000
    );

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [audioLoaded, weatherState.thunderProbability]);

  // Reset lightning opacity after flash
  useEffect(() => {
    if (lightning.opacity > 0) {
      const timer = setTimeout(() => {
        setLightning({ opacity: 0, duration: 0, color: lightning.color });
      }, lightning.duration);

      return () => clearTimeout(timer);
    }
  }, [lightning]);

  // Add a subtle fog/mist effect
  const fogStyle = {
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(200,200,220,0.03) 75%, rgba(200,200,220,0.05) 100%)',
    pointerEvents: 'none' as const,
    position: 'fixed' as const,
    inset: 0,
    zIndex: 5,
  };

  // Screen distortion effect when lightning strikes
  const distortionStyle = useMemo(
    () => ({
      filter:
        lightning.opacity > 0.3 ? `blur(${lightning.opacity * 2}px)` : 'none',
      transition: `filter ${lightning.duration * 0.5}ms ease-out`,
      position: 'fixed' as const,
      inset: 0,
      zIndex: 25,
      pointerEvents: 'none' as const,
    }),
    [lightning.opacity, lightning.duration]
  );

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-black/20"
        style={{
          backdropFilter: 'blur(1px)',
        }}
      />
      <div style={fogStyle} />

      {/* Reflection layer */}
      <canvas
        ref={reflectionCanvasRef}
        className="fixed inset-0 pointer-events-none z-5"
      />

      {/* Fog layer */}
      <canvas
        ref={fogCanvasRef}
        className="fixed inset-0 pointer-events-none z-8"
      />

      {/* Main rain and lightning layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
      />

      {/* Lightning flash effect */}
      <div
        className="fixed inset-0 pointer-events-none z-20 transition-opacity"
        style={{
          opacity: lightning.opacity,
          backgroundColor: lightning.color,
          transition: `opacity ${lightning.duration}ms ease-out`,
        }}
      />

      {/* Screen distortion effect */}
      <div style={distortionStyle} />

      {/* Audio elements */}
      <audio ref={audioRef} preload="auto">
        <source src="/thunder.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={rainAudioRef} preload="auto">
        <source src="/rain.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
}
