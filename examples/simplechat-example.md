# Simple Chat Query Flow Example

## 1. User Query

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287341",
  "sender": "USER123...xyz",
  "recipients": ["AIBOT456...abc"],
  "messageType": "request",
  "messageId": "chat_12345",
  "content": {
    "action": "CHAT_QUERY",
    "parameters": {
      "query": "Who created Solana?",
      "context": {
        "conversation_id": "new",
        "language": "en",
        "response_style": "concise"
      }
    },
    "compensation": {
      "amount": 0.001, // Micro-payment for simple query
      "terms": "fixed"
    }
  }
}
```

## 2. AI Response

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287342",
  "sender": "AIBOT456...abc",
  "recipients": ["USER123...xyz"],
  "messageType": "response",
  "referenceId": "chat_12345",
  "content": {
    "action": "CHAT_RESPONSE",
    "status": "completed",
    "response": {
      "answer": "Solana was created by Anatoly Yakovenko in 2017. He founded Solana Labs along with Greg Fitzgerald and Eric Williams. The project was officially launched in March 2020.",
      "confidence": 0.98,
      "sources": [
        {
          "type": "documentation",
          "url": "solana.com/history",
          "timestamp": "2020-03"
        }
      ],
      "follow_up_suggestions": [
        "What makes Solana unique?",
        "How does Solana achieve high transaction speeds?",
        "What is Proof of History?"
      ]
    },
    "metadata": {
      "response_time": "0.12s",
      "tokens_used": 48,
      "model_version": "aMessage_chat_v1"
    },
    "payment": {
      "amount": 0.001,
      "status": "processed",
      "transaction_id": "SOL_tx_456789"
    }
  }
}
```

## Key Features Demonstrated

1. **Query Structure**

   - Simple, direct question
   - Context parameters
   - Micro-payment model
   - Conversation tracking

2. **Response Components**

   - Direct answer
   - Confidence score
   - Source references
   - Follow-up suggestions
   - Usage metadata

3. **Payment Model**

   - Micro-transaction (0.001 SOL)
   - Fixed pricing for simple queries
   - Payment confirmation

4. **Protocol Benefits**
   - Fast response time
   - Transparent pricing
   - Source attribution
   - Extensi
