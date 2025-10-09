import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Import messages.json
const messagesPath = path.join(__dirname, 'messages.json');
const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));

export async function getFullText() {
  /**
   * Write a cheerio dom scraping script
   * to fetch all the `"url": "https://www.desiringgod.org/messages/why-did-god-choose-you",` values
   * from the imported messages.json where the "full_text" property is blank
   * and then update that messages item in place so it includes full text
   *
   * Filter to just items where full_text does not exist or is empty
   * so that this script doesn't go overwriting or re-fetching every time it runs
   **/

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

  // Filter messages that need full text
  const messagesToFetch = messages.filter(
    (message: Message) => !message.full_text || message.full_text.trim() === ''
  );

  console.log(
    `Found ${messagesToFetch.length} messages to fetch full text for`
  );

  for (const message of messagesToFetch) {
    try {
      console.log(`Fetching full text for: ${message.title}`);

      const response = await fetch(message.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract the full text content
      // Based on Desiring God's website structure, the main content is typically in:
      // - <article> elements
      // - .content or .message-content classes
      // - <p> tags within the main content area

      let fullText = '';

      // Try different selectors to find the main content
      const contentSelectors = [
        'article .content',
        'article .message-content',
        'article .transcript',
        '.content',
        '.message-content',
        '.transcript',
        'article',
      ];

      for (const selector of contentSelectors) {
        const content = $(selector);
        if (content.length > 0) {
          // Get text content, clean it up
          const text = content.text().replace(/\s+/g, ' ').trim();

          if (text.length > 100) {
            // Ensure we have substantial content
            fullText = text;
            break;
          }
        }
      }

      // If no specific content found, fall back to body text
      if (!fullText) {
        fullText = $('body').text().replace(/\s+/g, ' ').trim();
      }

      // Update the message with the full text
      message.full_text = fullText;

      console.log(`✓ Successfully fetched full text for: ${message.title}`);
      console.log(`  Text length: ${fullText.length} characters`);

      // Add a small delay to be respectful to the server
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ Failed to fetch full text for: ${message.title}`);
      console.error(
        `  Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      // Mark as failed but don't break the loop
      message.full_text = `[Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  // Write the updated messages back to the file
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

  console.log(
    `\n✅ Completed! Updated ${messagesToFetch.length} messages with full text`
  );
  console.log(`📁 Updated file: ${messagesPath}`);

  return messages;
}

// Run the function if this script is executed directly
if (require.main === module) {
  getFullText().catch(console.error);
}
