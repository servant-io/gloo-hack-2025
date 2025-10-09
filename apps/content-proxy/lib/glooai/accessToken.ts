import { Buffer } from 'buffer';
import { getEnv } from '../env';

const { GLOO_AI_CLIENT_ID, GLOO_AI_CLIENT_SECRET } = getEnv();

/**
 * @see https://docs.gloo.com/getting-started/quickstart-developers#step-3%3A-generate-an-access-token
 */
export async function fetchAccessToken(): Promise<string> {
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
  return data.access_token;
}
