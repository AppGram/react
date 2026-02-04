/**
 * @appgram/react
 *
 * React library for integrating Appgram portal features
 * with pre-built UI components and headless hooks.
 */

// Provider
export {
  AppgramProvider,
  useAppgramContext,
  type AppgramProviderProps,
  type AppgramConfig,
  type AppgramContextValue,
} from './provider'

// Client
export { AppgramClient, type AppgramClientConfig } from './client'

// Hooks
export {
  useWishes,
  useWish,
  useVote,
  useComments,
  useRoadmap,
  useReleases,
  useRelease,
  useHelpCenter,
  useHelpFlow,
  useHelpArticle,
  useSupport,
  type UseWishesOptions,
  type UseWishesResult,
  type UseWishOptions,
  type UseWishResult,
  type UseVoteOptions,
  type UseVoteResult,
  type UseCommentsOptions,
  type UseCommentsResult,
  type UseRoadmapOptions,
  type UseRoadmapResult,
  type UseReleasesOptions,
  type UseReleasesResult,
  type UseReleaseOptions,
  type UseReleaseResult,
  type UseHelpCenterOptions,
  type UseHelpCenterResult,
  type UseHelpFlowOptions,
  type UseHelpFlowResult,
  type UseHelpArticleOptions,
  type UseHelpArticleResult,
  type UseSupportOptions,
  type UseSupportResult,
} from './hooks'

// Components
export {
  VoteButton,
  WishCard,
  WishList,
  WishDetail,
  SubmitWishForm,
  RoadmapColumn,
  RoadmapBoard,
  ReleaseCard,
  ReleaseList,
  ReleaseDetail,
  Releases,
  WhatsNewPopup,
  HelpCollections,
  HelpArticles,
  HelpArticleDetail,
  HelpCenter,
  type QuickAction,
  SupportForm,
  StatusBoard,
  StatusIncidentDetail,
  type VoteButtonProps,
  type WishCardProps,
  type WishListProps,
  type WishDetailProps,
  type SubmitWishFormProps,
  type RoadmapColumnProps,
  type RoadmapBoardProps,
  type ReleaseCardProps,
  type ReleaseListProps,
  type ReleaseDetailProps,
  type ReleasesProps,
  type WhatsNewPopupProps,
  type HelpCollectionsProps,
  type HelpArticlesProps,
  type HelpArticleDetailProps,
  type HelpCenterProps,
  type SupportFormProps,
  type StatusBoardProps,
  type StatusIncidentDetailProps,
  type StatusData,
  type StatusComponent,
  type StatusIncident,
  type IncidentUpdate,
  type OverallStatus,
  type ComponentStatus,
  type IncidentStatus,
  type IncidentImpact,
} from './components'

// Types
export type {
  // Wish types
  Wish,
  WishStatus,
  WishPriority,
  WishFilters,
  WishesResponse,
  WishAuthor,
  Category,
  // Vote types
  Vote,
  VoteCheckResponse,
  VoteCreateInput,
  VoteState,
  // Comment types
  Comment,
  CommentAuthor,
  CommentCreateInput,
  CommentsResponse,
  // Roadmap types
  Roadmap,
  RoadmapColumn as RoadmapColumnType,
  RoadmapItem,
  RoadmapData,
  RoadmapVisibility,
  // Release types
  Release,
  ReleaseFeature,
  ReleasesResponse,
  // Help types
  HelpCollection,
  HelpFlow,
  HelpArticle,
  HelpCenterData,
  HelpArticlesResponse,
  ArticleType,
  FlowDisplayType,
  // Support types
  SupportRequest,
  SupportMessage,
  SupportAttachment,
  SupportRequestInput,
  SupportRequestStatus,
  SupportRequestPriority,
  SupportRequestCategory,
  SupportRequestsResponse,
  // Customization types
  CustomColors,
  CustomTypography,
  AppgramTheme,
  ThemeMode,
  LayoutConfig,
  // API types
  ApiResponse,
  PaginatedResponse,
} from './types'

// Utilities
export { cn, getFingerprint, resetFingerprint } from './utils'
