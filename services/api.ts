interface ChatPayload {
  prompt: string;
  fileContent?: string;
  fileName?: string;
}

// Define different agent types
export type AgentType = 'general' | 'technical' | 'creative' | 'analytical' | 'research';

const AGENT_RESPONSES = {
  general: 'General Assistant: I aim to help with any task.',
  technical: 'Technical Expert: I specialize in technical problems and coding.',
  creative: 'Creative Assistant: I help with creative and artistic endeavors.',
  analytical: 'Analytical Assistant: I excel at data analysis and problem-solving.',
  research: 'Research Assistant: I help with research and information gathering.'
};

// Simulated delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const chatWithAgent = async (agentType: AgentType, payload: ChatPayload): Promise<string> => {
  // Simulate API call with different response based on agent type
  await delay(1000);
  
  let response = `${AGENT_RESPONSES[agentType]}\n\n`;
  
  if (payload.prompt) {
    response += `Responding to: "${payload.prompt}"\n`;
  }
  
  if (payload.fileContent) {
    response += `Processed file "${payload.fileName}" with ${payload.fileContent.length} characters.\n`;
  }
  
  // Add agent-specific responses
  switch (agentType) {
    case 'technical':
      response += '\nI can help you with coding and technical problems.';
      break;
    case 'creative':
      response += '\nLet\'s think outside the box!';
      break;
    case 'analytical':
      response += '\nI\'ll analyze this systematically.';
      break;
    case 'research':
      response += '\nI\'ll help gather relevant information.';
      break;
    default:
      response += '\nHow else can I assist you?';
  }
  
  return response;
}; 