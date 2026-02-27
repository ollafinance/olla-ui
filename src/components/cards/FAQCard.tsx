"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import faqData from "@/assets/content/faq.json";

interface FAQCardProps {
  onClose: () => void;
}

export function FAQCard({ onClose }: FAQCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Lock body scroll when modal opens
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore body scroll when modal closes
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [onClose]);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-hidden bg-black/60 py-3 pt-[140px] md:pt-[160px] lg:pt-[180px]">
      <div
        ref={modalRef}
        className="mx-6 flex h-[calc(100vh-160px)] max-h-[85vh] w-[calc(100%-48px)] flex-shrink-0 flex-col overflow-hidden rounded-[30px] bg-[#1f1f1f] md:mx-10 md:w-[calc(100%-80px)] md:h-[calc(100vh-180px)] lg:mx-auto lg:h-[75vh] lg:w-[938px] lg:max-w-[938px] lg:flex-row"
      >
        {/* Title - Mobile: top full width, Desktop: left side */}
        <div className="flex-shrink-0 px-6 py-8 md:px-8 md:py-10 lg:w-[280px] lg:p-12">
          <h2 className="text-xl leading-tight font-medium tracking-tight whitespace-nowrap text-[#f8f7f1] md:text-2xl lg:text-[28px]">
            Frequently Asked
            <br />
            Questions
          </h2>
        </div>

        {/* FAQ List - Mobile: full width below title, Desktop: right side */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 md:px-8 lg:py-10 lg:pr-8">
          <div className="flex flex-col">
            {faqData.map((item, index) => (
              <div key={index} className="border-t border-[#333] first:border-t-0">
                <button
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between py-4 text-left transition-opacity hover:opacity-80 md:py-3"
                >
                  <span className="pr-4 text-sm font-medium tracking-tight text-[#aeada9] md:text-base">
                    {item.question}
                  </span>
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-xl font-medium text-[#aeada9]">
                    {expandedIndex === index ? <span className="text-lg">×</span> : <span>+</span>}
                  </span>
                </button>
                {expandedIndex === index && (
                  <div className="pr-8 pb-4 md:pr-12">
                    <p className="text-sm leading-relaxed text-[#aeada9]">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
            {/* Bottom border */}
            <div className="border-t border-[#333]" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
