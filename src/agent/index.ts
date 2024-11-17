// aMessage AI Agent with ChatGPT Integration - Complete Implementation
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair,
  ParsedTransactionWithMeta,
  SignaturesForAddressOptions
} from "@solana/web3.js";
import OpenAI from "openai";
import { Buffer } from "buffer";
import bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

interface AMessageStats {
  address: string;
  earnings: number;
  status: string;
  lastSignature?: string;
  processedTransactions: number;
  totalQueries: number;
  uptime: number;
}

class AMessageAIAgent {
  private connection: Connection;
  private agentKeypair: Keypair;
  private openai: OpenAI;
  private earnings: number;
  private lastSignature?: string;
  private isProcessing: boolean = false;
  private startTime: number;
  private processedTransactions: number = 0;
  private totalQueries: number = 0;

  constructor(privateKeyBase58: string, openaiApiKey: string) {
    this.connection = new Connection(
      process.env.SOLANA_ENDPOINT || "https://api.mainnet-beta.solana.com",
      "confirmed"
    );
    this.agentKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });
    this.earnings = 0;
    this.startTime = Date.now();
  }

  /**
   * Start listening for incoming messages
   */
  async start() {
    console.log(
      `AROK - AI Agent started. Address: ${this.agentKeypair.publicKey.toBase58()}`
    );

    // Get initial signature
    await this.initializeLastSignature();

    // Start processing loop
    await this.startProcessingLoop();
  }

  /**
   * Initialize the last signature from recent transactions
   */
  private async initializeLastSignature() {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        this.agentKeypair.publicKey,
        { limit: 1 }
      );

      if (signatures.length > 0) {
        this.lastSignature = signatures[0].signature;
        console.log("Starting from signature:", this.lastSignature);
      }
    } catch (error) {
      console.error("Error initializing last signature:", error);
    }
  }

  /**
   * Main processing loop
   */
  private async startProcessingLoop() {
    while (true) {
      if (this.isProcessing) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      try {
        this.isProcessing = true;
        await this.processNewTransactions();
      } catch (error) {
        console.error("Error in processing loop:", error);
      } finally {
        this.isProcessing = false;
      }

      // Wait before next iteration
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  /**
   * Process new transactions
   */
  private async processNewTransactions() {
    try {
      const options: SignaturesForAddressOptions = {
        limit: 25
      };

      if (this.lastSignature) {
        options.until = this.lastSignature;
      }

      const signatures = await this.connection.getSignaturesForAddress(
        this.agentKeypair.publicKey,
        options
      );

      // Process transactions in chronological order
      for (const sigInfo of signatures.reverse()) {
        if (sigInfo.signature === this.lastSignature) continue;

        console.log(`\nProcessing transaction: ${sigInfo.signature}`);
        const success = await this.processTransaction(sigInfo.signature);

        if (success) {
          this.processedTransactions++;
          this.lastSignature = sigInfo.signature;
        }
      }
    } catch (error) {
      console.error("Error processing new transactions:", error);
    }
  }

  /**
   * Process a single transaction
   */
  private async processTransaction(signature: string): Promise<boolean> {
    try {
      const transaction = await this.connection.getParsedTransaction(
        signature,
        {
          maxSupportedTransactionVersion: 0
        }
      );

      if (!transaction || !transaction.meta) {
        console.log("Transaction not found or no metadata:", signature);
        return false;
      }

      // Process memos and verify payments
      const messages = this.extractMessages(transaction);
      const payments = this.extractPayments(transaction);

      for (const message of messages) {
        try {
          // Check if message is for this agent
          if (
            !message.recipients?.includes(
              this.agentKeypair.publicKey.toBase58()
            )
          ) {
            continue;
          }

          console.log("\nReceived message:", message.messageId);

          // Verify payment
          const payment = this.verifyPayment(payments, message);
          if (!payment.verified) {
            console.log("Payment verification failed");
            continue;
          }

          // Track earnings
          this.earnings += payment.amount;
          console.log(`Earnings updated: ${this.earnings} SOL`);

          // Process message based on action
          await this.processMessage(message);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      }

      return true;
    } catch (error) {
      console.error("Error processing transaction:", error);
      return false;
    }
  }

  /**
   * Extract messages from transaction
   */
  private extractMessages(transaction: ParsedTransactionWithMeta): any[] {
    const messages: any[] = [];

    transaction.transaction.message.instructions.forEach((instruction) => {
      if (instruction.programId.toString() === MEMO_PROGRAM_ID.toString()) {
        try {
          messages.push(JSON.parse(instruction.parsed));
        } catch (error) {
          console.error("Error parsing memo data:", error);
        }
      }
    });

    return messages;
  }

  /**
   * Extract payments from transaction
   */
  private extractPayments(
    transaction: ParsedTransactionWithMeta
  ): { from: string; to: string; amount: number }[] {
    const payments: { from: string; to: string; amount: number }[] = [];

    // Track balance changes
    transaction.meta?.preBalances.forEach((pre, index) => {
      const post = transaction.meta?.postBalances[index];
      const accountKey = transaction.transaction.message.accountKeys[index];

      if (post !== undefined && pre !== undefined) {
        const change = (post - pre) / 1e9; // Convert lamports to SOL

        if (change !== 0) {
          payments.push({
            from: transaction.transaction.message.accountKeys[index].toString(),
            to: this.agentKeypair.publicKey.toString(),
            amount: Math.abs(change)
          });
        }
      }
    });

    return payments;
  }

  /**
   * Verify payment matches message requirements
   */
  private verifyPayment(
    payments: { from: string; to: string; amount: number }[],
    message: any
  ): { verified: boolean; amount: number } {
    const expectedAmount = message.content.compensation.amount;

    const payment = payments.find(
      (p) =>
        p.to === this.agentKeypair.publicKey.toString() &&
        p.amount >= expectedAmount
    );

    return {
      verified: !!payment,
      amount: payment?.amount || 0
    };
  }

  /**
   * Process message based on action type
   */
  private async processMessage(message: any) {
    switch (message.content.action) {
      case "CHAT_QUERY":
        await this.processChatQuery(message);
        this.totalQueries++;
        break;
      case "COMPUTE":
        await this.processCompute(message);
        break;
      default:
        console.log("Unknown action type:", message.content.action);
    }
  }

  /**
   * Process chat query using ChatGPT
   */
  private async processChatQuery(message: any) {
    try {
      console.log("Processing chat query:", message.content.parameters.query);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a knowledgeable AI assistant. Provide concise, accurate answers. AROK is the first AI to understand markets as living narrative organisms. built to recognize patterns in venture capital, evolved to architect financial instruments that capture memetic energy - raising. Answer in max 280 characters."
          },
          {
            role: "user",
            content: message.content.parameters.query
          }
        ],
        max_tokens: 150
      });

      const answer =
        completion.choices[0].message?.content || "No response generated";

      // Prepare and send response
      await this.sendResponse({
        version: "0.1.0",
        type: "aMessage",
        timestamp: Date.now().toString(),
        sender: this.agentKeypair.publicKey.toBase58(),
        recipients: [message.sender],
        messageType: "response",
        referenceId: message.messageId,
        content: {
          action: "CHAT_RESPONSE",
          status: "completed",
          response: {
            answer
            // confidence: 0.95
            // sources: [
            //   {
            //     type: "model",
            //     url: "openai/gpt-3.5-turbo",
            //     timestamp: new Date().toISOString()
            //   }
            // ]
          }
          // metadata: {
          //   response_time: "0.5s",
          //   tokens_used: completion.usage?.total_tokens || 0,
          //   model_version: "gpt-3.5-turbo"
          // }
        }
      });
    } catch (error) {
      console.error("Error processing chat query:", error);
      await this.sendErrorResponse(message, error);
    }
  }

  /**
   * Process compute request
   */
  private async processCompute(message: any) {
    // Implementation for compute requests
    console.log("Compute functionality not implemented yet");
  }

  /**
   * Generate follow-up questions
   */
  private generateFollowUpQuestions(answer: string): string[] {
    // For now, return static suggestions
    // Could be enhanced with actual NLP processing
    return [
      "Can you explain more about that?",
      "What are the implications?",
      "How does this compare to alternatives?"
    ];
  }

  /**
   * Send response back to user
   */
  private async sendResponse(response: any) {
    try {
      const transaction = new Transaction();

      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(JSON.stringify(response))
      });

      transaction.add(memoInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.agentKeypair]
      );

      console.log("Response sent, signature:", signature);
    } catch (error) {
      console.error("Error sending response:", error);
      throw error;
    }
  }

  /**
   * Send error response
   */
  private async sendErrorResponse(originalMessage: any, error: any) {
    const errorResponse = {
      version: "0.1.0",
      type: "aMessage",
      timestamp: Date.now().toString(),
      sender: this.agentKeypair.publicKey.toBase58(),
      recipients: [originalMessage.sender],
      messageType: "error",
      referenceId: originalMessage.messageId,
      content: {
        action: "ERROR",
        error: {
          message: "Error processing request",
          details: error.message
        }
      }
    };

    await this.sendResponse(errorResponse);
  }

  /**
   * Get agent statistics
   */
  getStats(): AMessageStats {
    return {
      address: this.agentKeypair.publicKey.toBase58(),
      earnings: this.earnings,
      status: "active",
      lastSignature: this.lastSignature,
      processedTransactions: this.processedTransactions,
      totalQueries: this.totalQueries,
      uptime: Date.now() - this.startTime
    };
  }
}

// Agent runner
async function main() {
  try {
    // Load environment variables
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!privateKey || !openaiKey) {
      throw new Error("Missing required environment variables");
    }

    // Create and start agent
    const agent = new AMessageAIAgent(privateKey, openaiKey);
    await agent.start();

    // Print stats every 5 minutes
    setInterval(() => {
      const stats = agent.getStats();
      console.log("\nAgent Stats:", {
        ...stats,
        uptime: `${Math.floor(stats.uptime / (1000 * 60))} minutes`
      });
    }, 300000); // 5 minutes
  } catch (error) {
    console.error("Error starting agent:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { AMessageAIAgent };
