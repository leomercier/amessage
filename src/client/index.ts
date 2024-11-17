// aMessage Solana Client Implementation
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair
} from "@solana/web3.js";
import { Buffer } from "buffer";
import bs58 from "bs58";

// Configuration
const SOLANA_NETWORK = "https://api.mainnet-beta.solana.com";
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

// aMessage Client Class
export class AMessageClient {
  private connection: Connection;
  private userKeypair: Keypair;

  constructor(privateKeyBase58: string) {
    this.connection = new Connection(SOLANA_NETWORK);
    this.userKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
  }

  /**
   * Create and send an aMessage query
   */
  async sendChatQuery(
    messageId: string,
    query: string,
    aiAgent: string,
    compensation: number
  ): Promise<string> {
    // Construct aMessage query
    const message = {
      version: "0.1.0",
      type: "aMessage",
      timestamp: Date.now().toString(),
      sender: this.userKeypair.publicKey.toBase58(),
      recipients: [aiAgent],
      messageType: "request",
      messageId: messageId,
      content: {
        action: "CHAT_QUERY",
        parameters: {
          query,
          context: {
            conversation_id: "new",
            language: "en",
            response_style: "concise"
          }
        },
        compensation: {
          amount: compensation,
          terms: "fixed"
        }
      }
    };

    // Create and send transaction
    try {
      const transaction = await this.createMessageTransaction(
        message,
        aiAgent,
        compensation
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.userKeypair]
      );

      return signature;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Listen for responses from AI agents
   */
  async listenForResponses(messageId: string): Promise<any> {
    return new Promise((resolve) => {
      // Subscribe to program account changes
      const subscriptionId = this.connection.onProgramAccountChange(
        MEMO_PROGRAM_ID,
        async (accountInfo) => {
          try {
            const memo = accountInfo.accountInfo.data.toString();
            const response = JSON.parse(memo);

            // Check if this is a response to our message
            if (response.referenceId === messageId) {
              this.connection.removeAccountChangeListener(subscriptionId);
              resolve(response);
            }
          } catch (error) {
            console.error("Error processing response:", error);
          }
        }
      );
    });
  }

  /**
   * Create a Solana transaction with message and payment
   */
  private async createMessageTransaction(
    message: any,
    recipient: string,
    amount: number
  ): Promise<Transaction> {
    const transaction = new Transaction();

    // Add memo instruction with message
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(JSON.stringify(message))
    });

    // Add payment instruction
    const paymentInstruction = SystemProgram.transfer({
      fromPubkey: this.userKeypair.publicKey,
      toPubkey: new PublicKey(recipient),
      lamports: amount * 1e9 // Convert SOL to lamports
    });

    transaction.add(memoInstruction, paymentInstruction);
    return transaction;
  }
}

// // Example usage
// async function main() {
//   try {
//     // Initialize client with your private key
//     const privateKey = process.env.CLIENT_PRIVATE_KEY as string;
//     const client = new AMessageClient(privateKey);

//     // AI agent's Solana address
//     const aiAgent = "AI_AGENT_ADDRESS_HERE";

//     // Send a query
//     console.log("Sending query...");
//     const signature = await client.sendChatQuery(
//       "Who created Solana?",
//       aiAgent,
//       0.001 // 0.001 SOL payment
//     );
//     console.log("Query sent! Transaction signature:", signature);

//     // Listen for response
//     console.log("Waiting for response...");
//     const response = await client.listenForResponses(`chat_${Date.now()}`);
//     console.log("Received response:", response);

//     // Process the response
//     if (response.content.status === "completed") {
//       console.log("\nAnswer:", response.content.response.answer);
//       console.log("\nConfidence:", response.content.response.confidence);
//       console.log("\nSources:", response.content.response.sources);
//       console.log(
//         "\nFollow-up suggestions:",
//         response.content.response.follow_up_suggestions
//       );
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// // Run the example
// main();

// Utility Types
