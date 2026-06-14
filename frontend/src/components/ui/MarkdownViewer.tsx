import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`markdown-viewer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-on-surface" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-on-surface" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-on-surface" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 text-on-surface/90 leading-relaxed last:mb-0" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 text-on-surface/90 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 text-on-surface/90 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-on-surface" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-primary/40 pl-4 py-1 my-4 bg-primary/[0.03] rounded-r-lg italic text-on-surface-variant" {...props} />
          ),
          code: ({node, inline, className, children, ...props}: any) => {
            if (inline) {
              return <code className="bg-surface-container-high text-honey px-1.5 py-0.5 rounded text-[0.85em] font-mono" {...props}>{children}</code>;
            }
            return (
              <div className="relative my-4 rounded-xl overflow-hidden bg-[#1e1e2e] border border-outline-variant/20 shadow-inner">
                <div className="absolute top-0 left-0 w-full h-8 bg-[#181825] border-b border-outline-variant/10 flex items-center px-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                </div>
                <div className="p-4 pt-12 overflow-x-auto">
                  <code className="text-[#cdd6f4] text-sm font-mono leading-relaxed" {...props}>
                    {children}
                  </code>
                </div>
              </div>
            );
          },
          img: ({node, ...props}) => (
            <img 
              className="max-w-full h-auto rounded-lg border border-outline-variant/20 my-4 shadow-sm" 
              loading="lazy"
              alt={props.alt || 'Image'}
              {...props} 
            />
          ),
          hr: ({node, ...props}) => <hr className="my-6 border-outline-variant/20" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-outline-variant/20 border border-outline-variant/20 rounded-lg" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="bg-surface-container/50 px-4 py-2 text-left text-sm font-bold text-on-surface" {...props} />,
          td: ({node, ...props}) => <td className="px-4 py-2 text-sm text-on-surface/90 border-t border-outline-variant/10" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
