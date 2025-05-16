import axios from 'axios';

interface ChatPayload {
  prompt: string;
  fileContent?: string;
  fileName?: string;
  transcript_file?: File;
  market_report_file?: File;
  job_description_file?: File;
  user_input_file?: File;
  candidate_cv_file?: File;
  interview_transcript_file?: File;
}

interface MarketIntelligenceResponse {
  market_report: string;
}

interface JobDescriptionResponse {
  job_description: string;
}

interface ClientFeedbackResponse {
  client_feedback: string;
}

interface ClientCharacteristicsResponse {
  response: string;
}

interface InterviewReportResponse {
  interview_report: string;
}

// Define different agent types
export type AgentType = 'market_intelligence' | 'jd_agenet' | 'client_representative_agent' | 'client_representative_creator_agent' | 'interview_report_agent';

const AGENT_RESPONSES = {
  market_intelligence: 'Market Intelligence: I provide market insights and analysis.',
  jd_agenet: 'JD Agent: I help with job description related tasks.',
  client_representative_agent: 'Client Representative: I assist with client communication.',
  client_representative_creator_agent: 'Client Representative Creator: I help create client presentations.',
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
        endpoint: 'http://localhost:8000/market_intelligence',
        fileName: payload.fileName,
        hasFileContent: !!payload.fileContent
      });

      const response = await fetch('http://localhost:8000/market_intelligence', {
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
  } else if (agentType === 'jd_agenet') {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append the transcript file if present
      if (payload.transcript_file) {
        formData.append('transcript_file', payload.transcript_file);
      }

      // Append the market report file if present
      if (payload.market_report_file) {
        formData.append('market_report_file', payload.market_report_file);
      }

      console.log('Sending request to Job Description API:', {
        endpoint: 'http://localhost:8000/job_description',
        hasTranscriptFile: !!payload.transcript_file,
        hasMarketReportFile: !!payload.market_report_file
      });

      const response = await fetch('http://localhost:8000/job_description', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      try {
        const data = await response.json() as JobDescriptionResponse;
        return data.job_description || 'No job description available in the response';
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        return 'Error: Could not parse the job description response';
      }
    } catch (error: any) {
      console.error('Error calling the Job Description API:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return 'Network error: Could not reach the API server';
      }
      return `Error: ${error.message || 'Unknown error occurred'}`;
    }
  } else if (agentType === 'client_representative_agent') {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append the transcript file if present
      if (payload.transcript_file) {
        formData.append('transcript_file', payload.transcript_file);
      }

      // Append the job description file if present
      if (payload.job_description_file) {
        formData.append('job_description_file', payload.job_description_file);
      }

      console.log('Sending request to Client Feedback API:', {
        endpoint: 'http://localhost:8000/client_feedback',
        hasTranscriptFile: !!payload.transcript_file,
        hasJobDescriptionFile: !!payload.job_description_file
      });

      const response = await fetch('http://localhost:8000/client_feedback', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      try {
        const data = await response.json() as ClientFeedbackResponse;
        return data.client_feedback || 'No client feedback available in the response';
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        return 'Error: Could not parse the client feedback response';
      }
    } catch (error: any) {
      console.error('Error calling the Client Feedback API:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return 'Network error: Could not reach the API server';
      }
      return `Error: ${error.message || 'Unknown error occurred'}`;
    }
  } else if (agentType === 'client_representative_creator_agent') {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append the user input file if present
      if (payload.user_input_file) {
        formData.append('user_input_file', payload.user_input_file);
      } else {
        throw new Error('User input file is required');
      }

      console.log('Sending request to Client Characteristics API:', {
        endpoint: 'http://localhost:8000/client_characteristics',
        hasUserInputFile: !!payload.user_input_file,
        fileName: payload.user_input_file?.name
      });

      const response = await fetch('http://localhost:8000/client_characteristics', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as ClientCharacteristicsResponse;
      return data.response || 'No client characteristics available in the response';
    } catch (error: any) {
      console.error('Error calling the Client Characteristics API:', error);
      return `Error: ${error.message || 'Unknown error occurred'}`;
    }
  } else if (agentType === 'interview_report_agent') {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append all required files
      if (payload.job_description_file) {
        formData.append('job_description_file', payload.job_description_file);
      } else {
        throw new Error('Job description file is required');
      }

      if (payload.candidate_cv_file) {
        formData.append('candidate_cv_file', payload.candidate_cv_file);
      } else {
        throw new Error('Candidate CV file is required');
      }

      if (payload.interview_transcript_file) {
        formData.append('interview_transcript_file', payload.interview_transcript_file);
      } else {
        throw new Error('Interview transcript file is required');
      }

      console.log('Sending request to Interview Report API:', {
        endpoint: 'http://localhost:8000/interview_report',
        hasJobDescriptionFile: !!payload.job_description_file,
        hasCandidateCVFile: !!payload.candidate_cv_file,
        hasInterviewTranscriptFile: !!payload.interview_transcript_file
      });

      const response = await fetch('http://localhost:8000/interview_report', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as InterviewReportResponse;
      return data.interview_report || 'No interview report available in the response';
    } catch (error: any) {
      console.error('Error calling the Interview Report API:', error);
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
    case 'client_representative_agent':
      response += '\nI can help with client communication needs.';
      break;
    case 'client_representative_creator_agent':
      response += '\nI can help create client presentations and materials.';
      break;
    case 'interview_report_agent':
      response += '\nI can help generate and analyze interview reports.';
      break;
  }
  
  return response;
}; 