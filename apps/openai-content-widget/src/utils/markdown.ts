import React from 'react';

export function parseSimpleMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }

    parts.push(
      React.createElement(
        'strong',
        {
          key: `bold-${key++}`,
          className: 'font-semibold text-gray-900',
        },
        match[1]
      )
    );

    currentIndex = match.index + match[0].length;
  }

  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? parts : [text];
}
