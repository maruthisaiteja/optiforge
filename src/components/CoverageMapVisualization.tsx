"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, ShieldAlert, Radio, Battery, Crosshair } from "lucide-react";

interface Robot {
  id: string;
  name: string;
  x: number;
  y: number;
  battery: number;
  color: string;
  status: "patrolling" | "assisting" | "returning";
}

export default function CoverageMapVisualization() {
  const GRID_SIZE = 8;
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(0);
  const [collapsedZones, setCollapsedZones] = useState<[number, number][]>([
    [2, 3],
    [3, 3],
    [5, 5],
    [6, 2],
  ]);
  const [survivorFound] = useState<[number, number] | null>([4, 6]);
  const [survivorRescued, setSurvivorRescued] = useState(false);

  const [robots, setRobots] = useState<Robot[]>([
    { id: "r1", name: "Drone-Alpha", x: 1, y: 1, battery: 94, color: "#2FE6D6", status: "patrolling" },
    { id: "r2", name: "Rover-Beta", x: 6, y: 1, battery: 88, color: "#7B5CFA", status: "patrolling" },
    { id: "r3", name: "Scout-Gamma", x: 1, y: 6, battery: 82, color: "#E15A2C", status: "patrolling" },
    { id: "r4", name: "Relay-Delta", x: 5, y: 6, battery: 91, color: "#22c55e", status: "assisting" },
  ]);

  const [exploredCells, setExploredCells] = useState<Set<string>>(
    new Set(["1,1", "6,1", "1,6", "5,6", "0,0", "0,1", "1,0"])
  );

  // Simulation tick
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setStep((s) => s + 1);

      setRobots((prevRobots) =>
        prevRobots.map((r) => {
          let nextX = r.x;
          let nextY = r.y;

          // If survivor found at (4,6) and r4 is near, converge
          if (survivorFound && !survivorRescued && r.id === "r4") {
            if (nextX < survivorFound[0]) nextX++;
            else if (nextX > survivorFound[0]) nextX--;
            else if (nextY < survivorFound[1]) nextY++;
            else if (nextY > survivorFound[1]) nextY--;
            else setSurvivorRescued(true);
          } else {
            // Random walk avoiding obstacles
            const dx = Math.floor(Math.random() * 3) - 1;
            const dy = Math.floor(Math.random() * 3) - 1;
            const targetX = Math.max(0, Math.min(GRID_SIZE - 1, r.x + dx));
            const targetY = Math.max(0, Math.min(GRID_SIZE - 1, r.y + dy));

            // Check if not an obstacle
            const isObstacle = collapsedZones.some(([cx, cy]) => cx === targetX && cy === targetY);
            if (!isObstacle) {
              nextX = targetX;
              nextY = targetY;
            }
          }

          // Mark explored
          setExploredCells((set) => new Set(set).add(`${nextX},${nextY}`));

          return {
            ...r,
            x: nextX,
            y: nextY,
            battery: Math.max(10, r.battery - 0.2),
          };
        })
      );
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying, collapsedZones, survivorFound, survivorRescued]);

  const toggleObstacleShift = () => {
    setCollapsedZones((prev) => [
      ...prev,
      [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1],
    ]);
  };

  const coveragePercent = Math.round((exploredCells.size / (GRID_SIZE * GRID_SIZE)) * 100);

  return (
    <div className="rounded-3xl bg-bg-card/90 border border-teal-accent/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-accent/15 border border-teal-accent/40 flex items-center justify-center text-teal-accent">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-brand-white">
                Problem 5 Flagship Showcase
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-electric-violet/20 text-electric-violet border border-electric-violet/30 font-semibold">
                SWARM TELEMETRY
              </span>
            </div>
            <p className="text-xs text-brand-muted font-sans">
              Autonomous Multi-Robot Disaster Zone Exploration & Dynamic Replanning
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-navy-deep border border-navy-border text-xs text-brand-white flex items-center gap-1.5 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-orange-accent" /> : <Play className="w-3.5 h-3.5 text-status-green" />}
            <span>{isPlaying ? "Pause" : "Resume"}</span>
          </button>
          <button
            onClick={toggleObstacleShift}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulate Shift (Debris Collapse)</span>
          </button>
        </div>
      </div>

      {/* Main interactive visualization grid + telemetry panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* The 8x8 Grid */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-bg-primary/90 border border-navy-border shadow-inner w-full max-w-md aspect-square grid grid-cols-8 gap-1.5 relative">
            {Array.from({ length: GRID_SIZE }).map((_, rIdx) =>
              Array.from({ length: GRID_SIZE }).map((_, cIdx) => {
                const cellKey = `${cIdx},${rIdx}`;
                const isExplored = exploredCells.has(cellKey);
                const isObstacle = collapsedZones.some(([cx, cy]) => cx === cIdx && cy === rIdx);
                const isSurvivor = survivorFound && survivorFound[0] === cIdx && survivorFound[1] === rIdx;
                const robotsHere = robots.filter((r) => r.x === cIdx && r.y === rIdx);

                let cellBg = "bg-bg-secondary/40 border-navy-border/40";
                if (isObstacle) cellBg = "bg-red-950/60 border-red-700/60 text-red-400 shadow-inner";
                else if (isSurvivor) cellBg = "bg-teal-500/30 border-teal-accent text-teal-accent animate-pulse";
                else if (isExplored) cellBg = "bg-navy-deep/60 border-teal-accent/20";

                return (
                  <div
                    key={cellKey}
                    className={`rounded-lg transition-all duration-300 relative flex items-center justify-center text-[10px] font-mono border ${cellBg}`}
                  >
                    {isObstacle && <span className="text-red-500 font-bold">✕</span>}
                    {isSurvivor && !isObstacle && <Crosshair className="w-3.5 h-3.5 text-teal-accent" />}

                    {/* Robot Indicators */}
                    {robotsHere.map((bot) => (
                      <div
                        key={bot.id}
                        style={{ backgroundColor: bot.color }}
                        title={`${bot.name} (${Math.round(bot.battery)}% batt)`}
                        className="w-3.5 h-3.5 rounded-full shadow-glow absolute -top-0.5 -right-0.5 flex items-center justify-center text-[8px] font-bold text-bg-primary"
                      >
                        {bot.name[0]}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 flex items-center justify-between w-full max-w-md text-[11px] font-mono text-brand-muted px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-accent/20 border border-teal-accent" /> Explored
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-950/80 border border-red-700" /> Hazard Zone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-500/30 border border-teal-accent" /> Survivor Ping
            </span>
          </div>
        </div>

        {/* Telemetry Metrics & Dynamic Status */}
        <div className="lg:col-span-5 space-y-4">
          {/* Swarm Coverage Progress */}
          <div className="p-4 rounded-xl bg-bg-secondary/80 border border-navy-border/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-brand-muted">Total Area Coverage</span>
              <span className="text-teal-accent font-bold">{coveragePercent}% ({exploredCells.size}/64)</span>
            </div>
            <div className="w-full bg-navy-deep rounded-full h-2">
              <div
                className="bg-gradient-signature h-full rounded-full transition-all duration-500"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </div>

          {/* Active Swarm Robot List */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-dim block">
              Swarm Node Health & Battery
            </span>
            <div className="grid grid-cols-2 gap-2">
              {robots.map((bot) => (
                <div
                  key={bot.id}
                  className="p-2.5 rounded-lg bg-bg-secondary/60 border border-navy-border/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: bot.color }}
                    />
                    <span className="font-mono text-[11px] text-brand-white truncate max-w-[80px]">
                      {bot.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-brand-muted">
                    <Battery className="w-3 h-3 text-status-green" />
                    <span>{Math.round(bot.battery)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Stream Log */}
          <div className="p-3.5 rounded-xl bg-bg-primary/90 border border-navy-border text-xs font-mono space-y-1.5 max-h-32 overflow-y-auto">
            <div className="text-[10px] text-brand-dim uppercase tracking-wider">Swarm Coordination Log</div>
            <div className="text-teal-accent text-[11px]">
              • Step {step}: Coverage at {coveragePercent}% across disaster zone.
            </div>
            {survivorRescued ? (
              <div className="text-status-green text-[11px] font-bold">
                ✓ Survivor at (4,6) reached by Relay-Delta. Escort protocol initiated!
              </div>
            ) : (
              <div className="text-orange-accent text-[11px]">
                ⚠ Acoustic ping at (4,6). Relay-Delta re-routing trajectory.
              </div>
            )}
            {collapsedZones.length > 4 && (
              <div className="text-red-400 text-[11px]">
                ⚠ Dynamic shift: Additional debris collapse detected. Replanning paths.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}