/**
 * Vote Types
 */

export interface Vote {
  id: string
  wish_id: string
  user_id?: string | null
  voter_email?: string | null
  fingerprint: string
  created_at: string
}

export interface VoteCheckResponse {
  has_voted: boolean
  vote_id?: string
}

export interface VoteCreateInput {
  wish_id: string
  fingerprint: string
  voter_email?: string
}

export interface VoteState {
  hasVoted: boolean
  voteId?: string
  voteCount: number
  isLoading: boolean
  error?: string | null
}
