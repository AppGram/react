/**
 * Markdown Component
 *
 * Renders markdown or HTML content with consistent styling.
 * Automatically detects HTML content and renders it appropriately.
 */

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Decode HTML entities in a string
 * Handles both named entities (&lt;, &gt;, etc.) and unicode escapes (\u0026lt;)
 */
function decodeHtmlEntities(content: string): string {
  // First decode unicode escape sequences like \u0026lt; -> &lt;
  let decoded = content.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })

  // Then decode HTML entities like &lt; -> <, &gt; -> >, &amp; -> &, etc.
  const textarea = document.createElement('textarea')
  textarea.innerHTML = decoded
  return textarea.value
}

/**
 * Check if content appears to be HTML (contains HTML tags)
 */
function isHtmlContent(content: string): boolean {
  const decoded = decodeHtmlEntities(content)
  // Check for common HTML patterns
  return /<[a-z][\s\S]*>/i.test(decoded) && /<\/(?:p|div|span|h[1-6]|ul|ol|li|a|img|strong|em|br)>/i.test(decoded)
}

/**
 * HtmlContent Component
 * Renders HTML content with proper image handling and error fallbacks
 */
interface HtmlContentProps {
  html: string
  accentColor: string
  className?: string
}

function HtmlContent({ html, accentColor, className }: HtmlContentProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!containerRef.current) return

    // Add error handlers to all images
    const images = containerRef.current.querySelectorAll('img')
    images.forEach((img) => {
      img.addEventListener('error', () => {
        // Replace broken image with placeholder
        img.style.display = 'none'
        const placeholder = document.createElement('div')
        placeholder.className = 'my-4 p-4 rounded-lg bg-gray-100 text-center text-sm text-gray-500'
        placeholder.textContent = 'Image failed to load'
        img.parentNode?.insertBefore(placeholder, img)
      })

      // Ensure images have proper styling
      img.style.maxWidth = '100%'
      img.style.height = 'auto'
      img.style.borderRadius = '8px'
    })

    // Style links
    const links = containerRef.current.querySelectorAll('a')
    links.forEach((link) => {
      link.style.color = accentColor
      link.style.textDecoration = 'underline'
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    })
  }, [html, accentColor])

  return (
    <div
      ref={containerRef}
      className={`max-w-none ${className || ''}`}
      style={{
        color: 'rgba(0, 0, 0, 0.8)',
        lineHeight: 1.7,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export interface MarkdownProps {
  /**
   * Markdown or HTML content to render
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
  const decodedContent = decodeHtmlEntities(content)
  
  // If content is HTML, parse and render it with proper image handling
  if (isHtmlContent(decodedContent)) {
    return (
      <HtmlContent
        html={decodedContent}
        accentColor={accentColor}
        className={className}
      />
    )
  }

  // Otherwise, render as Markdown
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
        {decodedContent}
      </ReactMarkdown>
    </div>
  )
}
