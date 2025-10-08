import { type ResourceMetadata } from 'xmcp';

export const metadata: ResourceMetadata = {
  name: 'document-content-widget',
  mimeType: 'text/html+skybridge',
  description:
    'Displays detailed document content with transcript and metadata',
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
    
    #content-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    h1 {
      color: white;
      margin-bottom: 24px;
      font-size: 28px;
      text-align: center;
    }
    
    .document-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .document-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1a1a1a;
    }
    
    .document-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    
    .meta-item {
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      color: #666;
    }
    
    .meta-label {
      font-weight: 600;
      color: #333;
    }
    
    .document-url {
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      display: inline-block;
      transition: background 0.2s;
    }
    
    .document-url:hover {
      background: #5a6fd8;
    }
    
    .content-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .content-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1a1a1a;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }
    
    .transcript-content {
      line-height: 1.6;
      font-size: 14px;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      padding: 16px;
      background: #fafbfc;
    }
    
    .error-state {
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    
    .loading-state {
      text-align: center;
      color: white;
      font-size: 16px;
      padding: 40px;
    }
    
    .copy-button {
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      margin-top: 12px;
      transition: background 0.2s;
    }
    
    .copy-button:hover {
      background: #218838;
    }
    
    .copy-button:active {
      background: #1e7e34;
    }
  </style>
</head>
<body>
  <div id="content-container">
    <h1>📄 Document Content</h1>
    <div id="content"></div>
  </div>
  
  <script>
    // Get data from ChatGPT
    const data = window.openai?.toolOutput || { structuredContent: { document: null } };
    
    // Render content
    const contentDiv = document.getElementById('content');
    
    if (!data.structuredContent || !data.structuredContent.document) {
      contentDiv.innerHTML = \`
        <div class="loading-state">
          <div>Loading document content...</div>
        </div>
      \`;
      return;
    }
    
    const document = data.structuredContent.document;
    const metadata = data.structuredContent.metadata;
    
    if (metadata.error) {
      contentDiv.innerHTML = \`
        <div class="error-state">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">⚠️ Error</div>
          <div>\${document.text}</div>
        </div>
      \`;
      return;
    }
    
    // Format text length
    const formatTextLength = (length) => {
      if (length < 1000) return \`\${length} characters\`;
      return \`\${Math.round(length / 1000)}k characters\`;
    };
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch {
        return 'Unknown';
      }
    };
    
    contentDiv.innerHTML = \`
      <div class="document-header">
        <div class="document-title">\${document.title}</div>
        <div class="document-meta">
          <div class="meta-item">
            <span class="meta-label">ID:</span> \${document.id}
          </div>
          <div class="meta-item">
            <span class="meta-label">Length:</span> \${formatTextLength(document.text.length)}
          </div>
          <div class="meta-item">
            <span class="meta-label">Source:</span> \${document.metadata.source}
          </div>
          <div class="meta-item">
            <span class="meta-label">Created:</span> \${formatDate(document.metadata.created_at)}
          </div>
        </div>
        \${document.url ? \`<a href="\${document.url}" target="_blank" class="document-url">🔗 View Original</a>\` : ''}
      </div>
      
      <div class="content-section">
        <div class="content-title">📝 Transcript Content</div>
        <div class="transcript-content" id="transcript-text">\${document.text}</div>
        <button class="copy-button" onclick="copyTranscript()">📋 Copy Transcript</button>
      </div>
    \`;
    
    // Copy to clipboard function
    window.copyTranscript = function() {
      const transcriptText = document.getElementById('transcript-text').textContent;
      navigator.clipboard.writeText(transcriptText).then(() => {
        const button = document.querySelector('.copy-button');
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        button.style.background = '#28a745';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '#28a745';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard');
      });
    };
  </script>
</body>
</html>
  `.trim();
}
