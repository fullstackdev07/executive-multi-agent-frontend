import axios from 'axios';

interface ChatPayload {
  prompt: string;
  fileContent?: string;
  fileName?: string;
}

interface MarketIntelligenceResponse {
  market_report: string;
}

// Define different agent types
export type AgentType = 'market_intelligence' | 'jd_agenet' | 'client_repersentative_agent' | 'client_repersentative_creator_agent' | 'interview_report_agent';

const AGENT_RESPONSES = {
  market_intelligence: 'Market Intelligence: I provide market insights and analysis.',
  jd_agenet: 'JD Agent: I help with job description related tasks.',
  client_repersentative_agent: 'Client Representative: I assist with client communication.',
  client_repersentative_creator_agent: 'Client Representative Creator: I help create client presentations.',
  interview_report_agent: 'Interview Report: I help generate interview reports.'
};

// Simulated delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const chatWithAgent = async (agentType: AgentType, payload: ChatPayload): Promise<string> => {
  if (agentType === 'market_intelligence') {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // If there's a file, create a file blob and append it
      if (payload.fileContent) {
        // Create a JSON string from the file content if it's not already a string
        const jsonContent = typeof payload.fileContent === 'string' 
          ? payload.fileContent 
          : JSON.stringify(payload.fileContent);

        const fileBlob = new Blob([jsonContent], { type: 'application/json' });
        formData.append('conversation_file', fileBlob, payload.fileName || 'conversation.json');
      }

      // Log what we're sending
      console.log('Sending request to Market Intelligence API:', {
        endpoint: 'https://ccb9-2405-201-4021-112e-8d70-c71f-25a9-c742.ngrok-free.app/market_intelligence',
        fileName: payload.fileName,
        hasFileContent: !!payload.fileContent
      });

      const response = await fetch('https://ccb9-2405-201-4021-112e-8d70-c71f-25a9-c742.ngrok-free.app/market_intelligence', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      try {
        const data = await response.json() as MarketIntelligenceResponse;
        return data.market_report || 'No market report available in the response';
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        return 'Error: Could not parse the market intelligence report';
      }
    } catch (error: any) {
      console.error('Error calling the Market Intelligence API:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return 'Network error: Could not reach the API server';
      }
      return `Error: ${error.message || 'Unknown error occurred'}`;
    }
  }

  // For other agents, return predefined responses
  let response = `${AGENT_RESPONSES[agentType]}\n\n`;
  
  if (payload.prompt) {
    response += `Responding to: "${payload.prompt}"\n`;
  }
  
  if (payload.fileContent) {
    response += `Processed file "${payload.fileName}" with ${payload.fileContent.length} characters.\n`;
  }
  
  // Add agent-specific responses
  switch (agentType) {
    case 'jd_agenet':
      response += '\nI can assist with job description related tasks.';
      break;
    case 'client_repersentative_agent':
      response += '\nI can help with client communication needs.';
      break;
    case 'client_repersentative_creator_agent':
      response += '\nI can help create client presentations and materials.';
      break;
    case 'interview_report_agent':
      response += '\nI can help generate and analyze interview reports.';
      break;
  }
  
  return response;
}; 