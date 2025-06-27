import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, MapPin, Trophy, Clock, Users, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { estimateRatingChange } from '../../services/eloService'
import type { Database } from '../../types/database'

type Match = Database['public']['Tables']['matches']['Row']
type MatchEvent = Database['public']['Tables']['match_events']['Row']

interface MatchDetailsProps {
  matchId: string
  onBack: () => void
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({ matchId, onBack }) => {
  const [match, setMatch] = useState<Match | null>(null)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [player1, setPlayer1] = useState<any>(null)
  const [player2, setPlayer2] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    const fetchMatchDetails = async () => {
      setLoading(true)
      try {
        // Fetch match data
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single()

        if (matchError) throw matchError
        setMatch(matchData)

        // Fetch player profiles
        if (matchData) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', [matchData.player1_id, matchData.player2_id])

          if (profiles) {
            setPlayer1(profiles.find(p => p.user_id === matchData.player1_id))
            setPlayer2(profiles.find(p => p.user_id === matchData.player2_id))
          }

          // Fetch match events
          const { data: eventsData } = await supabase
            .from('match_events')
            .select('*')
            .eq('match_id', matchId)
            .order('timestamp', { ascending: true })

          setEvents(eventsData || [])
        }
      } catch (error) {
        console.error('Error fetching match details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatchDetails()
  }, [matchId])

  if (loading || !match || !player1 || !player2) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Calculate rating changes if match is completed
  const ratingChange = match.status === 'completed' && match.winner_id ? {
    player1: estimateRatingChange(
      player1.elo_rating,
      player2.elo_rating,
      match.winner_id === player1.user_id ? 1 : 0
    ),
    player2: estimateRatingChange(
      player2.elo_rating,
      player1.elo_rating,
      match.winner_id === player2.user_id ? 1 : 0
    )
  } : null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Match Details</h1>
      </div>

      {/* Match Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex flex-col items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">
              {player1.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{player1.username}</div>
              <div className="text-sm text-gray-500">Rating: {player1.elo_rating}</div>
              {ratingChange && (
                <div className={`text-sm font-medium ${ratingChange.player1 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ratingChange.player1 >= 0 ? '+' : ''}{ratingChange.player1}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center mb-4 md:mb-0">
            <div className="text-xl font-bold text-gray-900 mb-2">VS</div>
            {match.status === 'completed' && match.score && (
              <div className="text-2xl font-bold text-blue-600">{match.score}</div>
            )}
            {match.status === 'completed' && match.winner_id && (
              <div className="mt-2 flex items-center text-sm font-medium text-green-600">
                <Trophy className="h-4 w-4 mr-1" />
                {match.winner_id === player1.user_id ? player1.username : player2.username} won
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">
              {player2.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{player2.username}</div>
              <div className="text-sm text-gray-500">Rating: {player2.elo_rating}</div>
              {ratingChange && (
                <div className={`text-sm font-medium ${ratingChange.player2 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ratingChange.player2 >= 0 ? '+' : ''}{ratingChange.player2}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex items-center text-gray-700 mb-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              Date
            </div>
            <div className="text-gray-900">
              {new Date(match.date).toLocaleDateString()} at{' '}
              {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex items-center text-gray-700 mb-1">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              Location
            </div>
            <div className="text-gray-900">{match.location}</div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex items-center text-gray-700 mb-1">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              Status
            </div>
            <div className="text-gray-900 capitalize">{match.status.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {/* Match Events */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Match Timeline</h2>
        
        {events.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events recorded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Events will appear here during the match.
            </p>
          </div>
        ) : (
          <div className="border-l-2 border-gray-200 ml-3 space-y-6 py-2">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-8 pb-2">
                <div className="absolute -left-2 mt-1.5 w-4 h-4 rounded-full bg-blue-500"></div>
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="font-medium text-gray-900 capitalize">
                  {event.event_type.replace('_', ' ')}
                </div>
                <div className="text-gray-700">{event.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PGN Viewer (if available) */}
      {events.length > 0 && events.some(e => e.metadata?.pgn) && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Game Notation</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {events.find(e => e.metadata?.pgn)?.metadata?.pgn || 'PGN not available'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}