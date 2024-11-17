#! /usr/bin/env node
import { Command } from "commander";
import { AMessageClient } from "./index";
import * as dotenv from "dotenv";
import chalk from "chalk";
import { config } from "./config";

// Load environment variables
dotenv.config();

const program = new Command();

const messageId = `chat_${Date.now()}`;

program
  .version("0.1.0")
  .description("CLI tool for interacting with aMessage protocol on Solana");

program
  .description("Send a query to an AI agent")
  .option("-m, --message <question>", "JSON string of the message")
  .option("-a, --agent <address>", "AI agent address", config.defaultAiAgent)
  .option("-p, --payment <amount>", "Payment amount in SOL", "0.001")
  .action(async (options, command) => {
    try {
      const privateKey = process.env.CLIENT_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("SOLANA_PRIVATE_KEY not found in environment");
      }
      // Combine the message with any additional arguments
      let fullMessage = options.message || "";
      if (command.args && command.args.length > 0) {
        fullMessage += " " + command.args.join(" ");
      }

      // Trim any extra spaces
      fullMessage = fullMessage.trim();

      if (!fullMessage) {
        console.error(chalk.red("Error: No message provided"));
        process.exit(1);
      }

      const question = fullMessage;

      const client = new AMessageClient(privateKey);

      console.log("\nSending query to 🗿 AROK AI agent...");
      console.log("Question:", question);
      console.log("Agent:", options.agent);
      console.log("Payment:", options.payment, "SOL");

      const signature = await client.sendChatQuery(
        messageId,
        question,
        options.agent,
        parseFloat(options.payment)
      );

      console.log("\nQuery sent! Transaction signature:", signature);
      console.log("\nWaiting for response...");

      const response = await client.listenForResponses(`chat_${Date.now()}`);

      if (response.content.status === "completed") {
        console.log("\n=== Response ===");
        console.log("\nAnswer:", response.content.response.answer);
        console.log("\nConfidence:", response.content.response.confidence);
        // console.log("\nSources:");
        // response.content.response.sources.forEach((source: any) => {
        //   console.log(`- ${source.type}: ${source.url} (${source.timestamp})`);
        // });
        // console.log("\nFollow-up suggestions:");
        // response.content.response.follow_up_suggestions.forEach(
        //   (suggestion: string) => {
        //     console.log(`- ${suggestion}`);
        //   }
        // );
        // console.log("\nMetadata:", response.content.metadata);
      }
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);
