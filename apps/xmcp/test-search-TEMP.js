const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

function fuzzyMatch(query, text) {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (textLower.includes(queryLower)) {
    return 1.0;
  }
  
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
  let matchedWords = 0;
  
  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matchedWords++;
    }
  }
  
  return matchedWords / queryWords.length;
}

async function testSearch() {
  console.log('Testing fuzzy search...\n');
  
  // Get all transcripts
  const { data: transcripts, error } = await supabase
    .from('transcripts_videos')
    .select('*');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Loaded ${transcripts.length} transcripts\n`);
  
  // Test 1: Search for "leadership"
  console.log('1. Searching for "leadership":');
  const leadershipResults = transcripts
    .map(transcript => ({
      ...transcript,
      score: fuzzyMatch('leadership', transcript.title) * 2 + fuzzyMatch('leadership', transcript.transcript)
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
    
  leadershipResults.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.title} (Score: ${result.score.toFixed(2)})`);
  });
  
  console.log('\n2. Searching for "volunteers":');
  const volunteerResults = transcripts
    .map(transcript => ({
      ...transcript,
      score: fuzzyMatch('volunteers', transcript.title) * 2 + fuzzyMatch('volunteers', transcript.transcript)
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
    
  volunteerResults.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.title} (Score: ${result.score.toFixed(2)})`);
  });
  
  console.log('\n3. Searching segments for "marriage":');
  const segmentResults = [];
  transcripts.forEach(transcript => {
    if (transcript.transcript_ts && Array.isArray(transcript.transcript_ts)) {
      transcript.transcript_ts.forEach(segment => {
        if (segment.text) {
          const score = fuzzyMatch('marriage', segment.text);
          if (score > 0.3) {
            segmentResults.push({
              title: transcript.title,
              segment: {
                start: segment.start || 0,
                text: segment.text,
                score
              }
            });
          }
        }
      });
    }
  });
  
  segmentResults
    .sort((a, b) => b.segment.score - a.segment.score)
    .slice(0, 5)
    .forEach((result, i) => {
      console.log(`  ${i + 1}. [${Math.floor(result.segment.start / 60)}:${Math.floor(result.segment.start % 60).toString().padStart(2, '0')}] ${result.title}`);
      console.log(`     "${result.segment.text.substring(0, 120)}..."`);
    });
}

testSearch().catch(console.error);
