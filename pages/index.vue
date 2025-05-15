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
          @click="selectedAgent = agent.type"
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

    <!-- Input and file upload -->
    <form @submit.prevent="handleSubmit" class="chat-input-container">
      <label class="file-label" title="Attach file (.json/.txt)">
        📎
        <input
          ref="fileInput"
          type="file"
          accept=".txt,.json"
          @change="handleFileChange"
          class="hidden-file-input"
        />
      </label>

      <input
        v-model="prompt"
        type="text"
        placeholder="Enter your prompt..."
        class="chat-input"
      />

      <button type="submit" class="chat-button">Send</button>
    </form>

    <!-- File info -->
    <div v-if="selectedFileName" class="file-info">
      Attached: {{ selectedFileName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { chatWithAgent, type AgentType } from '../services/api'

const agents = [
  { type: 'market_intelligence' as AgentType, name: 'Market Intelligence' },
  { type: 'jd_agenet' as AgentType, name: 'JD Agent' },
  { type: 'client_repersentative_agent' as AgentType, name: 'Client Representative' },
  { type: 'client_repersentative_creator_agent' as AgentType, name: 'Client Representative Creator' },
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

const handleFileChange = () => {
  const files = fileInput.value?.files
  if (files?.length) {
    selectedFile.value = files[0]
    selectedFileName.value = files[0].name
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

  // Clear inputs
  prompt.value = ''
  selectedFile.value = null
  selectedFileName.value = null
  if (fileInput.value) fileInput.value.value = ''

  // Call the API with selected agent
  const reply = await chatWithAgent(selectedAgent.value, {
    prompt: trimmedPrompt,
    fileContent,
    fileName
  })

  messages.value.push({ role: 'assistant', content: reply })

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

.chat-input-container {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #ddd;
  background-color: white;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  outline: none;
}

.file-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  transition: background-color 0.3s;
}

.file-label:hover {
  background-color: #e0e0e0;
}

.hidden-file-input {
  display: none;
}

.chat-button {
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-button:hover {
  background-color: #0056b3;
}

.file-info {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: #555;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}
</style>
