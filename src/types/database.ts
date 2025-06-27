export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          username: string
          elo_rating: number
          matches_played: number
          matches_won: number
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          bio: string | null
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          username: string
          elo_rating?: number
          matches_played?: number
          matches_won?: number
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          bio?: string | null
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          username?: string
          elo_rating?: number
          matches_played?: number
          matches_won?: number
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          bio?: string | null
          profile_picture_url?: string | null
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string | null
          player1_id: string
          player2_id: string
          winner_id: string | null
          score: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          date: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id?: string | null
          player1_id: string
          player2_id: string
          winner_id?: string | null
          score?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          date: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          tournament_id?: string | null
          player1_id?: string
          player2_id?: string
          winner_id?: string | null
          score?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          date?: string
          location?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string
          organizer_id: string
          start_date: string
          end_date: string
          format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'
          max_participants: number
          status: 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled'
          location: string
          entry_fee: number | null
          prize_pool: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          organizer_id: string
          start_date: string
          end_date: string
          format?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'
          max_participants: number
          status?: 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled'
          location: string
          entry_fee?: number | null
          prize_pool?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          organizer_id?: string
          start_date?: string
          end_date?: string
          format?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'
          max_participants?: number
          status?: 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled'
          location?: string
          entry_fee?: number | null
          prize_pool?: number | null
          updated_at?: string
        }
      }
      tournament_participants: {
        Row: {
          id: string
          tournament_id: string
          player_id: string
          seed: number | null
          registered_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          player_id: string
          seed?: number | null
          registered_at?: string
        }
        Update: {
          tournament_id?: string
          player_id?: string
          seed?: number | null
        }
      }
      match_events: {
        Row: {
          id: string
          match_id: string
          timestamp: string
          event_type: 'move' | 'capture' | 'check' | 'checkmate' | 'draw' | 'resignation' | 'timeout'
          player_id: string
          description: string
          score_snapshot: any
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          timestamp?: string
          event_type: 'move' | 'capture' | 'check' | 'checkmate' | 'draw' | 'resignation' | 'timeout'
          player_id: string
          description: string
          score_snapshot: any
          metadata?: any | null
          created_at?: string
        }
        Update: {
          match_id?: string
          timestamp?: string
          event_type?: 'move' | 'capture' | 'check' | 'checkmate' | 'draw' | 'resignation' | 'timeout'
          player_id?: string
          description?: string
          score_snapshot?: any
          metadata?: any | null
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          description: string
          owner_id: string
          location: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          owner_id: string
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          owner_id?: string
          location?: string | null
          website?: string | null
          updated_at?: string
        }
      }
      club_members: {
        Row: {
          id: string
          club_id: string
          user_id: string
          role: 'member' | 'admin' | 'moderator'
          joined_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          role?: 'member' | 'admin' | 'moderator'
          joined_at?: string
        }
        Update: {
          club_id?: string
          user_id?: string
          role?: 'member' | 'admin' | 'moderator'
        }
      }
      followers: {
        Row: {
          id: string
          follower_id: string
          followed_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          followed_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          followed_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}