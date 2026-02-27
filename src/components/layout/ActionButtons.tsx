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
      <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
        <ThemeToggleButton />
        <FAQButton onClick={() => setIsFAQOpen(true)} />
      </div>

      {/* Mobile: Inline flex row */}
      <div className="flex md:hidden flex-row gap-2">
        <ThemeToggleButton />
        <FAQButton onClick={() => setIsFAQOpen(true)} />
      </div>

      {/* FAQ Modal */}
      {isFAQOpen && (
        <FAQCard onClose={() => setIsFAQOpen(false)} />
      )}
    </>
  );
}
