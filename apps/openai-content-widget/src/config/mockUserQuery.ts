/**
 * Mock User Query Configuration
 *
 * This simulates the original ChatGPT prompt that would have triggered
 * the discovery of the Scripture Journey Explorer widget.
 *
 * In a real implementation, this query would be passed from ChatGPT
 * when the app is discovered and embedded.
 */

export interface MockUserQuery {
  /** The original query the user asked in ChatGPT */
  originalPrompt: string;

  /** Optional: The series/theme that was matched for content discovery */
  contentTheme?: string;

  /** Optional: Any additional context from the ChatGPT conversation */
  conversationContext?: string;
}

/**
 * Default mock query - simulates a user asking ChatGPT about Luke-Acts
 *
 * Change this to test different scenarios and see how Gloo AI responds
 * with different context combinations.
 */
export const DEFAULT_MOCK_QUERY: MockUserQuery = {
  originalPrompt:
    "I'm studying the Gospel of Luke and Acts for a Bible study group I'm leading. Can you help me understand how these two books connect and what the main themes are? I want to teach this in a way that makes it accessible and engaging.",

  contentTheme: 'Luke-Acts',

  conversationContext:
    "User is preparing to lead a Bible study group and wants to understand the narrative connection between Luke's Gospel and the book of Acts.",
};

/**
 * Alternative queries for testing
 * Uncomment and export one of these to test different scenarios
 */

// Early church history focus
export const EARLY_CHURCH_QUERY: MockUserQuery = {
  originalPrompt:
    "How did Christianity spread in the first century? I'd like to understand the early church's growth from Jerusalem to the Roman Empire.",
  contentTheme: 'Luke-Acts',
  conversationContext:
    'User is interested in early church history and missionary expansion.',
};

// Theological focus
export const THEOLOGICAL_QUERY: MockUserQuery = {
  originalPrompt:
    "What does Luke emphasize about Jesus that's different from the other Gospels? I'm trying to understand each Gospel's unique perspective.",
  contentTheme: 'Luke-Acts',
  conversationContext:
    "User is doing comparative Gospel study and wants to understand Luke's unique theological contributions.",
};

// New believer focus
export const NEW_BELIEVER_QUERY: MockUserQuery = {
  originalPrompt:
    "I'm new to Christianity and want to read through the Bible. Where should I start? Someone recommended Luke.",
  contentTheme: 'Luke-Acts',
  conversationContext:
    'New believer looking for an accessible entry point to Bible reading.',
};

// Academic research focus
export const ACADEMIC_QUERY: MockUserQuery = {
  originalPrompt:
    "I'm writing a paper on Luke-Acts as a unified narrative. What are the key literary connections and theological themes that tie these two books together?",
  contentTheme: 'Luke-Acts',
  conversationContext:
    'Academic researcher studying Luke-Acts as a two-volume work.',
};
