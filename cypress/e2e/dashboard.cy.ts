describe('Dashboard', () => {
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
    
    cy.visit('/dashboard')
  })

  it('should display dashboard when authenticated', () => {
    cy.contains('Welcome back').should('be.visible')
    cy.contains('Rating').should('be.visible')
    cy.contains('Matches Played').should('be.visible')
  })

  it('should have navigation sidebar', () => {
    cy.get('.sidebar').should('be.visible')
    cy.get('.sidebar-nav-item').should('have.length.at.least', 4)
  })

  it('should navigate to matches page', () => {
    cy.contains('My Matches').click()
    cy.url().should('include', '/matches')
  })

  it('should navigate to tournaments page', () => {
    cy.contains('Tournaments').click()
    cy.url().should('include', '/tournaments')
  })

  it('should navigate to rankings page', () => {
    cy.contains('Ratings & Rankings').click()
    cy.url().should('include', '/rankings')
  })
})