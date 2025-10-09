import { Buffer } from 'buffer';
import { getEnv } from '../../lib/env';
import { content } from './content';
import { writeFileSync } from 'fs';
import { join } from 'path';

const { GLOO_AI_CLIENT_ID, GLOO_AI_CLIENT_SECRET } = getEnv();

async function main() {
  console.log('Starting biblical inference generation...');

  const results = [];

  for (const contentItem of content) {
    try {
      console.log(`Processing content item: ${contentItem.id}`);

      // Skip items without full_text
      if (!contentItem.full_text) {
        console.log(`Skipping ${contentItem.id} - no full_text available`);
        continue;
      }

      const inference = await generateBiblicalInference(contentItem.full_text);
      results.push({
        id: contentItem.id,
        biblical_inference: inference,
      });
      console.log(`Generated inference for ${contentItem.id}`);
    } catch (error) {
      console.error(`Error processing ${contentItem.id}:`, error);
    }
  }

  // Write results to inference.json
  const outputPath = join(__dirname, 'inference.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results written to ${outputPath}`);
}

async function generateBiblicalInference(fullText: string): Promise<string> {
  const accessToken = await getGlooAccessToken();

  // Create a better prompt with clearer instructions
  const prompt = `Create a concise biblical narrative (max 280 characters) that captures the spiritual essence of this Christian content. Focus on the core biblical themes and make it inspiring: ${fullText.substring(0, 1000)}`;

  const requestBody = {
    model: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 150,
    temperature: 0.7,
  };

  console.log('Sending request to Gloo AI...');

  try {
    const response = await fetch(
      'https://platform.ai.gloo.com/ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gloo AI API error:', response.status, errorText);

      // If we get a 500 error, try with a simpler prompt
      if (response.status === 500) {
        console.log('Trying with simpler prompt...');
        return await generateSimpleBiblicalInference(fullText, accessToken);
      }

      throw new Error(`Gloo AI API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Gloo AI');
    }

    const inference = data.choices[0].message.content.trim();

    // Ensure it's max 280 characters
    return inference.length > 280
      ? inference.substring(0, 277) + '...'
      : inference;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}

// Fallback function for when the main API fails
async function generateSimpleBiblicalInference(
  fullText: string,
  accessToken: string
): Promise<string> {
  const simplePrompt = `Create a short biblical insight (max 280 characters) based on Christian themes: ${fullText.substring(0, 500)}`;

  const requestBody = {
    model: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    messages: [
      {
        role: 'user',
        content: simplePrompt,
      },
    ],
    max_tokens: 100,
    temperature: 0.7,
  };

  const response = await fetch(
    'https://platform.ai.gloo.com/ai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Simple prompt also failed:', response.status, errorText);
    // Return a fallback message if both attempts fail
    return "A biblical narrative reflecting God's grace and truth.";
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    return "A biblical insight into God's eternal love.";
  }

  const inference = data.choices[0].message.content.trim();
  return inference.length > 280
    ? inference.substring(0, 277) + '...'
    : inference;
}

let cachedGlooAccessToken: string | null = null;

async function getGlooAccessToken(): Promise<string> {
  if (cachedGlooAccessToken) return cachedGlooAccessToken;
  else return fetchGlooAccessToken();
}

async function fetchGlooAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(
      `${GLOO_AI_CLIENT_ID}:${GLOO_AI_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://platform.ai.gloo.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'api/access',
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch access token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const { access_token } = data;

    // Simple caching - cache the token for this invocation
    cachedGlooAccessToken = access_token;

    return access_token;
  } catch (error) {
    console.error('[biblical-inference] Error fetching access token:', error);
    throw error;
  }
}

// Self-invoke main if called via package.json run script
if (require.main === module) {
  main().catch(console.error);
}
