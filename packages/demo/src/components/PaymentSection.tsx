"use client";

import { FlipButton } from "./FlipButton";
import { CodeSnippet } from "./CodeSnippet";

const code = `const result = await dcf.play('H', 25.00);
if (result.result === 'WIN') refundPayment();`;

interface PaymentSectionProps {
  dcf: any | null;
}

export function PaymentSection({ dcf }: PaymentSectionProps) {
  return (
    <section
      className="section-snap min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20"
      style={{ backgroundColor: "#008CFF" }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
            {/* Checkmark */}
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-5">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Amount */}
            <h2 className="text-gray-900 font-semibold text-2xl tracking-tight mb-1">
              You paid Alex $25.00
            </h2>
            <p className="text-gray-400 text-sm font-light">
              for dinner last night
            </p>
          </div>

          {/* Flip CTA */}
          <div className="px-8 pb-8 pt-2">
            <FlipButton
              label="Double or Nothing?"
              amount={25.0}
              dcf={dcf}
              winMessage="YOU WON! $25.00 refunded."
              loseMessage="Better luck next time"
              accentColor="#008CFF"
              accentHoverColor="#0070D6"
            />
          </div>
        </div>

        {/* Code snippet */}
        <CodeSnippet code={code} />
      </div>
    </section>
  );
}
