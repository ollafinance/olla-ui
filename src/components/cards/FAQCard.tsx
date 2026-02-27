"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is olla",
    answer:
      "Olla is a liquid staking protocol built for Aztec. It lets you stake your tokens to help secure the network, earn staking rewards, and receive a liquid token (stAztec) in return, so your capital is never locked up. You can use stAztec across DeFi while your rewards keep accruing.",
  },
  {
    question: "How does Olla work?",
    answer:
      "Olla allows you to stake Aztec tokens and receive stAztec in return. Your staked tokens are used to secure the network and earn rewards, while stAztec can be freely used in DeFi applications.",
  },
  {
    question: "What is stAztec?",
    answer:
      "stAztec is a liquid staking token that represents your staked Aztec tokens. It accrues staking rewards automatically and can be traded, transferred, or used in DeFi protocols.",
  },
  {
    question: "How do I get stAztec?",
    answer:
      "Simply stake your Aztec tokens through the Olla interface. You'll receive stAztec tokens in your wallet proportional to your staked amount.",
  },
  {
    question: "How can I use stAztec?",
    answer:
      "stAztec can be used in various DeFi applications including lending protocols, DEXs, and yield aggregators while continuing to earn staking rewards.",
  },
  {
    question: "How do I unstake?",
    answer:
      "You can unstake your Aztec tokens by redeeming your stAztec. The process involves a withdrawal request and may have a waiting period depending on network conditions.",
  },
  {
    question: "Is there a minimum amount required to stake?",
    answer:
      "Yes, there is a minimum staking amount to ensure efficient validator operations. The exact amount is displayed in the staking interface.",
  },
  {
    question: "How does Olla select validators?",
    answer:
      "Olla uses a rigorous selection process based on validator performance, uptime, and reputation to ensure optimal staking returns and network security.",
  },
  {
    question: "What fee does Olla charge?",
    answer:
      "Olla charges a small fee on staking rewards to maintain the protocol and support ongoing development. The exact fee percentage is transparently displayed.",
  },
  {
    question: "What are the risks of using Olla?",
    answer:
      "As with any DeFi protocol, there are smart contract risks, market risks, and slashing risks. We encourage users to understand these risks before staking.",
  },
  {
    question: "What security measures does Olla have in place?",
    answer:
      "Olla undergoes regular security audits, uses battle-tested smart contract patterns, and implements robust monitoring and incident response procedures.",
  },
  {
    question: "What is the staking APR?",
    answer:
      "The staking APR varies based on network conditions and validator performance. Current rates are displayed in the staking interface.",
  },
  {
    question: "Where can I learn more or get involved?",
    answer:
      "Visit our documentation, join our community Discord, or follow us on Twitter for the latest updates and community events.",
  },
];

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/60 pt-[60px] pb-8 md:pt-[100px] lg:pt-[140px]">
      <div
        ref={modalRef}
        className="h-auto max-h-[80vh] w-[95vw] max-w-[938px] flex-shrink-0 overflow-hidden rounded-[30px] bg-[#1f1f1f] lg:max-h-[75vh] lg:w-[938px]"
      >
        <div className="flex h-full flex-row">
          {/* Left side - Title */}
          <div className="w-[280px] flex-shrink-0 p-12">
            <h2 className="text-[28px] leading-tight font-medium tracking-tight whitespace-nowrap text-[#f8f7f1]">
              Frequently Asked
              <br />
              Questions
            </h2>
          </div>

          {/* Right side - FAQ List */}
          <div className="h-full flex-1 overflow-y-auto py-10 pr-8">
            <div className="flex flex-col">
              {faqData.map((item, index) => (
                <div key={index} className="border-t border-[#333] first:border-t-0">
                  <button
                    onClick={() => handleToggle(index)}
                    className="flex w-full items-center justify-between py-3 text-left transition-opacity hover:opacity-80"
                  >
                    <span className="text-base font-medium tracking-tight text-[#aeada9]">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "text-2xl font-medium text-[#aeada9] transition-transform duration-200",
                        expandedIndex === index && "rotate-45"
                      )}
                    >
                      +
                    </span>
                  </button>
                  {expandedIndex === index && (
                    <div className="pr-12 pb-4">
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
      </div>
    </div>
  );
}
