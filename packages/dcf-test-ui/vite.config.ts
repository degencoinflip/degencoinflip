import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@degencoinflip/sdk': resolve(__dirname, '../sdk/src/index.ts'),
      fs: resolve(__dirname, 'src/shims/fs.ts'),
      buffer: 'buffer/',
    },
  },
  define: {
    'process.env.HOME': JSON.stringify(''),
    'process.env.DCF_KEYPAIR': 'undefined',
    'process.env.DCF_RPC_URL': 'undefined',
    'process.env.DCF_API_URL': 'undefined',
    'process.env.DCF_AUTHORITY': 'undefined',
    'process.env.REACT_APP_RPC_URL': 'undefined',
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@coral-xyz/anchor', '@solana/web3.js', 'bs58', 'tweetnacl', 'buffer', 'three'],
  },
});
