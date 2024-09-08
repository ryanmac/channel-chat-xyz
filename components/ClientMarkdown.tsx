// components/ClientMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ClientMarkdownProps {
  content: string;
}

const ClientMarkdown: React.FC<ClientMarkdownProps> = ({ content }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
};

export default ClientMarkdown;