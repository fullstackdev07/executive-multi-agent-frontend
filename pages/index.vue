<template>
  <div class="chat-container">
    <!-- Agent Selection -->
    <div class="agent-selector">
      <div class="agent-selector-label">Executive Search Agent</div>
      <!-- <div class="agent-options">
        <button
          v-for="agent in agents"
          :key="agent.type"
          :class="['agent-button', { active: selectedAgent === agent.type }]"
          @click="handleAgentSelect(agent.type)"
        >
          {{ agent.name }}
        </button>
      </div> -->
    </div>
    <!-- Chat messages -->
    <div ref="chatContainer" class="chat-messages">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="message-bubble">
          <template v-if="message.loading">
            <span class="spinner"></span>
          </template>
          <template v-else>
            <span v-html="message.content"></span>
          </template>
        </div>
      </div>
    </div>
    <!-- Unified Chat Input and File Upload -->
    <form class="chat-input-container unified-chat-input" @submit.prevent="handleUnifiedSubmit">
      <div class="input-row">
        <input v-model="prompt" type="text" :placeholder="'Type your message...'
          " class="chat-input" :disabled="isLoading" @keydown.enter.exact.prevent="handleUnifiedSubmit" />
        <label class="file-upload-icon" :class="{ disabled: isLoading }">
          <input ref="unifiedFileInput" type="file" accept=".txt,.json,.pdf" @change="handleUnifiedFileChange"
            class="hidden-file-input" :disabled="isLoading" multiple />
          <span>
            <svg fill="white" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 48 48">
              <path d="M0 0h48v48H0z" color="white" fill="none" />
              <g id="Shopicon">
                <path
                  d="M29,4c-3.859,0-7,3.141-7,7v21h4V11c0-1.654,1.346-3,3-3s3,1.346,3,3l0,5h-0.001l0,6.919l0,9.081H32c0,4.411-3.589,8-8,8   s-7.999-3.589-7.999-8L16,10h-4l0.001,22c0,6.617,5.383,12,11.999,12c6.617,0,12-5.383,12-12l-0.001-9.081L36,11   C36,7.141,32.859,4,29,4z" />
              </g>
            </svg>
          </span>
        </label>
        <button type="submit" class="send-button" :disabled="!canSubmitUnified || isLoading">
          <span style="margin-bottom: 2px;">➤</span>
        </button>
      </div>
      <div v-if="unifiedFiles.length" class="file-name">
        {{unifiedFiles.map(f => f.name).join(', ')}}
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { chatWithAgent, createNewChat } from '../services/api'
const projectId = ref(null);
const agents = [
  { type: 'market_intelligence', name: 'Market Intelligence' },
  { type: 'jd_agenet', name: 'JD Agent' },
  { type: 'client_representative_creator_agent', name: 'Client Representative Creator' },
  { type: 'client_representative_agent', name: 'Client Representative' },
  { type: 'interview_report_agent', name: 'Interview Report' }
]
const selectedAgent = ref<string>('market_intelligence')
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
const handleAgentSelect = (agentType: string) => {
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
  payload.supporting_documents = unifiedFiles.value
  try {
    if (!projectId.value) {
      console.log('project id creating')
      const res = await createNewChat();
      console.log(res.project_id);
      projectId.value = res.project_id;
    }
    const reply: any = await chatWithAgent(projectId.value, payload)
    // Disable loading and trigger DOM update
    loadingMsg.loading = false
    if (waitMsg) {
      const idx = messages.value.indexOf(waitMsg)
      if (idx !== -1) messages.value.splice(idx, 1)
    }
    clearTimeout(waitTimer)
    await nextTick()

    // Format the response if it has output
    let formattedReply = ''
    if (reply && typeof reply === 'object' && reply.output) {
      // Title (bold)
      if (reply.output.title) {
        formattedReply += `<div class="chat-title">${reply.output.title}</div>\n\n`
      }
      // Sections (only show if content is not empty)
      if (Array.isArray(reply.output.sections)) {
        reply.output.sections.forEach((section: any, idx: number) => {
          if (section.content && section.content.trim() !== '') {
            formattedReply += `<div class="section-header">${section.header || ''}</div>\n`
            formattedReply += section.content.trim() + '\n\n'
          }
        })
      }
      // Summary (bold, with spacing)
      if (reply.output.summary) {
        formattedReply += `\nSummary:\n${reply.output.summary}\n\n`
      }
      // Next Steps (bold, with spacing)
      if (Array.isArray(reply.output.next_steps) && reply.output.next_steps.length > 0) {
        formattedReply += `\nNext Steps:\n`
        reply.output.next_steps.forEach((step: string, idx: number) => {
          formattedReply += `${idx + 1}. ${step}\n`
        })
      }
    } else if (typeof reply === 'string') {
      formattedReply = reply
    } else {
      formattedReply = 'No valid response from the agent.'
    }
    // Animate typing for the response
    loadingMsg.content = ''
    for (let i = 0; i < formattedReply.length; i++) {
      loadingMsg.content += formattedReply[i]
      // Typing speed: 2ms per character
      await new Promise(resolve => setTimeout(resolve, 2))
      await nextTick()
      chatContainer.value?.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'auto'
      })
    }
    loadingMsg.loading = false
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
const agentHelpMessages: Record<string, string> = {
  market_intelligence: `Enter a company name, a ticker symbol, or a short query about the company or market you're interested in. You can also upload supporting documents below or Upload relevant documents (PDF, TXT, JSON) like company profiles, existing reports, or news articles to provide more context.`,
  jd_agenet: `Specify the job role you want a description for (e.g., 'Software Engineer'). You can also provide a more detailed brief, a client persona to write for, or a previous market report to use as context. Supporting documents can be uploaded below or Upload relevant documents like company information, style guides, existing JD templates, or market reports (PDF, TXT, JSON) to enrich the job description.`,
  client_representative_creator_agent: `Describe the client you want to emulate. This can be a short phrase (like 'skeptical client') or a more detailed description of their persona, priorities, values, and communication style. You can also upload transcripts below for tone analysis or Upload transcripts of client conversations, emails, or other documents (PDF, TXT, JSON) that reflect the client's tone and style.`,
  client_representative_agent: `Paste the text or document you want feedback on. You can also provide guidance on the client persona to adopt for the feedback (e.g., 'Act as a detail-oriented client'). Use '---CLIENT PERSONA GUIDANCE---' and '---DOCUMENT TO REVIEW---' delimiters if providing both. Supporting files can provide additional context for the client's persona or Upload documents (PDF, TXT, JSON) that provide context about the client's persona, values, or past communications, which will help the agent emulate them accurately when giving feedback.`,
  interview_report_agent: `Provide instructions for the interview report, such as the candidate's name and role. You can also paste consultant notes or use delimiters (e.g., ---JOB SPEC---, ---CANDIDATE CV---) to structure detailed information. Upload relevant files like CVs, job specs, and interview transcripts below or Upload supporting documents: Candidate's CV/Resume, Job Specification, Interview Transcript/Notes, Role Scorecard (PDF, TXT, JSON). The agent will try to identify the type of document from its filename.`
}
</script>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html,
body {
  margin: 0;
  padding: 0;
  background-color: #121212;
  /* Or your desired background */
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1E1E1E;
  /* color: #E0E0E0; */
}
.agent-selector {
  padding: 1rem 20rem;
  background-color: #2C2C2C;
  border-bottom: 1px solid #444;
}
.agent-selector-label {
  text-align: center;
  text-transform: capitalize;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #E0E0E0;
  font-size: 32px;
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
  background-color: #2C2C2C;
  color: #E0E0E0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}
.agent-button:hover {
  background-color: #3A3A3A;
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
  background-color: #1E1E1E;
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
  background-color: #2E2E2E;
  border: 1px solid #444;
  color: #E0E0E0;
  white-space: pre-wrap;
  position: relative;
}
.message.user .message-bubble {
  background-color: #2C2C2C;
  color: white;
  border: 1px solid #555;
}
.unified-chat-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 20rem;
  border-top: 1px solid #444;
  background-color: #2C2C2C;
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
  background-color: #1E1E1E;
  color: #E0E0E0;
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
  color: #E0E0E0;
}
.file-upload-icon.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.send-button {
  background: #007BFF;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.chat-title {
  font-weight: bold;
  font-size: 1.3em;
  display: block;
}
.section-header{
  font-weight: 500;
  font-size: 1.1em;
}
</style>