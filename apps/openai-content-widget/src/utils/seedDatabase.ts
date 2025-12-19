import { supabase } from './supabase';
import { transformForDatabase } from './dataTransform';

// We'll fetch the video data dynamically
const VIDEO_DATA_URL = '/extracted_video_data_all.json';
type RawVideoData = Parameters<typeof transformForDatabase>[0];

/**
 * Seeds the database with video content from JSON
 */
export async function seedDatabase() {
  console.log('Starting database seed...');

  // Fetch video data from public folder
  const response = await fetch(VIDEO_DATA_URL);
  const videoData = (await response.json()) as RawVideoData[];

  console.log(`Processing ${videoData.length} videos`);

  // Transform all videos
  const transformedVideos = videoData.map((video) =>
    transformForDatabase(video)
  );

  // Insert in batches to avoid timeout
  const batchSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < transformedVideos.length; i += batchSize) {
    const batch = transformedVideos.slice(i, i + batchSize);

    const { error } = await supabase
      .from('content_items')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(
        `Inserted batch ${i / batchSize + 1}: ${batch.length} videos`
      );
    }
  }

  console.log(`Seed complete! Inserted: ${inserted}, Errors: ${errors}`);

  return { inserted, errors };
}
