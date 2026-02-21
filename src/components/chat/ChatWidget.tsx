/**
 * ChatWidget Component
 *
 * AI-powered chat widget for help center integration.
 * Provides a floating chat interface that queries the help center API.
 *
 * @example
 * ```tsx
 * import { ChatWidget } from '@appgram/react'
 *
 * // Basic usage
 * <ChatWidget
 *   projectId="your-project-id"
 *   agentName="Help Assistant"
 *   greeting="Hello"
 *   subtitle="How can I help you today?"
 *   accentColor="#6366f1"
 *   onArticleClick={(slug) => router.push(`/help/${slug}`)}
 *   onSupportClick={() => router.push('/support')}
 * />
 *
 * // With custom colors and font size
 * <ChatWidget
 *   projectId="your-project-id"
 *   accentColor="#8b5cf6"
 *   fontSize="lg" // 'sm' (12px), 'base' (14px), 'lg' (16px), or custom like '15px'
 *   colors={{
 *     headerBackground: '#1f2937',
 *     chatBackground: '#111827',
 *     inputBackground: '#1f2937',
 *     inputFieldBackground: '#374151',
 *     foreground: '#f9fafb',
 *     mutedForeground: '#9ca3af',
 *     border: '#374151',
 *     userMessageBackground: '#8b5cf6',
 *     userMessageText: '#ffffff',
 *     launcherBackground: '#8b5cf6',
 *     launcherIconColor: '#ffffff',
 *   }}
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '../../utils/cn'

// Inline SVG Icons
const MessageSquareIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const XIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const SendIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
)

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
)

const LifeBuoyIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="4.93" x2="9.17" y1="4.93" y2="9.17" />
    <line x1="14.83" x2="19.07" y1="14.83" y2="19.07" />
    <line x1="14.83" x2="19.07" y1="9.17" y2="4.93" />
    <line x1="14.83" x2="18.36" y1="9.17" y2="5.64" />
    <line x1="4.93" x2="9.17" y1="19.07" y2="14.83" />
  </svg>
)

interface ChatOption {
  label: string
  onClick?: () => void
}

interface ChatSource {
  article_id: string
  title: string
  slug: string
  similarity: number
}

interface ChatMessage {
  id: string
  content: string
  sender: 'agent' | 'user'
  timestamp: string
  sources?: ChatSource[]
  showSupportBanner?: boolean
}

export interface ChatWidgetColors {
  /**
   * Header background color
   * @default '#f9fafb'
   */
  headerBackground?: string

  /**
   * Chat area background color
   * @default '#ffffff'
   */
  chatBackground?: string

  /**
   * Input area background color
   * @default '#f9fafb'
   */
  inputBackground?: string

  /**
   * Input field background color
   * @default '#ffffff'
   */
  inputFieldBackground?: string

  /**
   * Main text color
   * @default '#111827'
   */
  foreground?: string

  /**
   * Secondary/muted text color
   * @default '#6b7280'
   */
  mutedForeground?: string

  /**
   * Border color
   * @default '#e5e7eb'
   */
  border?: string

  /**
   * User message bubble background
   * @default accentColor
   */
  userMessageBackground?: string

  /**
   * User message text color
   * @default '#ffffff'
   */
  userMessageText?: string

  /**
   * Launcher button background color
   * @default accentColor
   */
  launcherBackground?: string

  /**
   * Launcher button icon color
   * @default '#ffffff'
   */
  launcherIconColor?: string
}

export interface ChatWidgetProps {
  /**
   * Project ID for API calls
   */
  projectId: string

  /**
   * Name of the chat agent
   * @default 'Help Assistant'
   */
  agentName?: string

  /**
   * Initial greeting message
   * @default 'Hello'
   */
  greeting?: string

  /**
   * Subtitle shown below greeting
   * @default 'How can I help you today?'
   */
  subtitle?: string

  /**
   * Quick reply options shown initially
   */
  options?: ChatOption[]

  /**
   * Accent color for the widget (used for links, send button, avatar accents)
   * @default '#6366f1'
   */
  accentColor?: string

  /**
   * Color customization options
   */
  colors?: ChatWidgetColors

  /**
   * API URL for the help center
   */
  apiUrl?: string

  /**
   * Logo URL for the agent avatar
   */
  logoUrl?: string

  /**
   * Callback when an article source is clicked
   */
  onArticleClick?: (slug: string) => void

  /**
   * Callback when support button is clicked
   */
  onSupportClick?: () => void

  /**
   * Custom class name
   */
  className?: string

  /**
   * Base font size for the widget
   * Can be 'sm' (12px), 'base' (14px), 'lg' (16px), or a custom value like '13px' or '0.875rem'
   * @default 'base'
   */
  fontSize?: 'sm' | 'base' | 'lg' | string
}

export function ChatWidget({
  agentName = 'Help Assistant',
  greeting = 'Hello',
  subtitle = 'How can I help you today?',
  options = [
    { label: 'I need help getting started' },
    { label: 'I have a question' },
    { label: 'Just browsing' },
  ],
  accentColor = '#6366f1',
  colors = {},
  projectId,
  apiUrl = '',
  logoUrl,
  onArticleClick,
  onSupportClick,
  className,
  fontSize = 'base',
}: ChatWidgetProps): React.ReactElement {
  // Resolve colors with defaults
  const resolvedColors = {
    headerBackground: colors.headerBackground ?? '#f9fafb',
    chatBackground: colors.chatBackground ?? '#ffffff',
    inputBackground: colors.inputBackground ?? '#f9fafb',
    inputFieldBackground: colors.inputFieldBackground ?? '#ffffff',
    foreground: colors.foreground ?? '#111827',
    mutedForeground: colors.mutedForeground ?? '#6b7280',
    border: colors.border ?? '#e5e7eb',
    userMessageBackground: colors.userMessageBackground ?? accentColor,
    userMessageText: colors.userMessageText ?? '#ffffff',
    launcherBackground: colors.launcherBackground ?? accentColor,
    launcherIconColor: colors.launcherIconColor ?? '#ffffff',
  }

  // Resolve font size
  const fontSizeMap: Record<string, string> = {
    sm: '12px',
    base: '14px',
    lg: '16px',
  }
  const resolvedFontSize = fontSizeMap[fontSize] || fontSize

  const [isOpen, setIsOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const askQuestion = async (query: string): Promise<{ answer: string; sources: ChatSource[]; showSupport: boolean }> => {
    const response = await fetch(`${apiUrl}/portal/help/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ project_id: projectId, query }),
    })
    const data = await response.json()
    if (data.success) {
      return {
        answer: data.data.answer,
        sources: data.data.sources || [],
        showSupport: data.data.show_user_support || false,
      }
    }
    throw new Error('Failed to get response')
  }

  const handleOptionClick = async (option: ChatOption) => {
    setShowChat(true)

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: option.label,
      sender: 'user',
      timestamp: 'Just now',
    }

    setMessages([
      {
        id: '1',
        content: `${greeting} ${subtitle}`,
        sender: 'agent',
        timestamp: '9m ago',
      },
      userMessage,
    ])

    setIsLoading(true)
    try {
      const { answer, sources, showSupport } = await askQuestion(option.label)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: answer,
          sender: 'agent',
          timestamp: 'Just now',
          sources,
          showSupportBanner: showSupport,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Sorry, I couldn't process that request. Please try again.",
          sender: 'agent',
          timestamp: 'Just now',
        },
      ])
    }
    setIsLoading(false)
    option.onClick?.()
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const query = inputValue.trim()
    setInputValue('')

    if (!showChat) {
      setShowChat(true)
      setMessages([
        {
          id: '1',
          content: `${greeting} ${subtitle}`,
          sender: 'agent',
          timestamp: '9m ago',
        },
      ])
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: query,
        sender: 'user',
        timestamp: 'Just now',
      },
    ])

    setIsLoading(true)
    try {
      const { answer, sources, showSupport } = await askQuestion(query)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: answer,
          sender: 'agent',
          timestamp: 'Just now',
          sources,
          showSupportBanner: showSupport,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Sorry, I couldn't process that request. Please try again.",
          sender: 'agent',
          timestamp: 'Just now',
        },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSourceClick = (source: ChatSource) => {
    onArticleClick?.(source.slug)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 sm:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={() => setIsOpen(false)}
      />

      <div className={cn("fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 sm:gap-4", className)}>
        {/* Chat Panel */}
        <div
          className={cn(
            "w-[calc(100vw-2rem)] sm:w-[380px] md:w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden",
            "transition-all duration-300 ease-out origin-bottom-right",
            isOpen ? "opacity-100 scale-100" : "h-0 opacity-0 scale-95 pointer-events-none"
          )}
          style={{
            backgroundColor: resolvedColors.chatBackground,
            border: `1px solid ${resolvedColors.border}`,
            height: isOpen ? 'min(560px, calc(100vh - 6rem))' : '0',
            fontSize: resolvedFontSize,
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between shrink-0"
            style={{
              backgroundColor: resolvedColors.headerBackground,
              borderBottom: `1px solid ${resolvedColors.border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-medium overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={agentName} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <span style={{ color: accentColor }} className="text-sm">{agentName.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: resolvedColors.foreground }}
                >
                  {agentName}
                </h3>
                <p
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: resolvedColors.mutedForeground }}
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg transition-all duration-150"
              style={{ color: resolvedColors.mutedForeground }}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-5"
            style={{ backgroundColor: resolvedColors.chatBackground }}
          >
            {!showChat ? (
              <>
                {/* Initial Greeting */}
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-medium overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                      border: `1px solid ${accentColor}25`,
                    }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt={agentName} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span style={{ color: accentColor }} className="text-xs">{agentName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-medium"
                      style={{ color: resolvedColors.foreground }}
                    >
                      {greeting}
                    </p>
                    <p
                      className="mt-0.5"
                      style={{ color: resolvedColors.mutedForeground }}
                    >
                      {subtitle}
                    </p>
                    <p
                      className="text-[11px] mt-2"
                      style={{ color: resolvedColors.mutedForeground }}
                    >
                      {agentName}
                    </p>
                  </div>
                </div>

                {/* Quick Reply Options */}
                <div className="space-y-2 pl-11">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      className="block w-full text-left px-4 py-2.5 rounded-xl transition-all duration-150 ease-out"
                      style={{
                        backgroundColor: resolvedColors.inputBackground,
                        border: `1px solid ${resolvedColors.border}`,
                        color: resolvedColors.foreground,
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Message Thread */}
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex gap-3", message.sender === 'user' && "flex-row-reverse")}>
                    {message.sender === 'agent' && (
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-medium overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                          border: `1px solid ${accentColor}25`,
                        }}
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt={agentName} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span style={{ color: accentColor }} className="text-xs">{agentName.charAt(0)}</span>
                        )}
                      </div>
                    )}
                    <div className={cn("flex-1", message.sender === 'user' && "flex flex-col items-end")}>
                      {message.sender === 'user' ? (
                        <div
                          className="rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-sm"
                          style={{
                            backgroundColor: resolvedColors.userMessageBackground,
                            color: resolvedColors.userMessageText,
                          }}
                        >
                          <p>{message.content}</p>
                        </div>
                      ) : (
                        <div className="max-w-[95%]">
                          <div
                            className="prose prose-sm max-w-none"
                            style={{
                              color: resolvedColors.foreground,
                              '--tw-prose-links': accentColor,
                            } as React.CSSProperties}
                          >
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                          {message.sources && message.sources.length > 0 && (
                            <div
                              className="mt-4 pt-3"
                              style={{ borderTop: `1px solid ${resolvedColors.border}` }}
                            >
                              <p
                                className="text-xs mb-2"
                                style={{ color: resolvedColors.mutedForeground }}
                              >
                                Related articles
                              </p>
                              <div className="space-y-1.5">
                                {message.sources.map((source) => (
                                  <button
                                    key={source.article_id}
                                    onClick={() => handleSourceClick(source)}
                                    className="flex items-center gap-2 text-xs hover:underline transition-colors text-left group"
                                    style={{ color: accentColor }}
                                  >
                                    <FileTextIcon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                                    <span className="truncate">{source.title}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {message.showSupportBanner && (
                            <div
                              className="mt-4 p-4 rounded-2xl"
                              style={{
                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(245, 158, 11, 0.1), rgba(234, 179, 8, 0.05))',
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="p-2 rounded-xl"
                                  style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}
                                >
                                  <LifeBuoyIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="text-sm font-semibold"
                                    style={{ color: resolvedColors.foreground }}
                                  >
                                    Need more help?
                                  </p>
                                  <p
                                    className="text-xs mt-0.5"
                                    style={{ color: resolvedColors.mutedForeground }}
                                  >
                                    Our support team is here to assist you.
                                  </p>
                                  <button
                                    onClick={() => {
                                      onSupportClick?.()
                                      setIsOpen(false)
                                    }}
                                    className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors duration-150"
                                    style={{ backgroundColor: '#ea580c' }}
                                  >
                                    Contact Support
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <p
                        className="text-[11px] mt-1.5 mx-1"
                        style={{ color: resolvedColors.mutedForeground }}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-medium overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                        border: `1px solid ${accentColor}25`,
                      }}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt={agentName} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span style={{ color: accentColor }} className="text-xs">{agentName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 py-2">
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: resolvedColors.mutedForeground, animationDelay: '0ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: resolvedColors.mutedForeground, animationDelay: '150ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: resolvedColors.mutedForeground, animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div
            className="p-3 shrink-0"
            style={{
              backgroundColor: resolvedColors.inputBackground,
              borderTop: `1px solid ${resolvedColors.border}`,
            }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all duration-150"
              style={{
                backgroundColor: resolvedColors.inputFieldBackground,
                border: `1px solid ${resolvedColors.border}`,
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 bg-transparent focus:outline-none py-2 disabled:opacity-50"
                style={{
                  color: resolvedColors.foreground,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-all duration-150",
                  "disabled:opacity-30 disabled:cursor-not-allowed"
                )}
                style={
                  inputValue.trim() && !isLoading
                    ? { backgroundColor: accentColor, color: '#ffffff' }
                    : { color: resolvedColors.mutedForeground }
                }
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Launcher Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative"
        >
          <div
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg",
              "transition-all duration-200 ease-out",
              "hover:scale-105 hover:shadow-xl active:scale-95"
            )}
            style={{ backgroundColor: resolvedColors.launcherBackground }}
          >
            <MessageSquareIcon
              className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200",
                isOpen && "rotate-90 opacity-0"
              )}
              style={{ color: resolvedColors.launcherIconColor }}
            />
            <XIcon
              className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 absolute transition-transform duration-200",
                isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              )}
              style={{ color: resolvedColors.launcherIconColor }}
            />
          </div>
        </button>
      </div>
    </>
  )
}

export default ChatWidget
