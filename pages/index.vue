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
          <template v-if="message.loading">
            <span class="spinner"></span>
          </template>
          <template v-else>
            {{ message.content }}
          </template>
        </div>
      </div>
    </div>

    <!-- Unified Chat Input and File Upload -->
    <form 
      class="chat-input-container unified-chat-input"
      @submit.prevent="handleUnifiedSubmit"
    >
      <div class="input-row">
        <input
          v-model="prompt"
          type="text"
          :placeholder="'Type your message...'
          "
          class="chat-input"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="handleUnifiedSubmit"
        />
        <label class="file-upload-icon" :class="{ disabled: isLoading }">
          <input
            ref="unifiedFileInput"
            type="file"
            accept=".txt,.json,.pdf"
            @change="handleUnifiedFileChange"
            class="hidden-file-input"
            :disabled="isLoading"
            multiple
          />
          <span>
            <svg fill="white" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 48 48"><path d="M0 0h48v48H0z" color="white" fill="none"/><g id="Shopicon"><path d="M29,4c-3.859,0-7,3.141-7,7v21h4V11c0-1.654,1.346-3,3-3s3,1.346,3,3l0,5h-0.001l0,6.919l0,9.081H32c0,4.411-3.589,8-8,8   s-7.999-3.589-7.999-8L16,10h-4l0.001,22c0,6.617,5.383,12,11.999,12c6.617,0,12-5.383,12-12l-0.001-9.081L36,11   C36,7.141,32.859,4,29,4z"/></g>
            </svg>
          </span>
        </label>
        <button type="submit" class="send-button" :disabled="!canSubmitUnified || isLoading">
          <span style="margin-bottom: 2px;">➤</span>
        </button>
      </div>
      <div v-if="unifiedFiles.length" class="file-name">
        {{ unifiedFiles.map(f => f.name).join(', ') }}
      </div>
    </form>
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
const messages = ref<({ role: string; content: string; loading?: boolean })[]>([
  { role: 'assistant', content: 'Hello! How can I help you today?' }
])
const chatContainer = ref<HTMLElement | null>(null)
const unifiedFileInput = ref<HTMLInputElement | null>(null)
const unifiedFiles = ref<File[]>([])
const isLoading = ref(false)

const canSubmitUnified = computed(() => {
  return (unifiedFiles.value.length > 0 || prompt.value.trim() !== '') && !isLoading.value
})

const handleAgentSelect = (agentType: AgentType) => {
  selectedAgent.value = agentType
  clearUnified()
}

const clearUnified = () => {
  unifiedFiles.value = []
  if (unifiedFileInput.value) unifiedFileInput.value.value = ''
  prompt.value = ''
}

const handleUnifiedFileChange = () => {
  const files = unifiedFileInput.value?.files
  if (files?.length) {
    unifiedFiles.value = Array.from(files)
  } else {
    unifiedFiles.value = []
  }
}

const handleUnifiedSubmit = async () => {
  if (isLoading.value) return
  if (unifiedFiles.value.length === 0 && prompt.value.trim() === '') {
    alert('Please enter a message or upload at least one file.')
    return
  }
  isLoading.value = true
  // Add user message
  messages.value.push({
    role: 'user',
    content: prompt.value + (unifiedFiles.value.length ? `\nAttachment~ ${unifiedFiles.value.map(f => f.name).join(', ')}` : '')
  })

  // Create a reactive loading message object
  const loadingMsg = reactive({ role: 'assistant', content: '', loading: true })
  messages.value.push(loadingMsg)

  // Timer for 'please wait' message
  let waitMsg: any = null
  let waitTimer = setTimeout(() => {
    waitMsg = reactive({ role: 'assistant', content: 'It may take some time, please wait.', loading: false })
    messages.value.splice(messages.value.indexOf(loadingMsg) + 1, 0, waitMsg)
  }, 6000)

  await nextTick()
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })

  let payload: any = { prompt: prompt.value }
  switch (selectedAgent.value) {
    case 'market_intelligence':
      payload.supporting_documents = unifiedFiles.value
      break
    case 'jd_agenet':
      payload.jd_files = unifiedFiles.value
      break
    case 'client_representative_agent':
    case 'client_representative_creator_agent':
      payload.transcript_files = unifiedFiles.value
      break
    case 'interview_report_agent':
      payload.interview_files = unifiedFiles.value
      break
  }

  try {
    const reply = await chatWithAgent(selectedAgent.value, payload)

    // Disable loading and trigger DOM update
    loadingMsg.loading = false
    if (waitMsg) {
      const idx = messages.value.indexOf(waitMsg)
      if (idx !== -1) messages.value.splice(idx, 1)
    }
    clearTimeout(waitTimer)
    await nextTick()

    // Animate typing
    for (let i = 0; i < reply.length; i++) {
      loadingMsg.content += reply[i]
      await new Promise(resolve => setTimeout(resolve, 2))
      await nextTick()
      chatContainer.value?.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'auto'
      })
    }

  } catch (e: any) {
    loadingMsg.content = 'Error: ' + (e?.message || 'Unknown error')
    loadingMsg.loading = false
    if (waitMsg) {
      const idx = messages.value.indexOf(waitMsg)
      if (idx !== -1) messages.value.splice(idx, 1)
    }
    clearTimeout(waitTimer)
  } finally {
    isLoading.value = false
    clearUnified()
  }
}


</script>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: #121212; /* Or your desired background */
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  /* color: #e0e0e0; */
}

.agent-selector {
  padding: 1rem 20rem;
  background-color: #2c2c2c;
  border-bottom: 1px solid #444;
}

.agent-selector-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #e0e0e0;
}

.agent-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.agent-button {
  padding: 0.5rem 1rem;
  border: 1px solid #555;
  border-radius: 1.5rem;
  background-color: #2c2c2c;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.agent-button:hover {
  background-color: #3a3a3a;
}

.agent-button.active {
  background-color: grey;
  color: white;
  border-color: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0rem 20rem;
  background-color: #1e1e1e;
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
  max-width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  margin: 0.5rem 0rem;
  background-color: #2e2e2e;
  border: 1px solid #444;
  color: #e0e0e0;
  white-space: pre-wrap;
  position: relative;
}

.message.user .message-bubble {
  background-color: #2c2c2c;
  color: white;
  border: 1px solid #555;
}

.unified-chat-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 20rem;
  border-top: 1px solid #444;
  background-color: #2c2c2c;
  gap: 0.5rem;
}

.input-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #555;
  border-radius: 0.5rem;
  background-color: #1e1e1e;
  color: #e0e0e0;
  outline: none;
}

.chat-input::placeholder {
  color: #aaa;
}

.file-upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
  color: #e0e0e0;
}
.file-upload-icon.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.send-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: pointer;
  transition: background 0.2s;
}
.send-button:disabled {
  background: #555;
  cursor: not-allowed;
}

.file-name {
  font-size: 0.85rem;
  color: #aaa;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hidden-file-input {
  display: none;
}

.spinner {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  border: 3px solid #666;
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
