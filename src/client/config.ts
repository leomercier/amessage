// config.ts
export const config = {
  // Network settings
  network: "mainnet-beta",
  endpoint: "https://api.mainnet-beta.solana.com",

  // Default AI agent address
  defaultAiAgent: "a2ozsCBLHDmFG3uxU6fXckxr8b8Syjym2VPhckEURqy", // AROK.VC

  // Protocol settings
  version: "0.1.0",
  defaultLanguage: "en",
  defaultResponseStyle: "concise",

  // Payment settings
  defaultPayment: 0.001, // SOL
  minPayment: 0.0001, // SOL
  maxPayment: 1.0, // SOL

  // Network settings
  maxRetries: 3,
  timeout: 30000, // ms

  // Message size limits
  maxMessageSize: 566, // bytes (Solana memo limit)
  maxChunks: 10, // maximum number of chunks for large messages

  // Response handling
  maxResponseWait: 60000, // ms
  pollInterval: 1000 // ms
};
