<template>
  <div class="chat-container">
    <!-- Agent Selection -->
    <div class="agent-selector">
      <div class="agent-selector-label">Select an AI Agent:</div>
      <div class="agent-options">
        <button
          v-for="agent in agents"
          :key="agent.type"
          :class="['agent-button', { active: selectedAgent === agent.type }]"
          @click="handleAgentSelect(agent.type)"
        >
          {{ agent.name }}
        </button>
      </div>
    </div>

    <!-- Chat messages -->
    <div ref="chatContainer" class="chat-messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role]"
      >
        <div class="message-bubble">
          {{ message.content }}
        </div>
      </div>
    </div>

    <!-- Input and file upload for regular agents and client representative creator -->
    <form 
      v-if="selectedAgent === 'client_representative_creator_agent'" 
      @submit.prevent="handleClientCharacteristicsSubmit" 
      class="chat-input-container"
    >
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload User Input File">
            📄 User Input File
            <input
              ref="userInputFileInput"
              type="file"
              accept=".json"
              @change="handleUserInputFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="userInputFileName" class="file-name">{{ userInputFileName }}</span>
        </div>
      </div>

      <button type="submit" class="chat-button" :disabled="!canSubmitClientCharacteristics">
        Generate Client Characteristics
      </button>
    </form>

    <!-- Special input for Job Description Agent -->
    <form 
      v-else-if="selectedAgent === 'jd_agenet'" 
      @submit.prevent="handleJDSubmit" 
      class="special-input-container"
    >
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Transcript">
            📄 Transcript
            <input
              ref="transcriptFileInput"
              type="file"
              accept=".txt,.json"
              @change="handleTranscriptFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="transcriptFileName" class="file-name">{{ transcriptFileName }}</span>
        </div>

        <div class="file-upload-group">
          <label class="file-label" title="Upload Market Report">
            📊 Market Report
            <input
              ref="marketReportFileInput"
              type="file"
              accept=".txt,.json"
              @change="handleMarketReportFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="marketReportFileName" class="file-name">{{ marketReportFileName }}</span>
        </div>
      </div>

      <button type="submit" class="chat-button" :disabled="!canSubmitJD">
        Generate Job Description
      </button>
    </form>

    <!-- Special input for Client Representative Agent -->
    <form 
      v-else-if="selectedAgent === 'client_representative_agent'" 
      @submit.prevent="handleClientFeedbackSubmit" 
      class="special-input-container"
    >
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Transcript">
            📄 Transcript
            <input
              ref="clientTranscriptFileInput"
              type="file"
              accept=".txt,.json"
              @change="handleClientTranscriptFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="clientTranscriptFileName" class="file-name">{{ clientTranscriptFileName }}</span>
        </div>

        <div class="file-upload-group">
          <label class="file-label" title="Upload Job Description">
            📋 Job Description
            <input
              ref="clientJobDescriptionFileInput"
              type="file"
              accept=".txt,.json"
              @change="handleClientJobDescriptionFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="clientJobDescriptionFileName" class="file-name">{{ clientJobDescriptionFileName }}</span>
        </div>
      </div>

      <button type="submit" class="chat-button" :disabled="!canSubmitClientFeedback">
        Generate Client Feedback
      </button>
    </form>

    <!-- Special input for Market Intelligence -->
    <form 
      v-else-if="selectedAgent === 'market_intelligence'" 
      @submit.prevent="handleMarketIntelligenceSubmit" 
      class="special-input-container"
    >
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Market Report">
            📊 Conversation File
            <input
              ref="marketIntelligenceFileInput"
              type="file"
              accept=".txt,.json"
              @change="handleMarketIntelligenceFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="marketIntelligenceFileName" class="file-name">{{ marketIntelligenceFileName }}</span>
        </div>
      </div>

      <button type="submit" class="chat-button" :disabled="!canSubmitMarketIntelligence">
        Generate Market Intelligence Report
      </button>
    </form>

    <!-- Special input for Interview Report Agent -->
    <form 
      v-else-if="selectedAgent === 'interview_report_agent'" 
      @submit.prevent="handleInterviewReportSubmit" 
      class="special-input-container"
    >
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Job Description">
            📋 Job Description
            <input
              ref="interviewJobDescriptionFileInput"
              type="file"
              accept=".json"
              @change="handleInterviewJobDescriptionFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="interviewJobDescriptionFileName" class="file-name">{{ interviewJobDescriptionFileName }}</span>
        </div>

        <div class="file-upload-group">
          <label class="file-label" title="Upload Candidate CV">
            📄 Candidate CV
            <input
              ref="candidateCVFileInput"
              type="file"
              accept=".json"
              @change="handleCandidateCVFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="candidateCVFileName" class="file-name">{{ candidateCVFileName }}</span>
        </div>

        <div class="file-upload-group">
          <label class="file-label" title="Upload Interview Transcript">
            🗣️ Interview Transcript
            <input
              ref="interviewTranscriptFileInput"
              type="file"
              accept=".json"
              @change="handleInterviewTranscriptFileChange"
              class="hidden-file-input"
            />
          </label>
          <span v-if="interviewTranscriptFileName" class="file-name">{{ interviewTranscriptFileName }}</span>
        </div>
      </div>

      <button type="submit" class="chat-button" :disabled="!canSubmitInterviewReport">
        Generate Interview Report
      </button>
    </form>

    <!-- File info -->
    <div v-if="selectedFileName" class="file-info">
      Attached: {{ selectedFileName }}
      <span v-if="selectedAgent === 'client_representative_creator_agent'" class="file-type-hint">
        (JSON file required)
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { chatWithAgent, type AgentType } from '../services/api'

const agents = [
  { type: 'market_intelligence' as AgentType, name: 'Market Intelligence' },
  { type: 'jd_agenet' as AgentType, name: 'JD Agent' },
  { type: 'client_representative_agent' as AgentType, name: 'Client Representative' },
  { type: 'client_representative_creator_agent' as AgentType, name: 'Client Representative Creator' },
  { type: 'interview_report_agent' as AgentType, name: 'Interview Report' }
]

const selectedAgent = ref<AgentType>('market_intelligence')
const prompt = ref('')
const messages = ref([
  { role: 'assistant', content: 'Hello! How can I help you today?' }
])
const chatContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string | null>(null)

// New refs for JD agent
const transcriptFileInput = ref<HTMLInputElement | null>(null)
const marketReportFileInput = ref<HTMLInputElement | null>(null)
const transcriptFile = ref<File | null>(null)
const marketReportFile = ref<File | null>(null)
const transcriptFileName = ref<string | null>(null)
const marketReportFileName = ref<string | null>(null)

// New refs for Client Representative agent
const clientTranscriptFileInput = ref<HTMLInputElement | null>(null)
const clientJobDescriptionFileInput = ref<HTMLInputElement | null>(null)
const clientTranscriptFile = ref<File | null>(null)
const clientJobDescriptionFile = ref<File | null>(null)
const clientTranscriptFileName = ref<string | null>(null)
const clientJobDescriptionFileName = ref<string | null>(null)

// New refs for Client Representative Creator agent
const userInputFileInput = ref<HTMLInputElement | null>(null)
const userInputFile = ref<File | null>(null)
const userInputFileName = ref<string | null>(null)

// New refs for Market Intelligence agent
const marketIntelligenceFileInput = ref<HTMLInputElement | null>(null)
const marketIntelligenceFile = ref<File | null>(null)
const marketIntelligenceFileName = ref<string | null>(null)

// New refs for Interview Report agent
const interviewJobDescriptionFileInput = ref<HTMLInputElement | null>(null)
const candidateCVFileInput = ref<HTMLInputElement | null>(null)
const interviewTranscriptFileInput = ref<HTMLInputElement | null>(null)

const interviewJobDescriptionFile = ref<File | null>(null)
const candidateCVFile = ref<File | null>(null)
const interviewTranscriptFile = ref<File | null>(null)

const interviewJobDescriptionFileName = ref<string | null>(null)
const candidateCVFileName = ref<string | null>(null)
const interviewTranscriptFileName = ref<string | null>(null)

const canSubmitJD = computed(() => {
  return transcriptFile.value && marketReportFile.value
})

const canSubmitClientFeedback = computed(() => {
  return clientTranscriptFile.value && clientJobDescriptionFile.value
})

const canSubmitClientCharacteristics = computed(() => {
  return userInputFile.value !== null
})

const canSubmitMarketIntelligence = computed(() => {
  return marketIntelligenceFile.value !== null
})

const canSubmitInterviewReport = computed(() => {
  return interviewJobDescriptionFile.value && 
         candidateCVFile.value && 
         interviewTranscriptFile.value
})

const getFileUploadTitle = computed(() => {
  return selectedAgent.value === 'client_representative_creator_agent'
    ? 'Upload User Input JSON File'
    : 'Attach file (.json/.txt)'
})

const getInputPlaceholder = computed(() => {
  return selectedAgent.value === 'client_representative_creator_agent'
    ? 'Upload a JSON file to generate client characteristics...'
    : 'Enter your prompt...'
})

const isSubmitDisabled = computed(() => {
  if (selectedAgent.value === 'client_representative_creator_agent') {
    return !selectedFile.value
  }
  return false
})

const handleAgentSelect = (agentType: AgentType) => {
  selectedAgent.value = agentType
  // Clear all files when switching agents
  clearFiles()
}

const clearFiles = () => {
  selectedFile.value = null
  selectedFileName.value = null
  transcriptFile.value = null
  marketReportFile.value = null
  transcriptFileName.value = null
  marketReportFileName.value = null
  clientTranscriptFile.value = null
  clientJobDescriptionFile.value = null
  clientTranscriptFileName.value = null
  clientJobDescriptionFileName.value = null
  userInputFile.value = null
  userInputFileName.value = null
  marketIntelligenceFile.value = null
  marketIntelligenceFileName.value = null
  interviewJobDescriptionFile.value = null
  candidateCVFile.value = null
  interviewTranscriptFile.value = null
  interviewJobDescriptionFileName.value = null
  candidateCVFileName.value = null
  interviewTranscriptFileName.value = null
  if (fileInput.value) fileInput.value.value = ''
  if (transcriptFileInput.value) transcriptFileInput.value.value = ''
  if (marketReportFileInput.value) marketReportFileInput.value.value = ''
  if (clientTranscriptFileInput.value) clientTranscriptFileInput.value.value = ''
  if (clientJobDescriptionFileInput.value) clientJobDescriptionFileInput.value.value = ''
  if (userInputFileInput.value) userInputFileInput.value.value = ''
  if (marketIntelligenceFileInput.value) marketIntelligenceFileInput.value.value = ''
  if (interviewJobDescriptionFileInput.value) interviewJobDescriptionFileInput.value.value = ''
  if (candidateCVFileInput.value) candidateCVFileInput.value.value = ''
  if (interviewTranscriptFileInput.value) interviewTranscriptFileInput.value.value = ''
}

const handleFileChange = () => {
  const files = fileInput.value?.files
  if (files?.length) {
    const file = files[0]
    
    // Validate JSON file for client representative creator
    if (selectedAgent.value === 'client_representative_creator_agent') {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        selectedFile.value = file
        selectedFileName.value = file.name
      } else {
        alert('Please select a JSON file')
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        selectedFile.value = null
        selectedFileName.value = null
      }
    } else {
      selectedFile.value = file
      selectedFileName.value = file.name
    }
  }
}

const handleTranscriptFileChange = () => {
  const files = transcriptFileInput.value?.files
  if (files?.length) {
    transcriptFile.value = files[0]
    transcriptFileName.value = files[0].name
  }
}

const handleMarketReportFileChange = () => {
  const files = marketReportFileInput.value?.files
  if (files?.length) {
    marketReportFile.value = files[0]
    marketReportFileName.value = files[0].name
  }
}

const handleClientTranscriptFileChange = () => {
  const files = clientTranscriptFileInput.value?.files
  if (files?.length) {
    clientTranscriptFile.value = files[0]
    clientTranscriptFileName.value = files[0].name
  }
}

const handleClientJobDescriptionFileChange = () => {
  const files = clientJobDescriptionFileInput.value?.files
  if (files?.length) {
    clientJobDescriptionFile.value = files[0]
    clientJobDescriptionFileName.value = files[0].name
  }
}

const handleUserInputFileChange = () => {
  const files = userInputFileInput.value?.files
  if (files?.length) {
    const file = files[0]
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      userInputFile.value = file
      userInputFileName.value = file.name
    } else {
      alert('Please select a JSON file')
      if (userInputFileInput.value) {
        userInputFileInput.value.value = ''
      }
      userInputFile.value = null
      userInputFileName.value = null
    }
  }
}

const handleMarketIntelligenceFileChange = () => {
  const files = marketIntelligenceFileInput.value?.files
  if (files?.length) {
    marketIntelligenceFile.value = files[0]
    marketIntelligenceFileName.value = files[0].name
  }
}

const handleInterviewJobDescriptionFileChange = () => {
  const files = interviewJobDescriptionFileInput.value?.files
  if (files?.length) {
    interviewJobDescriptionFile.value = files[0]
    interviewJobDescriptionFileName.value = files[0].name
  }
}

const handleCandidateCVFileChange = () => {
  const files = candidateCVFileInput.value?.files
  if (files?.length) {
    candidateCVFile.value = files[0]
    candidateCVFileName.value = files[0].name
  }
}

const handleInterviewTranscriptFileChange = () => {
  const files = interviewTranscriptFileInput.value?.files
  if (files?.length) {
    interviewTranscriptFile.value = files[0]
    interviewTranscriptFileName.value = files[0].name
  }
}

const handleSubmit = async () => {
  const trimmedPrompt = prompt.value.trim()
  const hasPrompt = trimmedPrompt !== ''
  const hasFile = selectedFile.value !== null

  if (!hasPrompt && !hasFile) return // Do nothing if both are empty

  if (hasPrompt) {
    messages.value.push({ role: 'user', content: trimmedPrompt })
  } else if (hasFile) {
    messages.value.push({
      role: 'user',
      content: `📎 Sent file: ${selectedFileName.value}`
    })
  }

  // Read file content if present
  let fileContent = ''
  let fileName = ''
  if (hasFile && selectedFile.value) {
    fileContent = await selectedFile.value.text()
    fileName = selectedFile.value.name
  }

  // If it's the client representative creator agent, handle the file differently
  if (selectedAgent.value === 'client_representative_creator_agent' && selectedFile.value) {
    const reply = await chatWithAgent(selectedAgent.value, {
      prompt: trimmedPrompt,
      user_input_file: selectedFile.value
    })
    messages.value.push({ role: 'assistant', content: reply })
  } else {
    // Handle other agents
    const reply = await chatWithAgent(selectedAgent.value, {
      prompt: trimmedPrompt,
      fileContent,
      fileName
    })
    messages.value.push({ role: 'assistant', content: reply })
  }

  // Clear inputs
  prompt.value = ''
  selectedFile.value = null
  selectedFileName.value = null
  if (fileInput.value) fileInput.value.value = ''

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleJDSubmit = async () => {
  if (!transcriptFile.value || !marketReportFile.value) return

  messages.value.push({
    role: 'user',
    content: `📎 Generating Job Description using:\nTranscript: ${transcriptFileName.value}\nMarket Report: ${marketReportFileName.value}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: '',
    transcript_file: transcriptFile.value,
    market_report_file: marketReportFile.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleClientFeedbackSubmit = async () => {
  if (!clientTranscriptFile.value || !clientJobDescriptionFile.value) return

  messages.value.push({
    role: 'user',
    content: `📎 Generating Client Feedback using:\nTranscript: ${clientTranscriptFileName.value}\nJob Description: ${clientJobDescriptionFileName.value}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: '',
    transcript_file: clientTranscriptFile.value,
    job_description_file: clientJobDescriptionFile.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleMarketIntelligenceSubmit = async () => {
  if (!marketIntelligenceFile.value) {
    alert('Please upload a market report file')
    return
  }

  messages.value.push({
    role: 'user',
    content: `📎 Generating Market Intelligence using:\nMarket Report: ${marketIntelligenceFileName.value}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: '',
    fileContent: await marketIntelligenceFile.value.text(),
    fileName: marketIntelligenceFile.value.name
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleInterviewReportSubmit = async () => {
  if (!interviewJobDescriptionFile.value || !candidateCVFile.value || !interviewTranscriptFile.value) {
    alert('Please upload all required files')
    return
  }

  messages.value.push({
    role: 'user',
    content: `📎 Generating Interview Report using:\nJob Description: ${interviewJobDescriptionFileName.value}\nCandidate CV: ${candidateCVFileName.value}\nInterview Transcript: ${interviewTranscriptFileName.value}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: '',
    job_description_file: interviewJobDescriptionFile.value,
    candidate_cv_file: candidateCVFile.value,
    interview_transcript_file: interviewTranscriptFile.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleClientCharacteristicsSubmit = async () => {
  if (!userInputFile.value) {
    alert('Please select a user input file')
    return
  }

  try {
    messages.value.push({
      role: 'user',
      content: `📎 Generating Client Characteristics using:\nUser Input: ${userInputFileName.value}`
    })

    const reply = await chatWithAgent(selectedAgent.value, {
      prompt: '',
      user_input_file: userInputFile.value
    })

    messages.value.push({ role: 'assistant', content: reply })
    clearFiles()
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: `Error: Failed to generate client characteristics. Please make sure the file is in the correct format.`
    })
    console.error('Error in client characteristics submission:', error)
  }

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}

.agent-selector {
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #ddd;
}

.agent-selector-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.agent-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.agent-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 1.5rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.agent-button:hover {
  background-color: #f0f0f0;
}

.agent-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f3f3f3;
}

.message {
  margin-bottom: 1rem;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background-color: #ffffff;
  border: 1px solid #ddd;
  color: #333;
  white-space: pre-wrap;
}

.message.user .message-bubble {
  background-color: #007bff;
  color: white;
  border: none;
}

.chat-input-container,
.special-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #ddd;
  background-color: white;
  gap: 0.5rem;
}

.special-input-container {
  flex-direction: column;
  padding: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.file-uploads {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1rem;
  justify-content: center;
}

.file-upload-group {
  flex: 1;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px dashed #007bff;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
  justify-content: center;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  color: #007bff;
}

.file-label:hover {
  background-color: #e3f2fd;
  border-color: #0056b3;
}

.file-name {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hidden-file-input {
  display: none;
}

.chat-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  width: auto;
  min-width: 200px;
  margin-top: 1rem;
  align-self: center;
}

.chat-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.chat-button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.chat-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  outline: none;
}

.file-info {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: #555;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.file-upload-single {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 1rem;
}

.file-upload-single .file-upload-group {
  width: 100%;
  max-width: 400px;
}

.file-hint {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
}

.file-type-hint {
  color: #666;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}
</style>
