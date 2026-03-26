"use client";

import { FlipButton } from "./FlipButton";
import { CodeSnippet } from "./CodeSnippet";

const lineItems = [
  { name: "Chicken Burrito x1", price: "$12.99" },
  { name: "Chips & Guac", price: "$4.99" },
  { name: "Delivery Fee", price: "$3.99" },
];

const code = `const result = await dcf.play('H', 21.97);
if (result.result === 'WIN') refundOrder();`;

interface ReceiptSectionProps {
  dcf: any | null;
}

export function ReceiptSection({ dcf }: ReceiptSectionProps) {
  return (
    <section
      className="section-snap min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20"
      style={{ backgroundColor: "#FF3008" }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-gray-900 font-semibold text-xl tracking-tight">
                Order Receipt
              </h2>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
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
            </div>
            <p className="text-gray-400 text-sm font-light">
              Delivered 12 min ago
            </p>
          </div>

          {/* Line items */}
          <div className="px-8 py-4">
            <div className="space-y-3">
              {lineItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-600 text-sm font-light">
                    {item.name}
                  </span>
                  <span className="text-gray-900 text-sm font-medium tabular-nums">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-semibold text-base">
                  Total
                </span>
                <span className="text-gray-900 font-semibold text-lg tabular-nums">
                  $21.97
                </span>
              </div>
            </div>
          </div>

          {/* Flip CTA */}
          <div className="px-8 pb-8 pt-2">
            <FlipButton
              label="Double or Nothing -- Get Your Order Free"
              amount={21.97}
              dcf={dcf}
              winMessage="YOU WON! Order refunded."
              loseMessage="Better luck next time"
              accentColor="#FF3008"
              accentHoverColor="#E02A06"
            />
          </div>
        </div>

        {/* Code snippet */}
        <CodeSnippet code={code} />
      </div>
    </section>
  );
}
