import { AIContentSections, ContentMetadata } from '../types/ai-widget';

const CONTENT_PROXY_URL =
  import.meta.env.VITE_CONTENT_PROXY_URL || 'http://localhost:3002';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CompletionResponse {
  completion: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
}

/**
 * Call the content-proxy completions API
 */
async function callCompletionsAPI(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(
      `${CONTENT_PROXY_URL}/api/glooai/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: CompletionResponse = await response.json();
    return data.completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling completions API:', error);
    throw error;
  }
}

/**
 * Generate AI content for a collection of videos
 */
export async function fetchGlooAIRelevance(
  contentList: ContentMetadata[],
  userQuery: string,
  conversationContext?: string
): Promise<AIContentSections> {
  try {
    const videoTitles = contentList.map((c) => c.title).join(', ');
    const seriesTitles = [
      ...new Set(contentList.map((c) => c.seriesTitle).filter(Boolean)),
    ].join(', ');

    // Build context string for prompts
    const contextString = conversationContext
      ? `\n\nContext: ${conversationContext}`
      : '';

    // Generate overview
    const overviewMessages: Message[] = [
      {
        role: 'system',
        content:
          'You are a biblical content expert helping users explore biblical video content discovered through ChatGPT. Provide clear, engaging overviews that connect to their original question.',
      },
      {
        role: 'user',
        content: `The user originally asked: "${userQuery}"${contextString}\n\nBased on this, I found ${contentList.length} videos about "${seriesTitles}" covering: ${videoTitles}.\n\nWrite a 2-3 sentence overview explaining how this video collection addresses their question.`,
      },
    ];

    // Generate key themes
    const themesMessages: Message[] = [
      {
        role: 'system',
        content:
          'You are a theological expert helping users understand biblical themes relevant to their ChatGPT query.',
      },
      {
        role: 'user',
        content: `The user asked: "${userQuery}"${contextString}\n\nI found videos about "${seriesTitles}": ${videoTitles}.\n\nIdentify 3-5 key biblical themes in this content that relate to their question. Format each as "**Theme Name**: Brief explanation." Separate with double newlines.`,
      },
    ];

    // Generate relevance
    const relevanceMessages: Message[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant explaining why discovered biblical content directly answers user questions from ChatGPT.',
      },
      {
        role: 'user',
        content: `Original ChatGPT question: "${userQuery}"${contextString}\n\nDiscovered content: ${contentList.length} videos about "${seriesTitles}" (${videoTitles}).\n\nExplain in 3-4 sentences how this content directly addresses their question and what specific insights they'll gain. Be enthusiastic about the match between their need and this content.`,
      },
    ];

    // Call API in parallel for better performance
    const [overview, keyThemes, relevance] = await Promise.all([
      callCompletionsAPI(overviewMessages),
      callCompletionsAPI(themesMessages),
      callCompletionsAPI(relevanceMessages),
    ]);

    return {
      overview,
      keyThemes,
      relevance,
    };
  } catch (error) {
    console.error('Failed to fetch Gloo AI relevance, using fallback:', error);
    // Return fallback content if API fails
    return generateFallbackRelevanceText(
      contentList,
      userQuery,
      conversationContext
    );
  }
}

/**
 * Generate AI context for a single video (overview + relevance)
 */
export async function generateVideoContext(video: {
  title: string;
  description: string;
  transcript?: string;
}): Promise<{ overview: string; relevance: string }> {
  try {
    // Generate overview
    const overviewMessages: Message[] = [
      {
        role: 'system',
        content:
          'You are a biblical content expert. Provide concise, engaging video overviews.',
      },
      {
        role: 'user',
        content: `Write a 2-3 sentence overview for a video titled "${video.title}". Description: ${video.description}. Explain what viewers will learn.`,
      },
    ];

    // Generate relevance
    const relevanceMessages: Message[] = [
      {
        role: 'system',
        content:
          'You are a biblical education expert. Explain why content matters.',
      },
      {
        role: 'user',
        content: `In 2-3 sentences, explain why understanding "${video.title}" is important for Bible study. Connect to broader biblical themes and practical application.`,
      },
    ];

    // Call API in parallel
    const [overview, relevance] = await Promise.all([
      callCompletionsAPI(overviewMessages),
      callCompletionsAPI(relevanceMessages),
    ]);

    return { overview, relevance };
  } catch (error) {
    console.error('Failed to generate video context, using fallback:', error);
    // Return fallback content if API fails
    return generateFallbackVideoContext(video);
  }
}

// --- Fallback functions (used when API is unavailable) ---

function generateFallbackRelevanceText(
  contentList: ContentMetadata[],
  _userQuery: string,
  _conversationContext?: string
): AIContentSections {
  const videoCount = contentList.length;
  const seriesTitles = [
    ...new Set(contentList.map((c) => c.seriesTitle).filter(Boolean)),
  ].join(' and ');

  return {
    overview: `This collection of ${videoCount} videos explores ${seriesTitles}, providing deep insights into the biblical narrative and its theological significance. The content examines key passages and themes, helping viewers understand how these books fit into the broader story of Scripture and God's redemptive plan for humanity.`,

    keyThemes: `**Universal Salvation**: The content presents Jesus as the Savior for all humanity, breaking down barriers between different groups of people.\n\n**The Holy Spirit**: Explores how the Spirit's power and guidance drive the biblical narrative.\n\n**Prayer and Worship**: Emphasizes prayer as essential to following God's will and experiencing His power.\n\n**Journey and Mission**: Shows how physical journeys mirror spiritual journeys as people respond to God's call.`,

    relevance: `These videos directly address your question about ${seriesTitles} by examining the biblical text through careful narrative analysis and theological reflection. The content explores the unified story of God's redemptive plan. Videos like "${contentList[0]?.title || 'Introduction'}" provide crucial context for understanding the historical and theological purposes, helping you grasp not just individual stories, but how they fit together in God's overarching plan.`,
  };
}

function generateFallbackVideoContext(video: {
  title: string;
  description: string;
}): { overview: string; relevance: string } {
  return {
    overview: `This video explores ${video.title}, providing deep insights into the biblical narrative and its theological significance. The content examines key passages and themes, helping viewers understand how this fits into the broader story of Scripture and God's redemptive plan for humanity.`,

    relevance: `Understanding ${video.title} is essential for grasping the full scope of biblical teaching. This video connects historical context with practical application, showing how ancient truths speak powerfully into modern life. Whether you're new to Scripture study or deepening your existing knowledge, this content offers valuable perspectives that can transform how you read and apply God's Word.`,
  };
}
