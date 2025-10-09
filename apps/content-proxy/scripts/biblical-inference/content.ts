import { readFileSync } from 'fs';
import { join } from 'path';

// Define the message interface
interface Message {
  id: string;
  type: string;
  media: string;
  title: string;
  subtitle: string | null;
  author: string;
  date_text: string;
  summary: string;
  url: string;
  image_url: string;
  full_text?: string;
}

// Read messages.json file directly
const messagesPath = join(
  __dirname,
  'content-creators/desiring-god/messages.json'
);
const messagesData = readFileSync(messagesPath, 'utf-8');
const messages: Message[] = JSON.parse(messagesData);

export const content = [
  ...messages.map((message: Message) => ({
    id: message.id,
    full_text: message.full_text,
  })),
];
