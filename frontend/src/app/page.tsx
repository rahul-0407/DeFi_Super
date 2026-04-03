"use client";

import React from "react";
import ParetoNav from "@/components/landing/ParetoNav";
import ParetoHero from "@/components/landing/ParetoHero";
import ParetoUSP from "@/components/landing/ParetoUSP";
import ParetoWorkflowStack from "@/components/landing/ParetoWorkflowStack";
import ParetoRoles from "@/components/landing/ParetoRoles";
import ParetoEfficiency from "@/components/landing/ParetoEfficiency";
import ParetoFooter from "@/components/landing/ParetoFooter";

export default function DeFiSuperLanding() {
  return (
    <main className="relative min-h-screen bg-[#f0f4f0] selection:bg-secondary-fixed/30">
      <ParetoNav />
      <div className="pt-20">
        <ParetoHero />
        <ParetoRoles />
        <ParetoUSP />
        <ParetoEfficiency />
        <ParetoWorkflowStack />
      </div>
      <ParetoFooter />
    </main>
  );
}
