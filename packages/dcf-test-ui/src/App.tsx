import React from 'react';
import { DcfProvider, useDcf } from './provider';
import { WalletButton } from './components/WalletButton';
import { HeroCoin } from './sections/HeroCoin';
import { EarningsCalc } from './sections/EarningsCalc';
import { NetworkProof } from './sections/NetworkProof';
import UIGallery from './sections/UIGallery';
import { TerminalDemo } from './sections/TerminalDemo';
import { Closer } from './sections/Closer';
import './style.css';

function Showcase() {
  const { state } = useDcf();

  return (
    <>
      <WalletButton />
      <div className="showcase">
        <HeroCoin connected={!!state.sdk} />
        <EarningsCalc />
        <NetworkProof />
        <UIGallery />
        <TerminalDemo />
        <Closer />
      </div>
      {state.error && <div className="error-banner">{state.error}</div>}
    </>
  );
}

export function App() {
  return (
    <DcfProvider>
      <Showcase />
    </DcfProvider>
  );
}
