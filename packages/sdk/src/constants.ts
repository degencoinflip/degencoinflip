import { PublicKey } from '@solana/web3.js';

// Program
export const PROGRAM_ID = new PublicKey('BmjJ85zsP2xHPesBKpmHYKt136gzeTtNbeVDcdfybHHT');

// Key accounts
export const INITIALIZER_ID = new PublicKey('h2oMkkgUF55mxMFeuUgVYwvEnpV5kRbvHVuDWMKDYFC');
export const COLD_HOUSE_ID = new PublicKey('i821bbVqQguuDLQp72gNWd52KBXBcEAQc4sVtZxWk4n');
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Default authority (overridable via setConfig or DCF_AUTHORITY env var)
export const DEFAULT_AUTHORITY = 'modn84SAs1ccUAmxtmRY85yPz44qixgGrUwi276WYy1';

// Module-level config (set by SDK constructor, no process.env mutation)
let _apiUrl: string | undefined;
let _rpcUrl: string | undefined;
let _authority: string | undefined;

export function setConfig(opts: { apiUrl?: string; rpcUrl?: string; authority?: string }) {
  _apiUrl = opts.apiUrl;
  _rpcUrl = opts.rpcUrl;
  _authority = opts.authority;
}

export function getAuthorityId(): PublicKey {
  const auth = _authority ?? (typeof process !== 'undefined' ? process.env?.DCF_AUTHORITY : undefined) ?? DEFAULT_AUTHORITY;
  return new PublicKey(auth);
}

// PDA seed strings
export const SEEDS = {
  HOUSE_TREASURY: 'house_treasury',
  HOUSE_STATE: 'house_state',
  DEGENERATE: 'degenerate',
  REWARDS: 'rewards',
} as const;

// Fee constants (match on-chain lib.rs)
export const FEE_PERCENTAGE = 0.035;
export const FLAT_FEE_LAMPORTS = 10_000;
export const MIN_DEPOSIT_SOL = 0.001;
export const MAX_DEPOSIT_SOL = 32;

// Priority fee defaults
export const DEFAULT_PRIORITY_FEE_SOL = 0.0001;
export const MAX_MARKET_LAMPORTS = 500_000;
export const PRIORITY_LEVEL = 'VERYHIGH';

// Thresholds
export const IGNOREABLE_AMOUNT_SOL = 0.001;

// API
export const DEFAULT_API_URL = 'https://api.degencoinflip.com/v2';

export function getApiUrl(): string {
  return _apiUrl ?? (typeof process !== 'undefined' ? process.env?.DCF_API_URL : undefined) ?? DEFAULT_API_URL;
}

export function getRpcUrl(): string {
  return _rpcUrl ?? (typeof process !== 'undefined' ? process.env?.DCF_RPC_URL : undefined) ?? 'https://api.mainnet-beta.solana.com';
}
