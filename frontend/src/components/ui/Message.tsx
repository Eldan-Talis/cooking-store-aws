import React from 'react';
import ReactMarkdown from 'react-markdown';

export function Message({ message }: { message: string }) {
  return (
    <div className="bot-message">
      <ReactMarkdown>{message}</ReactMarkdown>
    </div>
  );
}
