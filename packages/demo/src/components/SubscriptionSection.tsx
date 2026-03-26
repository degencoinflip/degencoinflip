"use client";

import { FlipButton } from "./FlipButton";
import { CodeSnippet } from "./CodeSnippet";

const code = `const result = await dcf.play('H', 12.99);
if (result.result === 'WIN') skipBilling();`;

interface SubscriptionSectionProps {
  dcf: any | null;
}

export function SubscriptionSection({ dcf }: SubscriptionSectionProps) {
  return (
    <section
      className="section-snap min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20"
      style={{ backgroundColor: "#1DB954" }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          <div className="px-8 pt-8 pb-4">
            {/* Plan badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full mb-5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Active
            </div>

            <h2 className="text-gray-900 font-semibold text-xl tracking-tight mb-1">
              Premium Plan
            </h2>
            <p className="text-gray-900 text-3xl font-bold tracking-tight">
              $12.99
              <span className="text-gray-400 text-base font-light">/mo</span>
            </p>
          </div>

          {/* Details */}
          <div className="px-8 py-4">
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <span className="text-gray-400 text-sm font-light">
                Next billing
              </span>
              <span className="text-gray-900 text-sm font-medium">
                Apr 26, 2026
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <span className="text-gray-400 text-sm font-light">
                Payment method
              </span>
              <span className="text-gray-900 text-sm font-medium">
                **** 4242
              </span>
            </div>
          </div>

          {/* Flip CTA */}
          <div className="px-8 pb-8 pt-2">
            <FlipButton
              label="Flip for a Free Month"
              amount={12.99}
              dcf={dcf}
              winMessage="YOU WON! This month is on us."
              loseMessage="Better luck next time"
              accentColor="#1DB954"
              accentHoverColor="#1AA34A"
            />
          </div>
        </div>

        {/* Code snippet */}
        <CodeSnippet code={code} />
      </div>
    </section>
  );
}
