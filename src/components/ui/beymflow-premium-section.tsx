"use client";

import HolographicCard from "@/components/ui/holographic-card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
interface BeymflowPremiumSectionProps {
  className?: string;
}
export default function BeymflowPremiumSection({
  className = ""
}: BeymflowPremiumSectionProps) {
  return <section className={`mx-auto mt-24 w-full max-w-6xl px-4 md:px-6 lg:px-8 ${className}`}>
      
    </section>;
}