# Completions API

This API endpoint provides AI chat completions using the Gloo AI platform. It allows you to send conversation messages and receive AI-generated responses with various configuration options.

## Endpoint

```
POST /api/glooai/completions
```

## Request Body

### Required Fields

- `messages` (array): Array of message objects representing the conversation history

### Message Object Structure

Each message object must have:

- `role` (string): One of `"user"`, `"assistant"`, or `"system"`
- `content` (string): The text content of the message

### Optional Parameters

- `model` (string): AI model to use (default: "GlooMax-Beacon")
- `max_tokens` (integer): Maximum number of tokens to generate (default: 1024)
- `stream` (boolean): Whether to stream the response (default: false)
- `temperature` (number): Sampling temperature between 0 and 1 (default: 0.7)
- `tools` (array): Array of tool definitions for function calling
- `tool_choice` (string): Tool choice strategy - "none", "auto", or specific tool name (default: "none")

## Request Examples

### Basic Request

```bash
curl -X POST "http://localhost:3002/api/glooai/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello! Can you introduce yourself?"}
    ]
  }'
```

### Request with System Message and Options

```bash
curl -X POST "http://localhost:3002/api/glooai/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant that specializes in Bible study."},
      {"role": "user", "content": "What is the gospel message?"}
    ],
    "temperature": 0.8,
    "max_tokens": 500
  }'
```

### Conversation History Request

```bash
curl -X POST "http://localhost:3002/api/glooai/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a theological expert."},
      {"role": "user", "content": "What is justification by faith?"},
      {"role": "assistant", "content": "Justification by faith is the Protestant doctrine that God declares sinners righteous through faith in Jesus Christ alone, not by works."},
      {"role": "user", "content": "How does this differ from Catholic teaching?"}
    ],
    "temperature": 0.7,
    "max_tokens": 800
  }'
```

## Response Format

### Success Response

```json
{
  "completion": {
    "id": "chatcmpl-1234567890abcdef",
    "choices": [
      {
        "finish_reason": "stop",
        "index": 0,
        "logprobs": null,
        "message": {
          "content": "Hello! I'm an AI assistant created by Gloo to help with various tasks. I can answer questions, provide information, assist with writing, and much more. How can I help you today?",
          "refusal": null,
          "role": "assistant",
          "annotations": null,
          "audio": null,
          "function_call": null,
          "tool_calls": null
        }
      }
    ],
    "created": 1739059200,
    "model": "GlooMax-Beacon",
    "object": "chat.completion",
    "service_tier": null,
    "system_fingerprint": "fp_1234567890",
    "usage": {
      "completion_tokens": 45,
      "prompt_tokens": 12,
      "total_tokens": 57,
      "completion_tokens_details": null,
      "prompt_tokens_details": null
    }
  },
  "messages": 1,
  "model": "GlooMax-Beacon",
  "usage": {
    "completion_tokens": 45,
    "prompt_tokens": 12,
    "total_tokens": 57
  }
}
```

### Error Responses

#### Missing Required Field

```json
{
  "error": "Messages array is required"
}
```

#### Invalid Message Structure

```json
{
  "error": "Each message must have a role and content"
}
```

#### Invalid Message Role

```json
{
  "error": "Message role must be one of: user, assistant, system"
}
```

#### Authentication Error

```json
{
  "error": "Authentication failed with Gloo AI platform"
}
```

#### Service Unavailable

```json
{
  "error": "Failed to generate completion from Gloo AI platform"
}
```

#### Internal Server Error

```json
{
  "error": "Failed to generate completion"
}
```

## Error Codes

- `400`: Bad Request - Invalid request body or missing required fields
- `401`: Unauthorized - Authentication failed with Gloo AI platform
- `500`: Internal Server Error - General server error
- `502`: Bad Gateway - Failed to generate completion from Gloo AI platform

## Usage Notes

- The `messages` array must contain at least one message
- Messages are processed in order, maintaining conversation context
- System messages help set the AI's behavior and persona
- Assistant messages provide conversation history for context
- Temperature controls randomness (0.0 = deterministic, 1.0 = creative)
- Max tokens limits response length to control costs
- The API automatically handles authentication and rate limiting

## Example Use Cases

1. **Bible Study Assistant**: Create a theological expert persona to answer Bible questions
2. **Sermon Preparation**: Generate sermon outlines or explanations of biblical concepts
3. **Small Group Discussions**: Create discussion questions or summarize biblical passages
4. **Personal Devotion**: Get daily devotionals or spiritual guidance
5. **Theological Research**: Explore complex theological concepts with expert guidance
6. **Content Creation**: Generate Christian content for blogs, social media, or newsletters
7. **Educational Materials**: Create study guides or explanations for Bible studies
8. **Counseling Support**: Provide biblical wisdom for life situations and challenges

## Best Practices

1. **Start with a System Message**: Define the AI's role and expertise for better responses
2. **Provide Clear Context**: Include relevant conversation history for coherent responses
3. **Use Appropriate Temperature**: Lower values (0.2-0.5) for factual responses, higher (0.7-0.9) for creative tasks
4. **Set Reasonable Token Limits**: Balance response quality with cost considerations
5. **Validate Input**: Ensure messages are properly formatted before sending
6. **Handle Errors Gracefully**: Implement proper error handling for production use
7. **Monitor Usage**: Track token usage to manage costs and performance
