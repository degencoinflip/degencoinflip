import React, { useState } from 'react';

export function EarningsCalc() {
  const [dailyFlips, setDailyFlips] = useState(500);
  const [avgBet, setAvgBet] = useState(0.5);

  const monthlySOL = dailyFlips * 30 * avgBet * 0.015;
  const monthlyUSD = monthlySOL * 140;

  return (
    <section className="section dark">
      <h2 className="ec-headline">EVERY FLIP. YOUR CUT.</h2>

      <div className="split-screen">
        {/* Left panel — interactive calculator */}
        <div className="calc-panel">
          <div className="ec-slider-group">
            <label className="ec-slider-label">
              <span>Daily flips on your site</span>
              <span className="ec-slider-value">{dailyFlips.toLocaleString()}</span>
            </label>
            <input
              type="range"
              className="ec-slider"
              min={10}
              max={10000}
              step={10}
              value={dailyFlips}
              onChange={(e) => setDailyFlips(Number(e.target.value))}
            />
          </div>

          <div className="ec-slider-group">
            <label className="ec-slider-label">
              <span>Average bet size (SOL)</span>
              <span className="ec-slider-value">{avgBet.toFixed(2)}</span>
            </label>
            <input
              type="range"
              className="ec-slider"
              min={0.05}
              max={5}
              step={0.05}
              value={avgBet}
              onChange={(e) => setAvgBet(Number(e.target.value))}
            />
          </div>

          <div className="ec-output">
            <div className="ec-output-label">Monthly earnings:</div>
            <div className="ec-output-sol">{monthlySOL.toFixed(2)} SOL</div>
            <div className="ec-output-usd">~${monthlyUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</div>
          </div>
        </div>

        {/* Right panel — code block */}
        <div className="calc-code">
          <pre>
            <code>
              <div className="code-line">
                <span className="code-keyword">const</span> sdk ={' '}
                <span className="code-keyword">new</span>{' '}
                <span className="code-type">DegenCoinFlip</span>({'{'})
              </div>
              <div className="code-line">{'  '}wallet,</div>
              <div className="code-line code-highlight-gold">
                {'  '}affiliateId:{' '}
                <span className="code-string">'YOUR_WALLET'</span>,{'  '}
                <span className="code-comment">// {'<'}- your wallet</span>
              </div>
              <div className="code-line">
                {'  '}
                <span className="code-comment">// You earn 1.5% of every flip</span>
              </div>
              <div className="code-line">{'}'});</div>
              <div className="code-line">&nbsp;</div>
              <div className="code-line">
                <span className="code-keyword">const</span> result ={' '}
                <span className="code-keyword">await</span> sdk.play(
                <span className="code-string">'H'</span>, amount);
              </div>
              <div className="code-line">
                <span className="code-comment">// Your cut: automatic. On-chain. Every time.</span>
              </div>
            </code>
          </pre>
        </div>
      </div>

      <p className="ec-tagline">
        DCF handles the house, the escrow, the randomness. You handle the vibes.
      </p>
    </section>
  );
}
