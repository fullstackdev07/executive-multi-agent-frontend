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
      @submit.prevent="handleClientCreatorSubmit" 
      class="chat-input-container"
    >
    <input
      v-model="prompt"
      type="text"
      placeholder="Enter client description..."
      class="chat-input"
    />
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Transcript Files">
            📄 Transcript Files
            <input
              ref="clientCreatorFilesInput"
              type="file"
              accept=".txt,.json,.pdf"
              @change="handleClientCreatorFilesChange"
              class="hidden-file-input"
              multiple
            />
          </label>
          <span v-if="clientCreatorFiles.length" class="file-name">
            {{ clientCreatorFiles.map(f => f.name).join(', ') }}
          </span>
        </div>
      </div>

      <button type="submit" class="chat-button" :disabled="!canSubmitClientCreator">
        Generate Client Creator
      </button>
    </form>

    <!-- Special input for Job Description Agent -->
    <form 
      v-else-if="selectedAgent === 'jd_agenet'" 
      @submit.prevent="handleJDSubmit" 
      class="special-input-container"
    >
    <input
      v-model="prompt"
      type="text"
      placeholder="Enter company information..."
      class="chat-input"
    />
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Files">
            📄 Files
            <input
              ref="jdFilesInput"
              type="file"
              accept=".txt,.json,.pdf"
              @change="handleJDFileChange"
              class="hidden-file-input"
              multiple
            />
          </label>
          <span v-if="jdFiles.length" class="file-name">
            {{ jdFiles.map(f => f.name).join(', ') }}
          </span>
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
    <input
      v-model="prompt"
      type="text"
      placeholder="Enter company information..."
      class="chat-input"
    />
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Transcript Files">
            📄 Transcript Files
            <input
              ref="clientTranscriptFileInput"
              type="file"
              accept=".txt,.json,.pdf"
              @change="handleClientTranscriptFileChange"
              class="hidden-file-input"
              multiple
            />
          </label>
          <span v-if="clientTranscriptFiles.length" class="file-name">
            {{ clientTranscriptFiles.map(f => f.name).join(', ') }}
          </span>
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
      <!-- ADD THIS BLOCK FOR PROMPT INPUT -->
  <input
    v-model="prompt"
    type="text"
    placeholder="Enter company information..."
    class="chat-input"
  />
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Market Report">
            📊 Conversation File
            <input
              ref="marketIntelligenceFileInput"
              type="file"
              accept=".txt,.json,.pdf"
              @change="handleMarketIntelligenceFileChange"
              class="hidden-file-input"
              multiple
            />
          </label>
          <span v-if="marketIntelligenceFiles.length" class="file-name">
            {{ marketIntelligenceFiles.map(f => f.name).join(', ') }}
          </span>
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
    <input
      v-model="prompt"
      type="text"
      placeholder="Enter company information..."
      class="chat-input"
    />
      <div class="file-uploads">
        <div class="file-upload-group">
          <label class="file-label" title="Upload Files">
            📄 Files
            <input
              ref="interviewFilesInput"
              type="file"
              accept=".txt,.json,.pdf"
              @change="handleInterviewFilesChange"
              class="hidden-file-input"
              multiple
            />
          </label>
          <span v-if="interviewFiles.length" class="file-name">
            {{ interviewFiles.map(f => f.name).join(', ') }}
          </span>
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
  { type: 'client_representative_creator_agent' as AgentType, name: 'Client Representative Creator' },
  { type: 'client_representative_agent' as AgentType, name: 'Client Representative' },
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
const jdFilesInput = ref<HTMLInputElement | null>(null)
const jdFiles = ref<File[]>([])
const jdFilesNames = computed(() => jdFiles.value.map(f => f.name))

// New refs for Client Representative agent
const clientTranscriptFileInput = ref<HTMLInputElement | null>(null)
const clientTranscriptFiles = ref<File[]>([])
const clientJobDescriptionFileInput = ref<HTMLInputElement | null>(null)
const clientTranscriptFileNames = computed(() => clientTranscriptFiles.value.map(f => f.name))

// New refs for Client Representative Creator agent
const clientCreatorFilesInput = ref<HTMLInputElement | null>(null)
const clientCreatorFiles = ref<File[]>([])
const clientCreatorFilesNames = computed(() => clientCreatorFiles.value.map(f => f.name))

// New refs for Market Intelligence agent
const marketIntelligenceFileInput = ref<HTMLInputElement | null>(null)
const marketIntelligenceFiles = ref<File[]>([])

// New refs for Interview Report agent
const interviewFilesInput = ref<HTMLInputElement | null>(null)
const interviewFiles = ref<File[]>([])
const interviewFilesNames = computed(() => interviewFiles.value.map(f => f.name))

const canSubmitJD = computed(() => {
  return jdFiles.value.length > 0 || prompt.value.trim() !== ''
})

const canSubmitClientFeedback = computed(() => {
  return clientTranscriptFiles.value.length > 0 || prompt.value.trim() !== ''
})

const canSubmitClientCreator = computed(() => {
  return clientCreatorFiles.value.length > 0 || prompt.value.trim() !== ''
})

const canSubmitMarketIntelligence = computed(() => {
  return marketIntelligenceFiles.value.length > 0 || prompt.value.trim() !== ''
})

const canSubmitInterviewReport = computed(() => {
  return interviewFiles.value.length > 0 || prompt.value.trim() !== ''
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
  jdFiles.value = []
  clientTranscriptFiles.value = []
  clientJobDescriptionFileInput.value = null
  clientTranscriptFileNames.value = []
  clientCreatorFiles.value = []
  clientCreatorFilesNames.value = []
  marketIntelligenceFiles.value = []
  interviewFiles.value = []
  if (fileInput.value) fileInput.value.value = ''
  if (transcriptFileInput.value) transcriptFileInput.value.value = ''
  if (jdFilesInput.value) jdFilesInput.value.value = ''
  if (clientTranscriptFileInput.value) clientTranscriptFileInput.value.value = ''
  if (clientCreatorFilesInput.value) clientCreatorFilesInput.value.value = ''
  if (marketIntelligenceFileInput.value) marketIntelligenceFileInput.value.value = ''
  if (interviewFilesInput.value) interviewFilesInput.value.value = ''
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

const handleJDFileChange = () => {
  const files = jdFilesInput.value?.files
  if (files?.length) {
    jdFiles.value = Array.from(files)
  } else {
    jdFiles.value = []
  }
}

const handleClientTranscriptFileChange = () => {
  const files = clientTranscriptFileInput.value?.files
  if (files?.length) {
    clientTranscriptFiles.value = Array.from(files)
  } else {
    clientTranscriptFiles.value = []
  }
}

const handleClientJobDescriptionFileChange = () => {
  const files = clientJobDescriptionFileInput.value?.files
  if (files?.length) {
    clientJobDescriptionFile.value = files[0]
    clientJobDescriptionFileName.value = files[0].name
  }
}

const handleClientCreatorFilesChange = () => {
  const files = clientCreatorFilesInput.value?.files
  if (files?.length) {
    clientCreatorFiles.value = Array.from(files)
  } else {
    clientCreatorFiles.value = []
  }
}

const handleMarketIntelligenceFileChange = () => {
  const files = marketIntelligenceFileInput.value?.files
  if (files?.length) {
    marketIntelligenceFiles.value = Array.from(files)
  } else {
    marketIntelligenceFiles.value = []
  }
}

const handleInterviewFilesChange = () => {
  const files = interviewFilesInput.value?.files
  if (files?.length) {
    interviewFiles.value = Array.from(files)
  } else {
    interviewFiles.value = []
  }
}

const handleInterviewReportSubmit = async () => {
  if (interviewFiles.value.length === 0 && prompt.value.trim() === '') {
    alert('Please enter manual input or upload at least one file.')
    return
  }

  messages.value.push({
    role: 'user',
    content: `📎 Generating Interview Report using:\nManual Input: ${prompt.value}\nFiles: ${interviewFiles.value.map(f => f.name).join(', ')}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: prompt.value,
    interview_files: interviewFiles.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()
  prompt.value = ''

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleClientCreatorSubmit = async () => {
  if (clientCreatorFiles.value.length === 0 && prompt.value.trim() === '') {
    alert('Please enter client description or upload at least one transcript file.')
    return
  }

  messages.value.push({
    role: 'user',
    content: `📎 Generating Client Creator using:\nClient Description: ${prompt.value}\nTranscript Files: ${clientCreatorFiles.value.map(f => f.name).join(', ')}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: prompt.value,
    transcript_files: clientCreatorFiles.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()
  prompt.value = ''

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleMarketIntelligenceSubmit = async () => {
  if (marketIntelligenceFiles.value.length === 0 && prompt.value.trim() === '') {
    alert('Please enter company information or upload at least one supporting document.')
    return
  }

  messages.value.push({
    role: 'user',
    content: `📎 Generating Market Intelligence using:\nCompany Information: ${prompt.value}\nSupporting Documents: ${marketIntelligenceFiles.value.map(f => f.name).join(', ')}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: prompt.value,
    supporting_documents: marketIntelligenceFiles.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()
  prompt.value = ''

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleJDSubmit = async () => {
  if (jdFiles.value.length === 0 && prompt.value.trim() === '') {
    alert('Please enter manual input or upload at least one file.')
    return
  }

  messages.value.push({
    role: 'user',
    content: `📎 Generating Job Description using:\nManual Input: ${prompt.value}\nFiles: ${jdFiles.value.map(f => f.name).join(', ')}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: prompt.value,
    jd_files: jdFiles.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()
  prompt.value = ''

  // Scroll to bottom
  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}

const handleClientFeedbackSubmit = async () => {
  if (clientTranscriptFiles.value.length === 0 && prompt.value.trim() === '') {
    alert('Please enter manual input text or upload at least one transcript file.')
    return
  }

  messages.value.push({
    role: 'user',
    content: `📎 Generating Client Feedback using:\nManual Input: ${prompt.value}\nTranscript Files: ${clientTranscriptFiles.value.map(f => f.name).join(', ')}`
  })

  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: prompt.value,
    transcript_files: clientTranscriptFiles.value
  })

  messages.value.push({ role: 'assistant', content: reply })
  clearFiles()
  prompt.value = ''

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
  gap: 0.5rem;
  width: 100%;
  /* margin-bottom: 1rem; */
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
  /* margin-top: 1rem; */
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
  width:100%;
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
