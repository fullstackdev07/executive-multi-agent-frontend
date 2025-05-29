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
  market_report: string;
}

interface JobDescriptionResponse {
  job_description: string;
}

interface ClientFeedbackResponse {
  generated_prompt: string;
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
      
      // Add company_information (prompt)
      if (payload.prompt) {
        formData.append('company_information', payload.prompt);
      }

      // Add all supporting documents
      if (payload.supporting_documents && payload.supporting_documents.length > 0) {
        for (const file of payload.supporting_documents) {
          formData.append('supporting_documents', file, file.name);
        }
      }

      // Log what we're sending
      console.log('Sending request to Market Intelligence API:', {
        endpoint: 'https://executive-multi-agent.onrender.com/market_intelligence',
        company_information: payload.prompt,
        supporting_documents: payload.supporting_documents?.map(f => f.name)
      });

      const response = await fetch('https://executive-multi-agent.onrender.com/market_intelligence', {
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
        const data = await response.json() as MarketIntelligenceResponse;   
        if (
          data.market_report &&
          data.market_report.includes("Cannot generate report")
        ) {
          return `Error: Enter a company name, a ticker symbol, or a short query about the company or market you're interested in. You can also upload supporting documents below or Upload relevant documents (PDF, TXT, JSON) like company profiles, existing reports, or news articles to provide more context.`;
        }

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
      
      // Add manual_input (prompt)
      if (payload.prompt) {
        formData.append('manual_input', payload.prompt);
      }

      // Add all files
      if (payload.jd_files && payload.jd_files.length > 0) {
        for (const file of payload.jd_files) {
          formData.append('files', file, file.name);
        }
      }

      console.log('Sending request to Job Description API:', {
        endpoint: 'https://executive-multi-agent.onrender.com/job_description',
        manual_input: payload.prompt,
        files: payload.jd_files?.map(f => f.name)
      });

      const response = await fetch('https://executive-multi-agent.onrender.com/job_description', {
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
            errorText = "Specify the job role you want a description for (e.g., 'Software Engineer'). You can also provide a more detailed brief, a client persona to write for, or a previous market report to use as context. Supporting documents can be uploaded below or Upload relevant documents like company information, style guides, existing JD templates, or market reports (PDF, TXT, JSON) to enrich the job description.";
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
      
      // Add user_input (prompt)
      if (payload.prompt) {
        formData.append('user_input', payload.prompt);
      }
  
      // Add all files
      if (payload.transcript_files && payload.transcript_files.length > 0) {
        for (const file of payload.transcript_files) {
          formData.append('files', file, file.name);
        }
      }
  
      console.log('Sending request to Client Feedback API:', {
        endpoint: 'https://executive-multi-agent.onrender.com/client_feedback',
        user_input: payload.prompt,
        files: payload.transcript_files?.map(f => f.name)
      });
  
      const response = await fetch('https://executive-multi-agent.onrender.com/client_feedback', {
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
            errorText = "Paste the text or document you want feedback on. You can also provide guidance on the client persona to adopt for the feedback (e.g., 'Act as a detail-oriented client'). Use '---CLIENT PERSONA GUIDANCE---' and '---DOCUMENT TO REVIEW---' delimiters if providing both. Supporting files can provide additional context for the client's persona or Upload documents (PDF, TXT, JSON) that provide context about the client's persona, values, or past communications, which will help the agent emulate them accurately when giving feedback.";
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
        return data.client_representative_feedback || 'No client representative feedback available in the response';
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        return 'Error: Could not parse the client representative feedback response';
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
      
      // Add client_description (prompt)
      if (payload.prompt) {
        formData.append('client_description', payload.prompt);
      }

      // Add all transcript files
      if (payload.transcript_files && payload.transcript_files.length > 0) {
        for (const file of payload.transcript_files) {
          formData.append('transcript_files', file, file.name);
        }
      }

      console.log('Sending request to Client Creator API:', {
        endpoint: 'https://executive-multi-agent.onrender.com/client_creator',
        client_description: payload.prompt,
        transcript_files: payload.transcript_files?.map(f => f.name)
      });

      const response = await fetch('https://executive-multi-agent.onrender.com/client_creator', {
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
            errorText = "Describe the client you want to emulate. This can be a short phrase (like 'skeptical client') or a more detailed description of their persona, priorities, values, and communication style. You can also upload transcripts below for tone analysis or Upload transcripts of client conversations, emails, or other documents (PDF, TXT, JSON) that reflect the client's tone and style.";
          } else {
            errorText = JSON.stringify(errorData);
          }
        } catch (jsonErr) {
          errorText = await response.text();
        }
        console.error('API Error Response:', errorText);
        return `Error: ${errorText}`;
      }

      const data = await response.json();
      return data.generated_prompt || data.response || 'No client characteristics available in the response';
    } catch (error: any) {
      console.error('Error calling the Client Creator API:', error);
      return `Error: ${error.message || 'Unknown error occurred'}`;
    }
  } else if (agentType === 'interview_report_agent') {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add manual_input (prompt)
      if (payload.prompt) {
        formData.append('input_text', payload.prompt);
      }

      // Add all files
      if (payload.interview_files && payload.interview_files.length > 0) {
        for (const file of payload.interview_files) {
          formData.append('files', file, file.name);
        }
      }

      console.log('Sending request to Interview Report API:', {
        endpoint: 'https://executive-multi-agent.onrender.com/interview_report',
        input_text: payload.prompt,
        files: payload.interview_files?.map(f => f.name)
      });

      const response = await fetch('https://executive-multi-agent.onrender.com/interview_report', {
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
            errorText = "Provide instructions for the interview report, such as the candidate's name and role. You can also paste consultant notes or use delimiters (e.g., ---JOB SPEC---, ---CANDIDATE CV---) to structure detailed information. Upload relevant files like CVs, job specs, and interview transcripts below or Upload supporting documents: Candidate's CV/Resume, Job Specification, Interview Transcript/Notes, Role Scorecard (PDF, TXT, JSON). The agent will try to identify the type of document from its filename.";
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
        return data.interview_report || 'No interview report available in the response';
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        return 'Error: Could not parse the interview report response';
      }
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