import { readFileSync } from 'fs';
import { join } from 'path';

// Read messages.json file directly
const messagesPath = join(
  __dirname,
  'content-creators/desiring-god/messages.json'
);
const messagesData = readFileSync(messagesPath, 'utf-8');
const messages = JSON.parse(messagesData);

export const content = [
  ...messages.map((message: any) => ({
    id: message.id,
    full_text: message.full_text,
  })),
];
