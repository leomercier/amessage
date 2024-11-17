// agent-config.ts
export const agentConfig = {
  // OpenAI settings
  openai: {
    model: "gpt-3.5-turbo",
    maxTokens: 150,
    temperature: 0.7,
    systemPrompt:
      "You are a knowledgeable AI assistant. Provide concise, accurate answers."
  },

  // Payment settings
  payments: {
    minimumPayment: 0.001, // SOL
    pricePerToken: 0.00001 // SOL
  },

  // Response settings
  response: {
    maxRetries: 3,
    timeout: 30000,
    maxFollowUpSuggestions: 3
  },

  // Network settings
  network: {
    endpoint:
      process.env.SOLANA_ENDPOINT || "https://api.mainnet-beta.solana.com",
    confirmationLevel: "confirmed"
  },

  // Logging settings
  logging: {
    level: "info",
    saveToFile: true,
    logFileName: "agent.log"
  }
};
