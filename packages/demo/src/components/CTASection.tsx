const installCode = `npm i @degencoinflip/sdk`;

const usageCode = `const dcf = new DegenCoinFlip({ wallet });
const flip = await dcf.play('H', amount);
if (flip.result === 'WIN') doSomethingAmazing();`;

export function CTASection() {
  return (
    <section className="section-snap min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 bg-black">
      <div className="w-full max-w-2xl text-center">
        {/* Headline */}
        <h2 className="text-white font-bold text-5xl sm:text-7xl tracking-tight leading-[1.1] mb-4">
          3 lines.
          <br />
          Any app.
        </h2>

        <p className="text-white/40 text-lg sm:text-xl font-light mb-12 max-w-md mx-auto">
          Add double-or-nothing to any transaction in your app with a single SDK
          call.
        </p>

        {/* Code block */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 sm:p-8 text-left mb-10 backdrop-blur-sm">
          {/* Install */}
          <div className="mb-6">
            <pre className="text-sm sm:text-base font-mono">
              <span className="text-white/30 select-none">$ </span>
              <span className="text-emerald-400">{installCode}</span>
            </pre>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06] mb-6" />

          {/* Usage */}
          <pre className="text-sm sm:text-base font-mono leading-relaxed">
            {usageCode.split("\n").map((line, i) => (
              <div key={i}>
                <span className="text-white/30 select-none">
                  {(i + 1).toString().padStart(2)}{" "}
                </span>
                <span className="text-white/70">{line}</span>
              </div>
            ))}
          </pre>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <a
            href="https://github.com/degencoinflip/degencoinflip-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm font-mono group"
          >
            <svg
              className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            github.com/degencoinflip/degencoinflip-cli
          </a>

          <p className="text-white/20 text-sm font-mono tracking-wider">
            @degencoinflip/sdk
          </p>
        </div>
      </div>
    </section>
  );
}
