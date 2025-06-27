describe('Rankings Page', () => {
  beforeEach(() => {
    // Set up a mock authenticated user
    cy.window().then((win) => {
      win.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          },
          profile: {
            user_id: 'test-user-id',
            username: 'testuser',
            elo_rating: 1200,
            matches_played: 0,
            matches_won: 0,
            skill_level: 'beginner'
          },
          session: {
            access_token: 'mock-token'
          }
        },
        version: 0
      }))
    })
    
    cy.visit('/rankings')
  })

  it('should display rankings page title', () => {
    cy.contains('Ratings & Rankings').should('be.visible')
  })

  it('should have search and filter controls', () => {
    cy.get('.rankings-search input').should('be.visible')
    cy.get('.rankings-filters select').should('have.length', 3)
  })

  it('should filter players by skill level', () => {
    // First check if there are any players
    cy.get('.rankings-table-row').then($rows => {
      if ($rows.length > 0) {
        // Select beginner filter
        cy.get('.filter-group').eq(0).find('select').select('beginner')
        
        // Check that all visible players are beginners
        cy.get('.player-skill').each($skill => {
          cy.wrap($skill).invoke('text').should('match', /beginner/i)
        })
      } else {
        // Skip test if no players are available
        cy.log('No players available to test filtering')
      }
    })
  })

  it('should change sort order', () => {
    // First check if there are any players
    cy.get('.rankings-table-row').then($rows => {
      if ($rows.length > 1) {
        // Get current first player's rating
        let firstRating
        cy.get('.rating-value').first().invoke('text').then(text => {
          firstRating = parseInt(text)
          
          // Change sort order to ascending
          cy.get('.filter-group').eq(2).find('select').select('asc')
          
          // Check that the first player now has a lower rating
          cy.get('.rating-value').first().invoke('text').then(newText => {
            const newRating = parseInt(newText)
            expect(newRating).to.be.at.most(firstRating)
          })
        })
      } else {
        // Skip test if not enough players are available
        cy.log('Not enough players available to test sorting')
      }
    })
  })

  it('should search for players by name', () => {
    // First check if there are any players
    cy.get('.rankings-table-row').then($rows => {
      if ($rows.length > 0) {
        // Get the first player's name
        cy.get('.player-name').first().invoke('text').then(name => {
          // Search for this player
          cy.get('.rankings-search input').type(name.substring(0, 3))
          
          // Check that the player is still visible
          cy.contains('.player-name', name).should('be.visible')
        })
      } else {
        // Skip test if no players are available
        cy.log('No players available to test search')
      }
    })
  })

  it('should show rank change indicators', () => {
    // Check if rank change indicators are present
    cy.get('.rank-change').should('exist')
  })
})