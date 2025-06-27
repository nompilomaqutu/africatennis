# Africa Tennis Platform - AWS Lambda Functions

This directory contains the AWS Lambda functions used by the Africa Tennis Platform.

## Functions

### 1. Update Score (`update-score`)
- **Trigger**: API Gateway - POST /matches/{matchId}/score
- **Purpose**: Updates the score of a tennis match in real-time
- **Parameters**:
  - `matchId`: Path parameter - ID of the match to update
  - Request body:
    - `winningPlayerId`: ID of the player who won the point
    - `pointType`: (Optional) Type of point (e.g., 'ace', 'double_fault')

### 2. Generate Tournament Bracket (`generate-bracket`)
- **Trigger**: API Gateway - POST /tournaments/{tournamentId}/generate-bracket
- **Purpose**: Creates the initial match structure for a tournament based on its format
- **Parameters**:
  - `tournamentId`: Path parameter - ID of the tournament to generate brackets for

### 3. Send Notification (`send-notification`)
- **Trigger**: Supabase Database Webhook (on INSERT into matches table)
- **Purpose**: Sends email notifications to players when they are challenged to a match
- **Parameters**:
  - Webhook payload containing the new match record

### 4. Aggregate Player Statistics (`aggregate-stats`)
- **Trigger**: EventBridge scheduled event (daily)
- **Purpose**: Pre-calculates complex player statistics for analytics
- **Parameters**: None (runs on schedule)

## Deployment

These functions are deployed using AWS SAM or the AWS CDK. Environment variables required:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SES_EMAIL_SOURCE`: Email address to send notifications from
- `FRONTEND_URL`: URL of the frontend application

## Local Development

1. Install dependencies:
```
npm install
```

2. Build the TypeScript code:
```
npm run build
```

3. Test locally:
```
npm test
```

## Adding New Functions

1. Create a new directory under `lambdas/`
2. Add your function code
3. Update the deployment configuration
4. Deploy using AWS SAM or CDK