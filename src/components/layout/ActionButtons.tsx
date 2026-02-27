"use client";

import { useState } from "react";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { FAQButton } from "@/components/FAQButton";
import { FAQCard } from "@/components/cards/FAQCard";

export function ActionButtons() {
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  return (
    <>
      {/* Desktop: Fixed position on right side */}
      <div className="fixed top-1/2 right-8 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        <ThemeToggleButton />
        <FAQButton onClick={() => setIsFAQOpen(true)} />
      </div>

      {/* Mobile: Inline flex row */}
      <div className="flex flex-row gap-2 md:hidden">
        <ThemeToggleButton />
        <FAQButton onClick={() => setIsFAQOpen(true)} />
      </div>

      {/* FAQ Modal */}
      {isFAQOpen && <FAQCard onClose={() => setIsFAQOpen(false)} />}
    </>
  );
}
