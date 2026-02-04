/**
 * WhatsNewPopup Component
 *
 * Small popup at bottom of screen showing latest release features
 * with media carousel for images and videos.
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Zap, Bug, Wrench, ChevronRight, ChevronLeft, Gift, Play, Pause } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAppgramContext } from '../../provider/context'
import { useReleases } from '../../hooks/useReleases'

export interface WhatsNewPopupProps {
  /**
   * Whether the popup is open
   */
  open?: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Auto-show popup on mount if there's a new release
   * Uses localStorage to track seen releases
   * @default true
   */
  autoShow?: boolean

  /**
   * localStorage key for tracking seen releases
   * @default 'appgram-seen-release'
   */
  storageKey?: string

  /**
   * Maximum number of items to show
   * @default 5
   */
  maxItems?: number

  /**
   * Show only specific item types
   */
  showTypes?: ('feature' | 'improvement' | 'bugfix' | 'other')[]

  /**
   * Title for the popup
   * @default "What's New"
   */
  title?: string

  /**
   * Click handler for "View All" button
   */
  onViewAll?: () => void

  /**
   * Position of the popup
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'

  /**
   * Show media carousel
   * @default true
   */
  showMedia?: boolean

  /**
   * Auto-play carousel interval in ms (0 to disable)
   * @default 5000
   */
  autoPlayInterval?: number

  /**
   * Custom class name
   */
  className?: string
}

interface MediaItem {
  type: 'image' | 'video'
  url: string
  title?: string
}

const itemTypeConfig: Record<string, {
  label: string
  color: string
  icon: typeof Zap
}> = {
  feature: { label: 'New', color: '#8b5cf6', icon: Sparkles },
  improvement: { label: 'Improved', color: '#3b82f6', icon: Zap },
  bugfix: { label: 'Fixed', color: '#10b981', icon: Bug },
  other: { label: 'Update', color: '#6b7280', icon: Wrench },
}

function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'loom.com']

  const lowerUrl = url.toLowerCase()
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) return true
  if (videoHosts.some(host => lowerUrl.includes(host))) return true
  return false
}

function getEmbedUrl(url: string): string {
  // YouTube
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0`
  }
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    if (videoId) return `https://player.vimeo.com/video/${videoId}`
  }
  // Loom
  if (url.includes('loom.com/share/')) {
    const videoId = url.split('loom.com/share/')[1]?.split('?')[0]
    if (videoId) return `https://www.loom.com/embed/${videoId}`
  }
  return url
}

function MediaCarousel({
  media,
  primaryColor,
  borderRadius,
  autoPlayInterval,
}: {
  media: MediaItem[]
  primaryColor: string
  borderRadius: number
  autoPlayInterval: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlayInterval > 0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Auto-play carousel
  useEffect(() => {
    if (!isPlaying || autoPlayInterval <= 0 || media.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isPlaying, autoPlayInterval, media.length])

  const goTo = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false) // Pause auto-play when manually navigating
  }

  const goNext = () => goTo((currentIndex + 1) % media.length)
  const goPrev = () => goTo((currentIndex - 1 + media.length) % media.length)

  const currentMedia = media[currentIndex]

  return (
    <div className="relative">
      {/* Media Display */}
      <div
        className="relative overflow-hidden bg-black/5"
        style={{
          borderRadius: `${Math.max(borderRadius - 8, 4)}px`,
          aspectRatio: '16/9',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {currentMedia.type === 'video' ? (
              isVideoUrl(currentMedia.url) && (
                currentMedia.url.includes('youtube') ||
                currentMedia.url.includes('vimeo') ||
                currentMedia.url.includes('loom')
              ) ? (
                <iframe
                  src={getEmbedUrl(currentMedia.url)}
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentMedia.title || 'Video'}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              )
            ) : (
              <img
                src={currentMedia.url}
                alt={currentMedia.title || 'Feature preview'}
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        {/* Play/Pause indicator for auto-play */}
        {media.length > 1 && autoPlayInterval > 0 && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-white" />
            ) : (
              <Play className="w-3 h-3 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Dots Indicator */}
      {media.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className="transition-all"
              style={{
                width: index === currentIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === currentIndex ? primaryColor : 'rgba(0,0,0,0.2)',
              }}
            />
          ))}
        </div>
      )}

      {/* Caption */}
      {currentMedia.title && (
        <p
          className="text-xs text-center mt-1.5 font-medium"
          style={{ color: 'rgba(0,0,0,0.6)' }}
        >
          {currentMedia.title}
        </p>
      )}
    </div>
  )
}

interface ReleaseFeatureLocal {
  id: string
  release_id: string
  title: string
  description: string
  image_url?: string | null
  sort_order: number
}

export function WhatsNewPopup({
  open: controlledOpen,
  onOpenChange,
  autoShow = true,
  storageKey = 'appgram-seen-release',
  maxItems = 5,
  showTypes,
  title = "What's New",
  onViewAll,
  position = 'bottom-right',
  showMedia = true,
  autoPlayInterval = 5000,
  className,
}: WhatsNewPopupProps): React.ReactElement | null {
  const { theme, client } = useAppgramContext()
  const { releases, isLoading } = useReleases({ limit: 1 })
  const [internalOpen, setInternalOpen] = useState(false)
  const [features, setFeatures] = useState<ReleaseFeatureLocal[]>([])

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const primaryColor = theme.colors?.primary || '#6366f1'
  const borderRadius = theme.borderRadius || 16

  const latestRelease = releases[0]

  // Fetch features for the release
  useEffect(() => {
    if (!latestRelease?.slug) return

    const loadFeatures = async () => {
      try {
        const response = await client.getReleaseFeatures(latestRelease.slug)
        if (response.success && response.data) {
          const sortedFeatures = [...response.data].sort((a, b) => a.sort_order - b.sort_order)
          setFeatures(sortedFeatures as ReleaseFeatureLocal[])
        }
      } catch (error) {
        console.error('Failed to load release features:', error)
      }
    }

    loadFeatures()
  }, [latestRelease?.slug, client])

  // Auto-show logic
  useEffect(() => {
    if (!autoShow || isControlled || isLoading || !latestRelease) return

    const seenReleaseId = localStorage.getItem(storageKey)
    if (seenReleaseId !== latestRelease.id) {
      setInternalOpen(true)
    }
  }, [autoShow, isControlled, isLoading, latestRelease, storageKey])

  const handleClose = () => {
    if (isControlled) {
      onOpenChange?.(false)
    } else {
      setInternalOpen(false)
    }

    // Mark as seen
    if (latestRelease) {
      localStorage.setItem(storageKey, latestRelease.id)
    }
  }

  const handleViewAll = () => {
    handleClose()
    onViewAll?.()
  }

  if (!latestRelease) return null

  // Get items to display (from release.items if available)
  let items = latestRelease.items || []
  if (showTypes && showTypes.length > 0) {
    items = items.filter(item => showTypes.includes(item.type))
  }
  items = items.slice(0, maxItems)

  // Collect media items - prioritize features, then items, then cover image
  const mediaItems: MediaItem[] = []

  // Add cover image first
  if (latestRelease.cover_image_url) {
    mediaItems.push({
      type: isVideoUrl(latestRelease.cover_image_url) ? 'video' : 'image',
      url: latestRelease.cover_image_url,
      title: latestRelease.title,
    })
  }

  // Add feature images/videos (these are the key highlights)
  features.forEach(feature => {
    if (feature.image_url) {
      mediaItems.push({
        type: isVideoUrl(feature.image_url) ? 'video' : 'image',
        url: feature.image_url,
        title: feature.title,
      })
    }
  })

  // Add item images/videos as fallback
  items.forEach(item => {
    if (item.image_url) {
      mediaItems.push({
        type: isVideoUrl(item.image_url) ? 'video' : 'image',
        url: item.image_url,
        title: item.title,
      })
    }
  })

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed z-50 w-[380px] max-w-[calc(100vw-2rem)]',
            positionClasses[position],
            className
          )}
        >
          <div
            className="bg-white shadow-2xl overflow-hidden"
            style={{
              borderRadius: `${borderRadius}px`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              }}
            >
              <div className="flex items-center gap-2 text-white">
                <Gift className="w-4 h-4" />
                <span className="font-semibold text-sm">{title}</span>
                {latestRelease.version && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    v{latestRelease.version}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Media Carousel */}
            {showMedia && mediaItems.length > 0 && (
              <div className="px-3 pt-3">
                <MediaCarousel
                  media={mediaItems}
                  primaryColor={primaryColor}
                  borderRadius={borderRadius}
                  autoPlayInterval={autoPlayInterval}
                />
              </div>
            )}

            {/* Release Title */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#1f2937' }}>
                {latestRelease.title}
              </h3>
              {latestRelease.excerpt && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  {latestRelease.excerpt}
                </p>
              )}
            </div>

            {/* Features & Items List */}
            {(features.length > 0 || items.length > 0) && (
              <div className="px-2 py-2 max-h-[180px] overflow-y-auto">
                {/* Features first */}
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-black/[0.02] transition-colors"
                  >
                    <div
                      className="p-1.5 rounded-md shrink-0 mt-0.5"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Sparkles className="w-3 h-3" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-medium uppercase"
                          style={{ color: primaryColor }}
                        >
                          Feature
                        </span>
                      </div>
                      <p
                        className="text-sm font-medium leading-snug"
                        style={{ color: '#1f2937' }}
                      >
                        {feature.title}
                      </p>
                      {feature.description && (
                        <p
                          className="text-xs mt-0.5 line-clamp-2"
                          style={{ color: 'rgba(0,0,0,0.5)' }}
                        >
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Items */}
                {items.map((item, index) => {
                  const config = itemTypeConfig[item.type] || itemTypeConfig.other
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (features.length + index) * 0.05 }}
                      className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-black/[0.02] transition-colors"
                    >
                      <div
                        className="p-1.5 rounded-md shrink-0 mt-0.5"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <Icon className="w-3 h-3" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-medium uppercase"
                            style={{ color: config.color }}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p
                          className="text-sm font-medium leading-snug"
                          style={{ color: '#1f2937' }}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p
                            className="text-xs mt-0.5 line-clamp-2"
                            style={{ color: 'rgba(0,0,0,0.5)' }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Footer */}
            <div
              className="px-4 py-3 flex items-center justify-between border-t"
              style={{ borderColor: 'rgba(0,0,0,0.06)', backgroundColor: 'rgba(0,0,0,0.02)' }}
            >
              <button
                onClick={handleClose}
                className="text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: 'rgba(0,0,0,0.5)' }}
              >
                Dismiss
              </button>
              {onViewAll && (
                <button
                  onClick={handleViewAll}
                  className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: primaryColor }}
                >
                  View all updates
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
