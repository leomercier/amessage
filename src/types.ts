export interface AMessageResponse {
  version: string;
  type: string;
  timestamp: string;
  sender: string;
  recipients: string[];
  messageType: string;
  referenceId: string;
  content: {
    action: string;
    status: string;
    response: {
      answer: string;
      confidence: number;
      sources: Array<{
        type: string;
        url: string;
        timestamp: string;
      }>;
      follow_up_suggestions: string[];
    };
    metadata: {
      response_time: string;
      tokens_used: number;
      model_version: string;
    };
    payment: {
      amount: number;
      status: string;
      transaction_id: string;
    };
  };
}
