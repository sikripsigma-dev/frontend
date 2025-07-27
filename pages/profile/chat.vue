<template>
  <v-card class="chat-wrapper rounded-xl elevation-3 conten-card">
    <v-row no-gutters class="rounded-xl fill-height" style="overflow: hidden;">
      <!-- Sidebar Chat -->
      <v-col cols="12" md="4" class="chat-sidebar pa-4">
        <div class="d-flex align-center justify-space-between">
          <v-card-title class="text-h6 font-weight-bold pl-0">Daftar Chat</v-card-title>
          <v-btn icon variant="text" @click="refreshChatList">
            <v-icon>mdi-refresh</v-icon>
            <v-tooltip activator="parent" location="bottom">Refresh</v-tooltip>
          </v-btn>
        </div>
        <v-divider class="mb-4" />
        
        <v-progress-linear indeterminate color="green" v-if="pending" />
        <v-alert v-else-if="chatList.length === 0" type="info" variant="tonal" class="mb-4">
          Belum ada percakapan
        </v-alert>

        <v-list nav dense class="chat-list" v-else>
          <v-list-item
            v-for="chat in chatList"
            :key="chat.id"
            @click="selectChat(chat)"
            :class="[
              'rounded-lg mb-2 pa-2',
              selectedChat?.id === chat.id ? 'bg-teal-lighten-5' : 'bg-grey-lighten-3'
            ]"
          >
            <!-- <v-list-item-avatar size="36">
              <v-avatar size="36" color="grey-lighten-2">
                <template v-if="chat.avatar">
                  <v-img :src="chat.avatar" />
                </template>
                <template v-else>
                  <v-icon size="20" color="grey-darken-1">mdi-domain</v-icon>
                </template>
              </v-avatar>
            </v-list-item-avatar> -->

            <v-list-item-avatar size="36">
              <v-avatar size="36" color="grey-lighten-2">
                <template v-if="chat.image">
                  <v-img :src="`${config.public.apiBase}${chat.image}`" />
                </template>
                <template v-else>
                  <v-icon size="20" color="grey-darken-1">
                    {{ chat.withType === 'company' ? 'mdi-domain' : 'mdi-account' }}
                  </v-icon>
                </template>
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="d-flex flex-column">
                <div class="d-flex align-center">
                  {{ getChatName(chat) }}
                  <v-badge
                    v-if="chat.unreadCount > 0"
                    :content="chat.unreadCount"
                    color="green-darken-2"
                    inline
                    class="ml-2"
                    size="small"
                  />
                </div>
                <v-chip
                  size="x-small"
                  class="mt-1"
                  color="green-darken-2"
                  variant="outlined"
                  label
                  style="width: fit-content;"
                >
                  {{ formatTypeLabel(chat.withType) }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle class="text-truncate">
                {{ chat.lastMessage }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action class="d-flex flex-column align-end">
              <span class="text-caption text-grey mb-1">{{ formatTime(chat.time) }}</span>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Chat Content -->
      <v-col cols="12" md="8" class="chat-content pa-4">
        <div class="chat-panel">
          <template v-if="selectedChat">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar class="mr-3">
                  <template v-if="selectedChat.image">
                    <v-img :src="`${config.public.apiBase}${selectedChat.image}`" />
                  </template>
                  <template v-else>
                    <v-icon size="28">
                      {{ selectedChat.withType === 'company' ? 'mdi-domain' : 'mdi-account' }}
                    </v-icon>
                  </template>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-medium">{{ getChatName(selectedChat) }}</div>
                  <!-- <div class="text-caption text-success">
                    <v-icon small>mdi-circle</v-icon>
                    <span class="ml-1">{{ connectionStatus }}</span>
                  </div> -->
                </div>
              </div>
              <v-btn icon variant="text" @click="showChatInfo">
                <v-icon>mdi-information</v-icon>
                <v-tooltip activator="parent" location="bottom">Info Percakapan</v-tooltip>
              </v-btn>
            </v-card-title>

            <v-divider />

            <div class="chat-messages" ref="messagesContainer">
              <div v-if="selectedChat.messages.length === 0" class="text-center mt-5 text-grey">
                Belum ada pesan
              </div>

              <div
                v-for="msg in selectedChat.messages"
                :key="msg.id"
                :class="['d-flex', msg.fromMe ? 'justify-end' : 'justify-start', 'mb-2']"
              >
                <v-card
                  :color="msg.fromMe ? 'green-darken-2' : 'grey lighten-2'"
                  :class="['pa-3', msg.fromMe ? 'text-white' : 'text-black']"
                  flat
                  rounded="lg"
                >
                  <div>{{ msg.text }}</div>
                  <div class="text-right text-caption mt-1" :class="msg.fromMe ? 'text-white' : 'text-grey'">
                    {{ formatMessageTime(msg.timestamp) }}
                    <v-icon v-if="msg.fromMe && msg.isRead" small class="ml-1">mdi-check-all</v-icon>
                    <v-icon v-else-if="msg.fromMe" small class="ml-1">mdi-check</v-icon>
                  </div>
                </v-card>
              </div>
            </div>

            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>
                <v-text-field
                  v-model="newMessage"
                  label="Tulis pesan..."
                  density="comfortable"
                  hide-details
                  variant="outlined"
                  @keydown.enter="sendMessage"
                  :loading="sending"
                  :disabled="!isConnected"
                >
                  <template #append-inner>
                    <v-btn icon variant="text" @click="attachFile">
                      <v-icon>mdi-paperclip</v-icon>
                      <v-tooltip activator="parent" location="top">Lampirkan file</v-tooltip>
                    </v-btn>
                  </template>
                </v-text-field>
                <input type="file" ref="fileInput" style="display: none" @change="handleFileUpload">
              </v-col>
              <v-col cols="auto">
                <v-btn 
                  color="green-darken-2" 
                  @click="sendMessage"
                  :loading="sending"
                  :disabled="!newMessage.trim() || !isConnected"
                >
                  Kirim
                </v-btn>
              </v-col>
            </v-row>
          </template>

          <template v-else>
            <div class="empty-chat d-flex flex-column align-center justify-center">
              <v-icon size="48" color="grey">mdi-chat-outline</v-icon>
              <div class="text-subtitle-1 mt-2 text-grey">Pilih percakapan untuk memulai</div>
              <v-btn color="green-darken-2" class="mt-4" @click="startNewChat" v-if="canStartNewChat">
                Mulai Percakapan Baru
              </v-btn>
            </div>
          </template>
        </div>
      </v-col>
    </v-row>

    <!-- Chat Info Dialog -->
    <v-dialog v-model="infoDialog" max-width="500">
      <v-card v-if="selectedChat">
        <v-card-title>Info Percakapan</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Nama</v-list-item-title>
              <v-list-item-subtitle>{{ getChatName(selectedChat) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Percakapan dimulai</v-list-item-title>
              <v-list-item-subtitle>{{ formatFullDate(selectedChat.createdAt) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Pesan terakhir</v-list-item-title>
              <v-list-item-subtitle>{{ formatFullDate(selectedChat.time) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted, onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import { useMessages } from '@/composables/useMessages'
import { useAuth } from '@/composables/useAuth'
import { useRuntimeConfig } from '#imports'

definePageMeta({
  layout: 'profile',
})

const config = useRuntimeConfig()
const { user } = useAuth()
const role = computed(() => {
  switch(user.value?.role) {
    case 4: return 'supervisor'
    case 3: return 'student'
    case 2: return 'company'
    case 1: return 'admin'
    default: return 'unknown'
  }
})

const userId = computed(() => {
  switch(role.value) {
    case 'student': return user.value.id
    case 'company': return user.value.company?.id || ''
    case 'supervisor': return user.value.id
    default: return ''
  }
})

const { chatroom, pending, refresh } = useChat(userId.value, role.value)
const messagesContainer = ref(null)
const fileInput = ref(null)
const sending = ref(false)
const infoDialog = ref(false)

const chatList = ref([])
const selectedChat = ref(null)
const newMessage = ref('')
const isConnected = ref(false)
let socket = null

const canStartNewChat = computed(() => {
  return ['student', 'supervisor'].includes(role.value)
})

// Format time to HH:MM
const formatTime = (timeString) => {
  if (!timeString) return ''
  return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Format message timestamp
const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatTypeLabel = (type) => {
  switch (type) {
    case 'company': return 'Perusahaan'
    case 'student': return 'Mahasiswa'
    case 'supervisor': return 'Dosen Pembimbing'
    default: return 'Pengguna'
  }
}

// Format full date
const formatFullDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const connectionStatus = computed(() => {
  return isConnected.value ? 'Online' : 'Offline'
})

const getChatName = (chat) => {
  return chat.withName || 'Percakapan'
}

watch(() => chatroom.value?.data, (data) => {
  chatList.value = (data || []).map(item => ({
    id: item.id,
    image: item.Image,
    lastMessage: item.last_message,
    time: item.last_message_at,
    unreadCount: item.unread_count,
    createdAt: item.created_at,
    withName: item.with_name,
    withType: item.with_type,
    messages: [],
  }))
}, { immediate: true })

async function refreshChatList() {
  await refresh()
}

async function selectChat(chat) {
  selectedChat.value = chat
  newMessage.value = ''
  sending.value = false

  const { messages } = useMessages(chat.id)
  await nextTick()

  const data = messages.value.data || []
  selectedChat.value.messages = data.map(m => ({
    id: m.id,
    text: m.message,
    fromMe: m.sender_type === role.value,
    timestamp: m.created_at,
    isRead: m.is_read
  }))

  connectWebSocket(chat.id)
  scrollToBottom()
}

function connectWebSocket(roomId) {
  if (socket) socket.close()
  
  isConnected.value = false
  socket = new WebSocket(`ws://localhost:3001/ws/${roomId}`)

  socket.onopen = () => {
    console.log('🟢 WebSocket connected')
    isConnected.value = true

    if (selectedChat.value) {
      socket.send(JSON.stringify({
        action: 'mark_read',
        sender_id: user.value.id,
        sender_type: role.value,
      }))
    }
  }

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data)

    if (data.type === 'new_message') {
      if (selectedChat.value && data.room_id === selectedChat.value.id) {
        selectedChat.value.messages.push({
          id: data.id,
          text: data.message,
          fromMe: data.sender_type === role.value,
          timestamp: data.created_at,
          isRead: data.is_read
        })
        selectedChat.value.lastMessage = data.message
        selectedChat.value.time = data.created_at
        scrollToBottom()
      }

      const chat = chatList.value.find(c => c.id === data.room_id)
      if (chat) {
        chat.lastMessage = data.message
        chat.time = data.created_at
        if (!(selectedChat.value && data.room_id === selectedChat.value.id)) {
          chat.unreadCount = (chat.unreadCount || 0) + 1
        }
      }
    }

    if (data.type === 'read_update') {
      const chat = chatList.value.find(c => c.id === data.room_id)
      if (chat) {
        chat.unreadCount = data.unread_count
      }
    }
  }

  socket.onclose = () => {
    console.log('🔌 WebSocket disconnected')
    isConnected.value = false
  }
  
  socket.onerror = (e) => {
    console.error('Socket error:', e)
    isConnected.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  if (!newMessage.value.trim() || !socket || socket.readyState !== WebSocket.OPEN) return
  
  sending.value = true
  try {
    socket.send(JSON.stringify({
      sender_id: user.value.id,
      sender_type: role.value,
      message: newMessage.value,
    }))
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

function attachFile() {
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Here you would typically upload the file and send the link via chat
  console.log('File selected:', file.name)
  // Reset file input
  event.target.value = ''
}

function showChatInfo() {
  infoDialog.value = true
}

function startNewChat() {
  // Implement logic to start new chat
  console.log('Starting new chat...')
}

onMounted(() => {
  // Auto-select first chat if available
  if (chatList.value.length > 0) {
    selectChat(chatList.value[0])
  }
})

onUnmounted(() => {
  if (socket) socket.close()
})
</script>

<style scoped>
.chat-wrapper {
  height: calc(100vh - 48px);
  padding: 24px;
  border-radius: 12px;
}
.chat-sidebar,
.chat-content {
  height: 100%;
  overflow: hidden;
  background-color: #f4f6f8;
}
.chat-list {
  height: calc(100% - 56px - 16px);
  overflow-y: auto;
  scrollbar-width: thin;
}
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  scrollbar-width: thin;
}
.empty-chat {
  height: 100%;
  color: #757575;
}
</style>