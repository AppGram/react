/**
 * Markdown Component
 *
 * Renders markdown content with consistent styling using react-markdown.
 */

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface MarkdownProps {
  /**
   * Markdown content to render
   */
  content: string

  /**
   * Accent color for links and highlights
   */
  accentColor?: string

  /**
   * Custom class name for the container
   */
  className?: string
}

export function Markdown({
  content,
  accentColor = '#6366f1',
  className,
}: MarkdownProps): React.ReactElement {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              className="text-2xl font-bold mt-8 mb-4 first:mt-0"
              style={{ color: '#1f2937', lineHeight: 1.2 }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="text-xl font-semibold mt-6 mb-3"
              style={{ color: '#1f2937', lineHeight: 1.3 }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-lg font-semibold mt-5 mb-2"
              style={{ color: '#1f2937', lineHeight: 1.4 }}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              className="text-base font-semibold mt-4 mb-2"
              style={{ color: '#1f2937' }}
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p
              className="text-base leading-7 mb-4"
              style={{ color: 'rgba(0, 0, 0, 0.8)' }}
            >
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-4 pl-4 my-4 italic"
              style={{
                color: 'rgba(0, 0, 0, 0.7)',
                borderColor: `${accentColor}40`,
              }}
            >
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2 list-disc pl-6" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-2 list-decimal pl-6" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-7">
              {children}
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            return isInline ? (
              <code
                className="px-1.5 py-0.5 rounded text-sm font-mono"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  color: '#1f2937',
                }}
              >
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            )
          },
          pre: ({ children }) => (
            <pre
              className="my-4 p-4 rounded-lg overflow-x-auto font-mono text-sm"
              style={{
                backgroundColor: '#1f2937',
                color: '#f3f4f6',
              }}
            >
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: accentColor }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr
              className="my-8 border-t"
              style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
            />
          ),
          img: ({ src, alt }) => (
            <figure className="my-6">
              <img
                src={src}
                alt={alt}
                className="w-full rounded-lg"
              />
              {alt && (
                <figcaption
                  className="text-sm text-center mt-2"
                  style={{ color: 'rgba(0, 0, 0, 0.5)' }}
                >
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th
              className="px-3 py-2 text-left font-semibold"
              style={{ color: '#1f2937', borderBottom: '2px solid rgba(0, 0, 0, 0.1)' }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="px-3 py-2"
              style={{ color: 'rgba(0, 0, 0, 0.8)' }}
            >
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: '#1f2937' }}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em>{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
