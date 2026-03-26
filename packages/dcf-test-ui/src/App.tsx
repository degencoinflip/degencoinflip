import React, { Suspense } from 'react';
import { DcfProvider, useDcf } from './provider';
import { Connect } from './Connect';

const Tavern = React.lazy(() => import('./Tavern').then(m => ({ default: m.Tavern })));

function Main() {
  const { state } = useDcf();

  return (
    <>
      {!state.sdk && <Connect />}
      {state.sdk && (
        <Suspense fallback={<div style={{ color: '#c4a45a', textAlign: 'center', marginTop: '40vh' }}>Loading tavern...</div>}>
          <Tavern />
        </Suspense>
      )}
      {state.error && <div className="error-banner">{state.error}</div>}
    </>
  );
}

export function App() {
  return (
    <DcfProvider>
      <Main />
    </DcfProvider>
  );
}
