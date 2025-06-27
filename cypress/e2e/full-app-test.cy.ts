import { format } from 'date-fns';

describe('Africa Tennis Platform E2E Test', () => {
  // Test credentials
  const testUser = {
    email: 'nkosimano@gmail.com',
    password: 'Magnox271991!',
    username: 'nkosimano'
  };

  // Reusable function to login
  const login = () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete and redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  };

  beforeEach(() => {
    // Clear local storage between tests
    cy.clearLocalStorage();
  });

  it('should successfully login with valid credentials', () => {
    cy.visit('/login');
    
    // Check login form elements
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    
    // Fill in login form
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should show validation errors with invalid login credentials', () => {
    cy.visit('/login');
    
    // Test empty form submission
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    
    // Test invalid email format
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Please enter a valid email address').should('be.visible');
    
    // Test valid email but no password
    cy.get('input[type="email"]').clear().type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Password is required').should('be.visible');
    
    // Test valid email but short password
    cy.get('input[type="password"]').type('12345');
    cy.get('button[type="submit"]').click();
    cy.contains('Password must be at least 6 characters').should('be.visible');
  });

  it('should navigate through the sidebar menu', () => {
    login();
    
    // Check sidebar navigation
    cy.get('.sidebar-nav-item').contains('My Matches').click();
    cy.url().should('include', '/matches');
    
    cy.get('.sidebar-nav-item').contains('Tournaments').click();
    cy.url().should('include', '/tournaments');
    
    cy.get('.sidebar-nav-item').contains('Live Scoring').click();
    cy.url().should('include', '/umpire');
    
    cy.get('.sidebar-nav-item').contains('Ratings & Rankings').click();
    cy.url().should('include', '/rankings');
    
    cy.get('.sidebar-nav-item').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
  });

  it('should toggle theme between light and dark mode', () => {
    login();
    
    // Check initial theme (likely dark by default)
    cy.get('body').should('have.class', 'theme-dark');
    
    // Toggle theme
    cy.get('.sidebar-theme-button').click();
    cy.get('body').should('have.class', 'theme-light');
    
    // Toggle back
    cy.get('.sidebar-theme-button').click();
    cy.get('body').should('have.class', 'theme-dark');
  });

  it('should create a new match', () => {
    login();
    
    // Navigate to matches page
    cy.get('.sidebar-nav-item').contains('My Matches').click();
    cy.url().should('include', '/matches');
    
    // Click create match button
    cy.contains('button', 'Create Match').click();
    
    // Verify modal is open
    cy.contains('Create New Match').should('be.visible');
    
    // Search for an opponent
    cy.get('.search-input').type('d');
    cy.wait(1000); // Wait for search results
    
    // Select the first opponent from search results
    cy.get('.player-search-item').first().click();
    
    // Fill in match details
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format date as YYYY-MM-DD for input
    const formattedDate = format(tomorrow, 'yyyy-MM-dd');
    cy.get('input[type="date"]').type(formattedDate);
    
    // Set time to 10:00 AM
    cy.get('input[type="time"]').type('10:00');
    
    // Set location
    cy.get('input#location').type('Center Court, Johannesburg');
    
    // Select court type
    cy.get('select#courtType').select('clay');
    
    // Submit the form
    cy.contains('button', 'Create Match').click();
    
    // Verify match was created
    cy.contains('Center Court, Johannesburg').should('exist');
  });

  it('should view and filter matches', () => {
    login();
    
    // Navigate to matches page
    cy.get('.sidebar-nav-item').contains('My Matches').click();
    cy.url().should('include', '/matches');
    
    // Test search functionality
    cy.get('.search-input').type('court');
    cy.wait(500);
    
    // Test status filter
    cy.get('select').first().select('pending');
    cy.wait(500);
    
    // Clear filters
    cy.get('.search-input').clear();
    cy.get('select').first().select('all');
    
    // View match details if any match exists
    cy.get('.match-grid').then($grid => {
      if ($grid.find('.card').length > 0) {
        cy.get('.card').first().click();
        cy.contains('Match Details').should('be.visible');
        cy.contains('button', 'Back').click();
      }
    });
  });

  it('should browse tournaments and view details', () => {
    login();
    
    // Navigate to tournaments page
    cy.get('.sidebar-nav-item').contains('Tournaments').click();
    cy.url().should('include', '/tournaments');
    
    // Check if tournaments exist
    cy.get('body').then($body => {
      if ($body.find('.tournament-card-minimal').length > 0) {
        // Click on first tournament
        cy.get('.tournament-card-minimal').first().within(() => {
          cy.contains('button', 'Details').click();
        });
        
        // Check tournament details page
        cy.contains('Tournament Schedule').should('be.visible');
        
        // Navigate through tabs
        cy.contains('button', 'Players').click();
        cy.contains('Registered Players').should('be.visible');
        
        cy.contains('button', 'Overview').click();
        cy.contains('Tournament Schedule').should('be.visible');
        
        // Go back to tournaments list
        cy.contains('button', /Back|Go Back/).click();
        cy.url().should('include', '/tournaments');
      } else {
        // If no tournaments exist, check for empty state
        cy.contains('No tournaments').should('be.visible');
      }
    });
  });

  it('should create a new tournament', () => {
    login();
    
    // Navigate to tournaments page
    cy.get('.sidebar-nav-item').contains('Tournaments').click();
    cy.url().should('include', '/tournaments');
    
    // Click create tournament button
    cy.contains('button', 'Create Tournament').click();
    
    // Verify modal is open
    cy.contains('Create Tournament').should('be.visible');
    
    // Fill in tournament details
    cy.get('input#name').type('Cypress Test Tournament');
    cy.get('textarea#description').type('This is a test tournament created by Cypress');
    
    // Set tournament schedule
    cy.contains('button', /Set Tournament Schedule|Modify Schedule/).click();
    
    // Select dates in the calendar
    // This is complex due to the custom calendar, so we'll use a simplified approach
    cy.get('.calendar-date').not('.disabled').not('.other-month').first().click();
    
    // Set time in the time selector
    cy.get('.time-input').first().select('10');
    cy.get('.time-input').eq(1).select('00');
    cy.contains('button', 'Confirm Time').click();
    
    // Select end date (a week later)
    cy.get('.calendar-tab').eq(1).click(); // Click on End Date tab
    cy.get('.calendar-date').not('.disabled').not('.other-month').eq(7).click();
    
    // Set time for end date
    cy.get('.time-input').first().select('18');
    cy.get('.time-input').eq(1).select('00');
    cy.contains('button', 'Confirm Time').click();
    
    // Save the schedule
    cy.contains('button', /Save Changes|Confirm Schedule/).click();
    
    // Select tournament format
    cy.contains('Single Elimination').click();
    
    // Set max participants
    cy.get('select#maxParticipants').select('8');
    
    // Set location
    cy.get('input#location').type('Johannesburg Tennis Club');
    
    // Submit the form
    cy.contains('button', 'Create Tournament').click();
    
    // Verify tournament was created (may take a moment)
    cy.contains('Cypress Test Tournament').should('exist');
  });

  it('should view and search rankings', () => {
    login();
    
    // Navigate to rankings page
    cy.get('.sidebar-nav-item').contains('Ratings & Rankings').click();
    cy.url().should('include', '/rankings');
    
    // Test search functionality
    cy.get('.search-input').type('n');
    cy.wait(500);
    
    // Test skill level filter
    cy.get('select').first().select('intermediate');
    cy.wait(500);
    
    // Test sorting
    cy.get('select').eq(1).select('username');
    cy.wait(500);
    
    // Test sort order
    cy.get('select').eq(2).select('asc');
    cy.wait(500);
    
    // Clear filters
    cy.get('.search-input').clear();
    cy.get('select').first().select('all');
    cy.get('select').eq(1).select('elo_rating');
    cy.get('select').eq(2).select('desc');
  });

  it('should access live scoring dashboard', () => {
    login();
    
    // Navigate to umpire page
    cy.get('.sidebar-nav-item').contains('Live Scoring').click();
    cy.url().should('include', '/umpire');
    
    // Check if there are active matches
    cy.get('body').then($body => {
      if ($body.find('.umpire-match-card').length > 0) {
        // Click on first match
        cy.get('.umpire-match-btn').first().click();
        
        // Check scoring interface
        cy.contains('Live Scoring').should('be.visible');
        
        // Test point scoring (if possible)
        cy.get('button').contains(/Point for|Player/).first().click();
        
        // Go back
        cy.contains('button', 'Back').click();
      } else {
        // If no matches, check for empty state or tournaments
        cy.get('body').then($body => {
          if ($body.find('.umpire-tournament-card').length > 0) {
            cy.get('.umpire-tournament-card').first().click();
          } else {
            cy.contains(/No Active Tournaments|No matches available/).should('be.visible');
          }
        });
      }
    });
  });

  it('should view and edit profile', () => {
    login();
    
    // Navigate to profile page
    cy.get('.sidebar-nav-item').contains('Profile').click();
    cy.url().should('include', '/profile');
    
    // Check profile information
    cy.get('input#username').should('have.value', testUser.username);
    
    // Edit bio
    const newBio = 'This is a test bio updated by Cypress';
    cy.get('textarea#bio').clear().type(newBio);
    
    // Save changes
    cy.contains('button', 'Save Changes').click();
    
    // Verify success message
    cy.contains('Profile updated successfully').should('be.visible');
  });

  it('should test match summary generation', () => {
    login();
    
    // Navigate to matches page
    cy.get('.sidebar-nav-item').contains('My Matches').click();
    cy.url().should('include', '/matches');
    
    // Find a completed match
    cy.get('body').then($body => {
      // Check if there are any completed matches
      const hasCompletedMatches = $body.find('.card:contains("Completed")').length > 0;
      
      if (hasCompletedMatches) {
        // Click on the first completed match
        cy.get('.card:contains("Completed")').first().click();
        
        // Check if summary exists or needs to be generated
        cy.get('body').then($matchBody => {
          if ($matchBody.find('button:contains("Generate Summary")').length > 0) {
            // Generate summary if button exists
            cy.contains('button', 'Generate Summary').click();
            
            // Wait for summary generation (this might take time)
            cy.contains('Generating match summary', { timeout: 10000 }).should('be.visible');
            
            // Wait for summary to appear (may take longer in real environment)
            cy.contains('Generated by AI', { timeout: 30000 }).should('be.visible');
          } else {
            // If summary already exists
            cy.contains('Generated by AI').should('be.visible');
          }
        });
        
        // Go back to matches
        cy.contains('button', /Back|Go Back/).click();
      } else {
        cy.log('No completed matches found to test summary generation');
      }
    });
  });

  it('should test tournament bracket viewing', () => {
    login();
    
    // Navigate to tournaments page
    cy.get('.sidebar-nav-item').contains('Tournaments').click();
    cy.url().should('include', '/tournaments');
    
    // Find a tournament that's in progress
    cy.get('body').then($body => {
      const hasInProgressTournaments = $body.find('.tournament-card-minimal:contains("In Progress")').length > 0;
      
      if (hasInProgressTournaments) {
        // Click on the first in-progress tournament
        cy.get('.tournament-card-minimal:contains("In Progress")').first().within(() => {
          cy.contains('button', 'Details').click();
        });
        
        // Check tournament details
        cy.contains('Tournament Schedule').should('be.visible');
        
        // Navigate to bracket tab
        cy.contains('button', /Bracket|Matches/).click();
        
        // Check if bracket exists
        cy.get('body').then($tournamentBody => {
          const hasBracket = $tournamentBody.find('.tournament-bracket-match').length > 0;
          
          if (hasBracket) {
            cy.get('.tournament-bracket-match').should('be.visible');
          } else {
            cy.contains('Bracket Not Generated Yet').should('be.visible');
          }
        });
        
        // Go back to tournaments
        cy.contains('button', /Back|Go Back/).click();
      } else {
        cy.log('No in-progress tournaments found to test bracket viewing');
      }
    });
  });

  it('should sign out successfully', () => {
    login();
    
    // Click sign out button
    cy.contains('Sign Out').click();
    
    // Verify redirect to login page
    cy.url().should('include', '/login');
    
    // Verify login form is visible
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });
});