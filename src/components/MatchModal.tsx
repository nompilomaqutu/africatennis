import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Clock, Target, Search, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/UserService';
import { MatchService } from '../services/MatchService';
import { User as UserType } from '../types';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: () => void;
  preselectedPlayer?: UserType | null;
  mode?: 'create' | 'challenge';
}

const MatchModal: React.FC<MatchModalProps> = ({ 
  isOpen,
  onClose, 
  onMatchCreated, 
  preselectedPlayer,
  mode = 'create'
}) => {
  const { user } = useAuth();
  const [availablePlayers, setAvailablePlayers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<UserType[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<UserType | null>(preselectedPlayer || null);
  const [showPlayerSearch, setShowPlayerSearch] = useState(!preselectedPlayer);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    notes: '',
    matchType: 'singles' as 'singles' | 'doubles',
    courtType: 'hard' as 'hard' | 'clay' | 'grass' | 'indoor',
    duration: '90' as '60' | '90' | '120',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailablePlayers();
    }
  }, [user, isOpen]);

  useEffect(() => {
    filterPlayers();
  }, [searchQuery, availablePlayers]);

  const loadAvailablePlayers = () => {
    const allPlayers = UserService.getAllPlayers();
    const filtered = allPlayers.filter(player => player.id !== user?.id);
    setAvailablePlayers(filtered);
  };

  const filterPlayers = () => {
    if (!searchQuery.trim()) {
      setFilteredPlayers(availablePlayers.slice(0, 8));
      return;
    }

    const filtered = availablePlayers.filter(player =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.skillLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.location && player.location.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 8);

    setFilteredPlayers(filtered);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPlayer) {
      newErrors.player = 'Please select an opponent';
    }

    if (!formData.date) {
      newErrors.date = 'Match date is required';
    } else {
      const selectedDate = new Date(`${formData.date}T${formData.time || '12:00'}`);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.date = 'Match date must be in the future';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Match time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedPlayer || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const matchDateTime = new Date(`${formData.date}T${formData.time}`);
      const locationWithDetails = `${formData.location}${formData.courtType !== 'hard' ? ` (${formData.courtType} court)` : ''}`;
      
      MatchService.createMatch(
        user.id,
        selectedPlayer.id,
        matchDateTime.toISOString(),
        locationWithDetails
      );

      onMatchCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create match:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRatingClass = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'beginner':
        return 'rating-beginner';
      case 'intermediate':
        return 'rating-intermediate';
      case 'advanced':
        return 'rating-advanced';
      default:
        return 'rating-beginner';
    }
  };

  const getTitle = () => {
    return mode === 'challenge' 
      ? `Create Match with ${selectedPlayer?.name}`
      : 'Create New Match';
  };

  const getSubmitText = () => {
    return mode === 'challenge' ? 'Send Challenge' : 'Create Match';
  };

  // Generate default date and time (tomorrow at 10 AM)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 10);
  const defaultTime = '10:00';

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fade-in">
      <div className="modal modal-large scale-in">
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--quantum-cyan)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-standard)' }}>
            {getTitle()}
          </h2>
          <p style={{ color: 'var(--text-subtle)' }}>
            Schedule a competitive match with another player
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Selection - Only show for create mode */}
          {mode === 'create' && (
            <div className="form-group">
              <label className="form-label">
                <Users size={16} className="inline mr-2" />
                Select Opponent
              </label>
              
              {selectedPlayer ? (
                <div className="match-selected-player">
                  <div className="match-player-info">
                    <div className="player-avatar">
                      {getInitials(selectedPlayer.name)}
                    </div>
                    <div className="match-player-details">
                      <div className="match-player-name">{selectedPlayer.name}</div>
                      <div className={`rating-badge ${getRatingClass(selectedPlayer.skillLevel)}`}>
                        {selectedPlayer.skillLevel} • Rating: {selectedPlayer.rating}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlayer(null);
                      setShowPlayerSearch(true);
                    }}
                    className="match-change-player-btn"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="match-player-search">
                  <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input search-input"
                      placeholder="Search players by name, skill level, or location..."
                    />
                  </div>
                  
                  <div className="match-players-grid">
                    {filteredPlayers.map((player) => (
                      <div
                        key={player.id}
                        onClick={() => {
                          setSelectedPlayer(player);
                          setShowPlayerSearch(false);
                        }}
                        className="match-player-card"
                      >
                        <div className="player-avatar">
                          {getInitials(player.name)}
                        </div>
                        <div className="match-player-details">
                          <div className="match-player-name">{player.name}</div>
                          <div className={`rating-badge ${getRatingClass(player.skillLevel)}`}>
                            {player.skillLevel}
                          </div>
                          <div className="match-player-stats">
                            <span>Rating: {player.rating}</span>
                            <span>•</span>
                            <span>{player.matchesPlayed} matches</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredPlayers.length === 0 && (
                    <div className="match-no-players">
                      <User size={32} style={{ color: 'var(--text-muted)' }} />
                      <p>No players found matching your search.</p>
                    </div>
                  )}
                </div>
              )}
              {errors.player && <p className="text-error-pink text-sm mt-1">{errors.player}</p>}
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                <Calendar size={16} className="inline mr-2" />
                Match Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="form-input"
                min={defaultDate}
                required
              />
              {errors.date && <p className="text-error-pink text-sm mt-1">{errors.date}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="time" className="form-label">
                <Clock size={16} className="inline mr-2" />
                Match Time
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="form-input"
                required
              />
              {errors.time && <p className="text-error-pink text-sm mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              <MapPin size={16} className="inline mr-2" />
              Venue/Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="form-input"
              placeholder="Tennis club, court name, or address"
              required
            />
            {errors.location && <p className="text-error-pink text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Match Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label htmlFor="matchType" className="form-label">
                Match Type
              </label>
              <select
                id="matchType"
                value={formData.matchType}
                onChange={(e) => handleInputChange('matchType', e.target.value)}
                className="form-select"
                title="Select match format"
              >
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="courtType" className="form-label">
                Court Surface
              </label>
              <select
                id="courtType"
                value={formData.courtType}
                onChange={(e) => handleInputChange('courtType', e.target.value)}
                className="form-select"
                title="Select court surface type"
              >
                <option value="hard">Hard Court</option>
                <option value="clay">Clay Court</option>
                <option value="grass">Grass Court</option>
                <option value="indoor">Indoor Court</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                Duration
              </label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="form-select"
                title="Select match duration"
              >
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="form-textarea"
              placeholder="Any additional information about the match..."
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-right mt-1" style={{ color: 'var(--text-muted)' }}>
              {formData.notes.length}/200
            </div>
          </div>

          {/* Match Summary */}
          {selectedPlayer && formData.date && formData.time && formData.location && (
            <div className="match-summary">
              <h3 className="match-summary-title">Match Summary</h3>
              <div className="match-summary-content">
                <div className="match-summary-item">
                  <span className="match-summary-label">Opponent:</span>
                  <span className="match-summary-value">{selectedPlayer.name}</span>
                </div>
                <div className="match-summary-item">
                  <span className="match-summary-label">Date & Time:</span>
                  <span className="match-summary-value">
                    {new Date(`${formData.date}T${formData.time}`).toLocaleDateString()} at {formData.time}
                  </span>
                </div>
                <div className="match-summary-item">
                  <span className="match-summary-label">Location:</span>
                  <span className="match-summary-value">{formData.location}</span>
                </div>
                <div className="match-summary-item">
                  <span className="match-summary-label">Type:</span>
                  <span className="match-summary-value">
                    {formData.matchType} • {formData.courtType} court • {formData.duration} min
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedPlayer}
              className="btn btn-primary btn-glare flex-1"
            >
              {isSubmitting ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                <>
                  <Target size={16} />
                  {getSubmitText()}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchModal;