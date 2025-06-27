import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createClient } from '@supabase/supabase-js';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST'
};

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Get match ID from path parameters
    const matchId = event.pathParameters?.matchId;
    
    if (!matchId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Match ID is required' })
      };
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Server configuration error' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch match details with player information
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        player1:profiles!matches_player1_id_fkey(username, elo_rating),
        player2:profiles!matches_player2_id_fkey(username, elo_rating),
        winner:profiles!matches_winner_id_fkey(username)
      `)
      .eq('id', matchId)
      .single();

    if (matchError) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Match not found' })
      };
    }

    // Check if match is completed
    if (match.status !== 'completed') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Match must be completed to generate a summary' })
      };
    }

    // Check if summary already exists
    if (match.summary) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          data: { summary: match.summary },
          message: 'Summary already exists for this match'
        })
      };
    }

    // Extract match details for the prompt
    const player1Name = match.player1?.username || 'Player 1';
    const player2Name = match.player2?.username || 'Player 2';
    const winnerName = match.winner?.username || (match.winner_id === match.player1_id ? player1Name : player2Name);
    
    // Format score for display
    let scoreDisplay = '';
    if (typeof match.score === 'string') {
      scoreDisplay = match.score;
    } else if (match.score && typeof match.score === 'object') {
      try {
        const sets = match.score.sets || [];
        if (sets.length > 0) {
          scoreDisplay = sets.map((set: any) => 
            `${set.player1_games}-${set.player2_games}`
          ).join(', ');
        }
      } catch (err) {
        console.error('Error formatting score:', err);
        scoreDisplay = 'Score unavailable';
      }
    }

    // Determine match duration (if available)
    const matchDate = new Date(match.date);
    const currentDate = new Date();
    const matchDuration = Math.floor((currentDate.getTime() - matchDate.getTime()) / (1000 * 60)); // in minutes
    
    // Construct prompt for Bedrock
    const prompt = `
    <human>
    Generate a short, exciting summary of a tennis match with the following details:
    
    Player 1: ${player1Name} (Rating: ${match.player1?.elo_rating || 'Unknown'})
    Player 2: ${player2Name} (Rating: ${match.player2?.elo_rating || 'Unknown'})
    Winner: ${winnerName}
    Final Score: ${scoreDisplay}
    Location: ${match.location}
    
    The summary should be engaging, highlight key moments, and capture the excitement of the match. 
    Use tennis terminology and focus on the competitive aspects. Keep it under 200 words.
    </human>
    `;

    // Call Amazon Bedrock to generate the summary
    const modelId = 'anthropic.claude-v2'; // Using Claude v2 model
    
    const bedrockParams = {
      modelId: modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: prompt,
        max_tokens_to_sample: 500,
        temperature: 0.7,
        top_k: 250,
        top_p: 0.999,
        stop_sequences: ["</answer>", "\n\nHuman:"]
      })
    };

    const command = new InvokeModelCommand(bedrockParams);
    const bedrockResponse = await bedrockClient.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    let generatedSummary = responseBody.completion || '';
    
    // Clean up the summary
    generatedSummary = generatedSummary.trim();
    
    // Update the match with the generated summary
    const { error: updateError } = await supabase
      .from('matches')
      .update({ summary: generatedSummary })
      .eq('id', matchId);

    if (updateError) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Failed to update match with summary' })
      };
    }

    // Return success response with the generated summary
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: true, 
        data: { summary: generatedSummary }
      })
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'An unexpected error occurred' })
    };
  }
};