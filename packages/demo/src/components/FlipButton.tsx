"use client";

import { useState, useCallback } from "react";

type FlipState = "idle" | "flipping" | "won" | "lost" | "error" | "no-wallet";

interface FlipButtonProps {
  label: string;
  amount: number;
  dcf: any | null;
  winMessage?: string;
  loseMessage?: string;
  accentColor: string;
  accentHoverColor: string;
}

export function FlipButton({
  label,
  amount,
  dcf,
  winMessage = "YOU WON!",
  loseMessage = "Better luck next time",
  accentColor,
  accentHoverColor,
}: FlipButtonProps) {
  const [state, setState] = useState<FlipState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFlip = useCallback(async () => {
    if (state === "flipping") return;

    // Resolve the DCF instance: supports both a ref object and a direct instance
    const instance = dcf && typeof dcf === "object" && "current" in dcf ? dcf.current : dcf;

    if (!instance) {
      setState("no-wallet");
      return;
    }

    setState("flipping");
    setErrorMessage("");

    try {
      const result = await instance.play("H", 0.001); // Always bet 0.001 SOL for demo
      const won = result.result === "WIN";
      setState(won ? "won" : "lost");
    } catch (err: any) {
      const message =
        err?.message || "Something went wrong. Please try again.";
      setErrorMessage(message);
      setState("error");
    }
  }, [state, dcf]);

  const handleReset = useCallback(() => {
    setState("idle");
    setErrorMessage("");
  }, []);

  if (state === "idle") {
    return (
      <button
        onClick={handleFlip}
        className="w-full py-4 px-8 rounded-xl text-white font-semibold text-lg tracking-tight transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        style={{
          backgroundColor: accentColor,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = accentHoverColor)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = accentColor)
        }
      >
        {label}
      </button>
    );
  }

  if (state === "no-wallet") {
    return (
      <div className="animate-fade-in-up">
        <div className="w-full py-4 px-8 rounded-xl text-center bg-amber-50 border border-amber-200">
          <p className="text-lg font-semibold text-amber-600">
            Connect wallet first
          </p>
        </div>
        <button
          onClick={handleReset}
          className="w-full mt-3 py-2 px-4 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state === "flipping") {
    return (
      <div className="w-full py-4 px-8 rounded-xl bg-gray-100 flex flex-col items-center justify-center gap-3">
        <div className="animate-coin-spin inline-block">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-500/50">
            <span className="text-2xl font-bold text-yellow-900 select-none">
              $
            </span>
          </div>
        </div>
        <span className="text-gray-500 text-sm font-medium tracking-wide animate-pulse">
          Flipping...
        </span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="animate-fade-in-up">
        <div className="w-full py-4 px-8 rounded-xl text-center bg-red-50 border border-red-200">
          <p className="text-lg font-semibold text-red-600">Flip failed</p>
          <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
        </div>
        <button
          onClick={handleReset}
          className="w-full mt-3 py-2 px-4 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  const won = state === "won";

  return (
    <div className="animate-fade-in-up">
      <div
        className={`w-full py-4 px-8 rounded-xl text-center ${
          won
            ? "bg-emerald-50 border border-emerald-200"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <p
          className={`text-lg font-semibold ${
            won ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          {won ? winMessage : loseMessage}
        </p>
      </div>
      <button
        onClick={handleReset}
        className="w-full mt-3 py-2 px-4 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
