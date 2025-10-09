import { fetchAccessToken } from './accessToken';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: Message[];
  max_tokens?: number;
  stream?: boolean;
  temperature?: number;
  tools?: any[];
  tool_choice?: 'none' | 'auto' | string;
}

export interface CompletionResponse {
  id: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    logprobs: null;
    message: {
      content: string;
      refusal: null;
      role: string;
      annotations: null;
      audio: null;
      function_call: null;
      tool_calls: null;
    };
  }>;
  created: number;
  model: string;
  object: string;
  service_tier: null;
  system_fingerprint: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens_details: null;
    prompt_tokens_details: null;
  };
}

export async function generateCompletion(
  messages: Message[],
  options: Partial<Omit<CompletionRequest, 'messages'>> = {}
): Promise<CompletionResponse> {
  const accessToken = await fetchAccessToken();

  const requestBody: CompletionRequest = {
    model: options.model ?? 'us.meta.llama3-3-70b-instruct-v1:0',
    messages,
    max_tokens: options.max_tokens ?? 1024,
    stream: options.stream ?? false,
    temperature: options.temperature ?? 0.7,
    tools: options.tools ?? [],
    tool_choice: options.tool_choice ?? 'none',
  };

  const response = await fetch(
    'https://platform.ai.gloo.com/ai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to generate completion: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as CompletionResponse;
}
