"use client";

import React from "react";
import { motion } from "framer-motion";

const AngleBox = ({
  children,
  className,
  type = "right",
}: {
  children: React.ReactNode;
  className?: string;
  type?: "left" | "right" | "both";
}) => {
  const points =
    type === "right"
      ? "1,1 84,1 99,50 84,99 1,99"
      : type === "left"
        ? "16,1 99,1 99,99 16,99 1,50"
        : "11,1 89,1 99,50 89,99 11,99 1,50";

  return (
    <div
      className={`relative min-w-[180px] h-[36px] flex items-center justify-center ${className}`}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polygon
          points={points}
          fill="#f0f4f0"
          stroke="#203f34"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
      </svg>
      <div className="relative z-10 px-6 text-[10px] font-bold uppercase tracking-widest text-deep-green/80">
        {children}
      </div>
    </div>
  );
};

const CornerBlock = ({
  title,
  position,
  children,
}: {
  title: string;
  position: "tl" | "tr" | "bl" | "br";
  children?: React.ReactNode;
}) => {
  const isLeft = position.includes("l");
  const isTop = position.includes("t");

  // Path for concave corner
  // TL: Cut out bottom-right
  // TR: Cut out bottom-left
  // BL: Cut out top-right
  // BR: Cut out top-left
  const getPath = () => {
    if (position === "tl") return "M 0 0 H 220 V 60 Q 220 140 140 140 H 0 Z";
    if (position === "tr") return "M 220 0 H 0 V 60 Q 0 140 80 140 H 220 Z";
    if (position === "bl") return "M 0 140 H 220 V 80 Q 220 0 140 0 H 0 Z";
    if (position === "br") return "M 220 140 H 0 V 80 Q 0 0 80 0 H 220 Z";
    return "";
  };

  return (
    <div
      className={`absolute ${isTop ? "top-0" : "bottom-0"} ${isLeft ? "left-0" : "right-0"} w-[220px] h-[140px]`}
    >
      <svg
        width="220"
        height="140"
        viewBox="0 0 220 140"
        className="drop-shadow-sm"
      >
        <defs>
          <pattern
            id="linePattern"
            x="0"
            y="0"
            width="220"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="220"
              y2="0"
              stroke="#203f34"
              strokeWidth="2"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <path
          d={getPath()}
          fill="#d9e4d9"
          stroke="#203f34"
          strokeWidth="2"
          strokeOpacity="1"
        />
        <path d={getPath()} fill="url(#linePattern)" />
        <text
          x={isLeft ? 40 : 180}
          y={isTop ? 40 : 110}
          textAnchor={isLeft ? "start" : "end"}
          className="text-2xl font-serif fill-deep-green tracking-widest uppercase"
          style={{ letterSpacing: "0.2em" }}
        >
          {title}
        </text>
      </svg>
      {children}
    </div>
  );
};

const ParetoRoles = () => {
  return (
    <section className="py-40 px-6 bg-[#d9e4d9] relative overflow-hidden min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <h2 className="text-5xl font-serif text-deep-green text-center mb-40">
          The Pareto Ecosystem
        </h2>

        <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center scale-110 lg:scale-125">
          {/* Central Credit Vault */}
          <div className="relative z-10 w-[380px] h-[380px] flex items-center justify-center">
            {/* Outer Rings */}
            <div className="absolute inset-0 rounded-full border border-black/10"></div>
            <div className="absolute inset-[10px] rounded-full border-4 border-black/5"></div>
            <div className="absolute inset-[25px] rounded-full border-[1.5px] border-deep-green/60 shadow-xl"></div>

            {/* Rope-like/Textured outer circle */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin-slow"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#203f34"
                strokeWidth="0.5"
                strokeDasharray="0.5 1.5"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#203f34"
                strokeWidth="0.2"
                strokeDasharray="1 1"
              />
            </svg>

            {/* Main Circle with Pattern */}
            <div className="w-[280px] h-[280px] rounded-full bg-[#dce6dc] border border-deep-green/30 flex items-center justify-center shadow-inner relative z-20 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <pattern
                    id="vaultLinePattern"
                    x="0"
                    y="0"
                    width="280"
                    height="3"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="280"
                      y2="0"
                      stroke="#203f34"
                      strokeWidth="2"
                      opacity="0.4"
                    />
                  </pattern>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#vaultLinePattern)"
                />
              </svg>
              <div className="text-4xl font-serif text-deep-green relative z-10 text-center px-8">
                Pareto Hub
              </div>
              {/* Inner glow/shadow */}
              <div className="absolute inset-4 rounded-full border border-white/40 pointer-events-none z-20"></div>
            </div>
          </div>

          {/* Connectors & Arrows */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 600"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orientation="auto"
              >
                <path d="M0,0 L0,6 L6,3 z" fill="#203f34" opacity="0.6" />
              </marker>
              <marker
                id="arrowhead-reverse"
                markerWidth="6"
                markerHeight="6"
                refX="1"
                refY="3"
                orientation="auto"
              >
                <path d="M6,0 L6,6 L0,3 z" fill="#203f34" opacity="0.6" />
              </marker>
            </defs>

            {/* Horizontal Top Arrows (Borrower -> Curator) */}
            <line
              x1="280"
              y1="35"
              x2="720"
              y2="35"
              stroke="#203f34"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity="0.6"
              markerEnd="url(#arrowhead)"
            />
            <line
              x1="720"
              y1="75"
              x2="280"
              y2="75"
              stroke="#203f34"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity="0.6"
              markerEnd="url(#arrowhead-reverse)"
            />

            {/* Middle Horizontal Arrows (Boxes) */}
            {/* Interest Payment (Left) */}
            <line
              x1="80"
              y1="253"
              x2="300"
              y2="253"
              stroke="#203f34"
              strokeWidth="1"
              opacity="0.6"
              markerEnd="url(#arrowhead)"
            />

            {/* Cycles Management (Right) */}
            <line
              x1="820"
              y1="253"
              x2="700"
              y2="253"
              stroke="#203f34"
              strokeWidth="1"
              opacity="0.6"
              markerEnd="url(#arrowhead-reverse)"
            />

            {/* Liquidity (Left) */}
            <line
              x1="80"
              y1="383"
              x2="300"
              y2="383"
              stroke="#203f34"
              strokeWidth="1"
              opacity="0.6"
              markerEnd="url(#arrowhead)"
            />

            {/* Risk Diversification (Right) */}
            <line
              x1="840"
              y1="383"
              x2="700"
              y2="383"
              stroke="#203f34"
              strokeWidth="1"
              opacity="0.6"
              markerEnd="url(#arrowhead-reverse)"
            />

            {/* Interest Earnings (Bottom) */}
            <line
              x1="580"
              y1="537"
              x2="820"
              y2="537"
              stroke="#203f34"
              strokeWidth="1"
              opacity="0.6"
              markerEnd="url(#arrowhead)"
            />
            <line
              x1="420"
              y1="537"
              x2="180"
              y2="537"
              stroke="#203f34"
              strokeWidth="1"
              opacity="0.6"
              markerEnd="url(#arrowhead-reverse)"
            />

            {/* Vertical Lines */}
            <line
              x1="100"
              y1="110"
              x2="100"
              y2="270"
              stroke="#203f34"
              strokeWidth="0.8"
              opacity="0.4"
            />
            <line
              x1="100"
              y1="395"
              x2="100"
              y2="520"
              stroke="#203f34"
              strokeWidth="0.8"
              opacity="0.4"
            />
            <line
              x1="900"
              y1="110"
              x2="900"
              y2="270"
              stroke="#203f34"
              strokeWidth="0.8"
              opacity="0.4"
            />
            <line
              x1="900"
              y1="395"
              x2="900"
              y2="520"
              stroke="#203f34"
              strokeWidth="0.8"
              opacity="0.4"
            />

            {/* Center Vertical from Vault */}
            <line
              x1="500"
              y1="490"
              x2="500"
              y2="520"
              stroke="#203f34"
              strokeWidth="0.8"
              opacity="0.4"
            />
          </svg>

          {/* Corner Blocks */}
          <CornerBlock title="Traders" position="tl" />
          <CornerBlock title="Curators" position="tr" />
          <CornerBlock title="Lenders" position="bl" />
          <CornerBlock title="Stakers" position="br" />

          {/* Labels */}
          {/* Top Center Labels */}
          <div className="absolute top-[20px] left-1/2 -translate-x-1/2 flex flex-col gap-[10px] z-30">
            <div className="bg-[#f0f4f0] border border-deep-green/60 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-deep-green/80 text-center">
              Trade Execution
            </div>
            <div className="bg-[#f0f4f0] border border-deep-green/60 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-deep-green/80 text-center">
              Governance
            </div>
          </div>

          {/* Left Mid Labels */}
          <div className="absolute left-[30px] top-[255px] z-30">
            <AngleBox type="right">Swap Fees</AngleBox>
          </div>

          <div className="absolute left-[30px] top-[395px] z-30">
            <AngleBox type="right">Lending Supply</AngleBox>
          </div>

          {/* Right Mid Labels */}
          <div className="absolute right-[30px] top-[255px] z-30">
            <AngleBox type="left">Risk Mitigation</AngleBox>
          </div>

          <div className="absolute right-[30px] top-[395px] z-30">
            <AngleBox type="left">Staking Rewards</AngleBox>
          </div>

          {/* Bottom Center Label */}
          <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2 z-30">
            <AngleBox type="both">DEFI Incentives</AngleBox>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default ParetoRoles;
