'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 44%', 'center 33%'],
  });

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const pathOffset = useTransform(scrollYProgress, [0, 1], [pathLength, 0]);

  const step1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 1, 1]);
  const step2Opacity = useTransform(
    scrollYProgress,
    [0.25, 0.45, 0.55],
    [0, 1, 1]
  );
  const step3Opacity = useTransform(scrollYProgress, [0.5, 0.7, 1], [0, 1, 1]);

  const steps = [
    {
      number: 1,
      title: 'AI queries content through a Faith Connection-enabled app',
      opacity: step1Opacity,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      number: 2,
      title: 'Faith Connection tracks usage in real-time',
      opacity: step2Opacity,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      number: 3,
      title: 'Creators receive micropayments instantly',
      opacity: step3Opacity,
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-32 md:py-48 bg-gradient-to-b from-background via-card to-background overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
            The Journey of Every Request
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how content requests flow through our system, creating value
            at every step
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 min-h-[600px]">
          {/* Left Column: Steps */}
          <div className="flex flex-col justify-center space-y-12">
            {steps.map((step) => (
              <motion.div
                key={step.number}
                style={{ opacity: step.opacity }}
                className="flex items-start gap-6"
                data-testid={`step-${step.number}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-2xl font-heading font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-primary">{step.icon}</div>
                  </div>
                  <p className="text-base md:text-lg text-foreground leading-relaxed">
                    {step.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Circuit Animation */}
          <div className="relative hidden md:flex items-center justify-center">
            <svg
              className="w-full h-full max-w-md"
              viewBox="0 0 400 600"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id="pathGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity="0.5"
                  />
                  <stop
                    offset="50%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity="0.5"
                  />
                </linearGradient>

                <filter
                  id="sparkGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Vertical circuit path with curves */}
              <motion.path
                ref={pathRef}
                d="M 200 50 
                   L 200 120
                   Q 200 150, 230 150
                   L 270 150
                   Q 300 150, 300 180
                   L 300 220
                   Q 300 250, 270 250
                   L 130 250
                   Q 100 250, 100 280
                   L 100 320
                   Q 100 350, 130 350
                   L 270 350
                   Q 300 350, 300 380
                   L 300 420
                   Q 300 450, 270 450
                   L 230 450
                   Q 200 450, 200 480
                   L 200 550"
                stroke="url(#pathGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={pathLength}
                strokeDashoffset={pathOffset}
                opacity="0.6"
              />

              {/* Stationary glowing dots at key positions */}
              <g>
                <circle
                  cx="200"
                  cy="150"
                  r="12"
                  fill="hsl(var(--primary))"
                  filter="url(#sparkGlow)"
                  opacity="0.8"
                  data-testid="dot-1"
                />
                <circle
                  cx="200"
                  cy="150"
                  r="6"
                  fill="hsl(var(--primary))"
                  opacity="1"
                />
              </g>

              <g>
                <circle
                  cx="200"
                  cy="300"
                  r="14"
                  fill="hsl(var(--primary))"
                  filter="url(#sparkGlow)"
                  opacity="0.8"
                  data-testid="dot-2"
                />
                <circle
                  cx="200"
                  cy="300"
                  r="7"
                  fill="hsl(var(--primary))"
                  opacity="1"
                />
              </g>

              <g>
                <circle
                  cx="200"
                  cy="450"
                  r="12"
                  fill="hsl(var(--chart-2))"
                  filter="url(#sparkGlow)"
                  opacity="0.8"
                  data-testid="dot-3"
                />
                <circle
                  cx="200"
                  cy="450"
                  r="6"
                  fill="hsl(var(--chart-2))"
                  opacity="1"
                />
              </g>

              {/* Decorative nodes at endpoints */}
              <circle
                cx="200"
                cy="50"
                r="8"
                fill="hsl(var(--chart-1))"
                opacity="0.4"
              />
              <circle
                cx="200"
                cy="550"
                r="8"
                fill="hsl(var(--chart-2))"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
