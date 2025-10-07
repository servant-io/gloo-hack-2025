const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load the transcripts data
const transcriptsData = JSON.parse(fs.readFileSync('./transcripts.json', 'utf8'));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadTranscripts() {
  console.log(`Uploading ${transcriptsData.items.length} transcripts...`);
  
  for (let i = 0; i < transcriptsData.items.length; i++) {
    const item = transcriptsData.items[i];
    
    const { data, error } = await supabase
      .from('transcripts_videos')
      .insert({
        title: item.title,
        training_url: item.training_url,
        video_url: item.video_url,
        transcript: item.transcript,
        transcript_ts: item.segments || null
      });
    
    if (error) {
      console.error(`Error uploading item ${i + 1}:`, error);
    } else {
      console.log(`✓ Uploaded: ${item.title}`);
    }
  }
  
  console.log('Upload complete!');
}

uploadTranscripts().catch(console.error);
