import { type ResourceMetadata } from 'xmcp';

export const metadata: ResourceMetadata & { _meta?: any } = {
  name: 'simple-test-ui-widget',
  mimeType: 'text/html+skybridge',
  description:
    'UI template for simple-test widget (ui://widget/simple-test.html)',
  _meta: {
    'openai/widgetAccessible': true,
    'openai/resultCanProduceWidget': true,
  },
};

export default function handler() {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .container {
      text-align: center;
      max-width: 600px;
    }
    
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    
    .content {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 Simple Test Widget</h1>
    <div class="content">
      <p>This is a simple test widget!</p>
      <p>If you can see this, the widget system is working.</p>
      <div id="data-display"></div>
    </div>
  </div>
  
  <script>
    // In Apps SDK, toolOutput === structuredContent
    const out = window.openai?.toolOutput ?? {};
    const dataDisplay = window.document.getElementById('data-display');
    if (out && Object.keys(out).length > 0) {
      dataDisplay.innerHTML = \`
        <h3>Received Data:</h3>
        <pre style="background: white; padding: 10px; border-radius: 4px; text-align: left; overflow-x: auto;">\${JSON.stringify(out, null, 2)}</pre>
      \`;
    } else {
      dataDisplay.innerHTML = '<p><em>No data received yet...</em></p>';
    }
  </script>
</body>
</html>
  `.trim();
}
