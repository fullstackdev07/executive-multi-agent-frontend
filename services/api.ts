import axios from 'axios';
export interface ChatPayload {
  prompt: string;
  fileContent?: string;
  fileName?: string;
  transcript_file?: File;
  market_report_file?: File;
  job_description_file?: File;
  user_input_file?: File;
  candidate_cv_file?: File;
  interview_transcript_file?: File;
  supporting_documents?: File[];
  transcript_files?: File[];
  jd_files?: File[];
  interview_files?: File[];
}
interface MarketIntelligenceResponse {
  output?: string;
  title?: string;
  sections?: any;
  summary?: string;
  next_steps?: any;
  used_files?: any;
  meta?: any;
}
// Define different agent types
const AGENT_RESPONSES = {
  market_intelligence: 'Market Intelligence: I provide market insights and analysis.',
  jd_agenet: 'JD Agent: I help with job description related tasks.',
  client_representative_agent: 'Client Representative: I assist with client communication.',
  client_representative_creator_agent: 'Client Representative Creator: I help create client presentations.',
  interview_report_agent: 'Interview Report: I help generate interview reports.'
};
// Simulated delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const chatWithAgent = async (projectId: any, payload: ChatPayload): Promise<string> => {
  try {
    // Create FormData object
    const formData = new FormData();
    // Add company_information (prompt)
    if (payload.prompt) {
      formData.append('message', payload.prompt);
    }
    // Add all supporting documents
    if (payload.supporting_documents && payload.supporting_documents.length > 0) {
      for (const file of payload.supporting_documents) {
        formData.append('files', file, file.name);
      }
    }
    // Log what we're sending
    const response = await fetch(`https://executive-multi-agent.onrender.com/project/${projectId}/chat`, {
      method: 'POST',
      body: formData
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      // Try to extract error details from the response
      let errorText = '';
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorText = errorData.detail;
        } else {
          errorText = JSON.stringify(errorData);
        }
      } catch (jsonErr) {
        errorText = await response.text();
      }
      console.error('API Error Response:', errorText);
      return `Error: ${errorText}`;
    }
    try {
      const data = await response.json();
      if (
        data.output.output &&
        data.output.output.includes(" I could not determine your request")
      ) {
        return `Error: Enter a company name, a ticker symbol, or a short query about the company or market you're interested in. You can also upload supporting documents below or Upload relevant documents (PDF, TXT, JSON) like company profiles, existing reports, or news articles to provide more context.`;
      }
      return data
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
};
export const createNewChat = async() => {
  try {
    const response = await fetch(`https://executive-multi-agent.onrender.com/start_project`, {
      method: 'POST',
    });
    return response.json();
  } catch(err) {
    console.log(err, 'err')
  }
}
