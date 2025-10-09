import { AIContentSections, ContentMetadata } from '../types/ai-widget';

const MOCK_DELAY_MS = 1200;

function generateMockOverview(
  contentList: ContentMetadata[],
  query: string
): string {
  const seriesNames = [
    ...new Set(contentList.map((c) => c.seriesTitle).filter(Boolean)),
  ];
  const videoCount = contentList.length;

  return `The Gospel of Luke and the Book of Acts form a two-volume work that tells the connected story of Jesus and the early church. These ${videoCount} videos explore the narrative arc from Jesus' birth and ministry through the explosive growth of Christianity across the Roman Empire. Luke emphasizes Jesus as the Savior for all people, while Acts demonstrates how the Holy Spirit empowered the apostles to spread this message from Jerusalem to the ends of the earth.`;
}

function generateMockKeyThemes(contentList: ContentMetadata[]): string {
  const themes = [
    '**Universal Salvation**: Luke presents Jesus as the Savior for all humanity, breaking down barriers between Jews and Gentiles, rich and poor, men and women.',
    "**The Holy Spirit**: From Jesus' conception to the explosive growth in Acts, the Spirit's power and guidance drive the entire narrative.",
    "**Prayer and Worship**: Both books emphasize prayer as essential to following God's will and experiencing His power.",
    '**Reversal of Expectations**: The proud are humbled and the humble are exalted throughout both narratives.',
    "**Journey and Mission**: Physical journeys mirror spiritual journeys as characters respond to God's call.",
  ];

  return themes.slice(0, Math.min(5, contentList.length + 2)).join('\n\n');
}

function generateMockRelevance(
  contentList: ContentMetadata[],
  query: string
): string {
  const titles = contentList
    .slice(0, 3)
    .map((c) => c.title)
    .join(', ');

  return `These videos directly address your question about Luke-Acts by examining the biblical text through careful narrative analysis and theological reflection. The content explores how Luke crafted his two-volume work as a unified story, tracing God's redemptive plan from the birth of Jesus through the establishment of the early church. Videos like "${contentList[0]?.title || "Luke's Introduction"}" provide crucial context for understanding Luke's historical and theological purposes, while the progression through Acts shows how Jesus' mission expanded from a local Jewish context to a global movement. This comprehensive approach helps you grasp not just the individual stories, but how they fit together in God's overarching plan of salvation for all people.`;
}

export async function generateRelevanceText(
  contentList: ContentMetadata[],
  userQuery: string
): Promise<AIContentSections> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return {
    overview: generateMockOverview(contentList, userQuery),
    keyThemes: generateMockKeyThemes(contentList),
    relevance: generateMockRelevance(contentList, userQuery),
  };
}

export async function fetchGlooAIRelevance(
  contentList: ContentMetadata[],
  userQuery: string,
  apiKey?: string
): Promise<AIContentSections> {
  if (!apiKey || apiKey === 'mock') {
    return generateRelevanceText(contentList, userQuery);
  }

  return generateRelevanceText(contentList, userQuery);
}

function generateVideoOverview(video: {
  title: string;
  description: string;
  transcript?: string;
}): string {
  return `This video explores ${video.title.toLowerCase()}, providing deep insights into the biblical narrative and its theological significance. The content examines key passages and themes, helping viewers understand how this fits into the broader story of Scripture and God's redemptive plan for humanity.`;
}

function generateVideoRelevance(video: {
  title: string;
  description: string;
}): string {
  return `Understanding ${video.title} is essential for grasping the full scope of biblical teaching. This video connects historical context with practical application, showing how ancient truths speak powerfully into modern life. Whether you're new to Scripture study or deepening your existing knowledge, this content offers valuable perspectives that can transform how you read and apply God's Word.`;
}

export async function generateVideoContext(
  video: { title: string; description: string; transcript?: string },
  apiKey?: string
): Promise<{ overview: string; relevance: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    overview: generateVideoOverview(video),
    relevance: generateVideoRelevance(video),
  };
}
