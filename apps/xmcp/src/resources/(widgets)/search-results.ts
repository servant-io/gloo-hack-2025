import { type ResourceMetadata } from 'xmcp';

export const metadata: ResourceMetadata = {
  name: 'search-results-widget',
  mimeType: 'text/html+skybridge',
  description: 'Displays search results for podcasts',
};

export default function handler() {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    #results-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    h1 {
      color: white;
      margin-bottom: 24px;
      font-size: 28px;
      text-align: center;
    }
    
    .result-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .result-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Different styles for each card */
    .result-card:nth-child(2) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .result-card:nth-child(3) {
      background: #1a1a1a;
      color: white;
      border-left: 4px solid #667eea;
    }
    
    .result-card:nth-child(4) {
      background: #f0f4f8;
      border: 2px solid #667eea;
    }
    
    .result-card:nth-child(5) {
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    }
    
    .podcast-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .podcast-description {
      font-size: 14px;
      opacity: 0.8;
      line-height: 1.5;
    }
    
    .podcast-host {
      font-size: 12px;
      margin-top: 8px;
      opacity: 0.6;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div id="results-container">
    <h1>🎙️ Podcast Search Results</h1>
    <div id="results"></div>
  </div>
  
  <script>
    // Get data from ChatGPT
    const data = window.openai?.toolOutput || { results: [] };
    
    // Render results
    const resultsDiv = document.getElementById('results');
    
    data.results.forEach((podcast, index) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      
      // Add click handler for training videos
      if (podcast.training_url) {
        card.style.cursor = 'pointer';
        card.onclick = () => window.open(podcast.training_url, '_blank');
      }
      
      let segmentsHtml = '';
      if (podcast.matched_segments && podcast.matched_segments.length > 0) {
        segmentsHtml = \`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; opacity: 0.7;">Key Segments:</div>
            \${podcast.matched_segments.map(segment => \`
              <div style="font-size: 11px; margin-bottom: 4px; opacity: 0.8;">
                \${Math.floor(segment.start / 60)}:\${Math.floor(segment.start % 60).toString().padStart(2, '0')} - \${segment.text.substring(0, 80)}\${segment.text.length > 80 ? '...' : ''}
              </div>
            \`).join('')}
          </div>
        \`;
      }
      
      card.innerHTML = \`
        <div class="podcast-title">\${podcast.title}</div>
        <div class="podcast-description">\${podcast.description}</div>
        <div class="podcast-host">\${podcast.host} \${podcast.relevance_score ? \`(Score: \${podcast.relevance_score.toFixed(2)})\` : ''}</div>
        \${segmentsHtml}
      \`;
      resultsDiv.appendChild(card);
    });
  </script>
</body>
</html>
  `.trim();
}
