<template>
  <v-card class="chat-wrapper rounded-xl elevation-3 conten-card">
    <v-row no-gutters class="rounded-xl fill-height" style="overflow: hidden;">
      
      <!-- Sidebar Chat -->
      <v-col cols="12" md="4" class="chat-sidebar pa-4">
        <v-card-title class="text-h6 font-weight-bold mb-2">Daftar Chat</v-card-title>
        <v-divider class="mb-4" />
        <v-progress-linear indeterminate color="green" v-if="pending" />

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
            <v-list-item-avatar size="36">
              <v-avatar size="36" color="grey-lighten-2">
                <template v-if="chat.avatar">
                  <v-img :src="chat.avatar" />
                </template>
                <template v-else>
                  <v-icon size="20" color="grey-darken-1">mdi-domain</v-icon>
                </template>
              </v-avatar>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="d-flex align-center">
                {{ chat.name }}
                <v-badge
                  v-if="chat.unreadCount > 0"
                  :content="chat.unreadCount"
                  color="green-darken-2"
                  inline
                  class="ml-2"
                  size="small"
                />
              </v-list-item-title>
              <v-list-item-subtitle class="text-truncate">
                {{ chat.lastMessage }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action class="d-flex flex-column align-end">
              <span class="text-caption text-grey mb-1">{{ chat.time }}</span>
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
                  <v-img :src="selectedChat.avatar" />
                </v-avatar>
                <span class="text-h6 font-weight-medium">{{ selectedChat.name }}</span>
              </div>
              <span class="text-caption text-grey">{{ selectedChat.time }}</span>
            </v-card-title>

            <v-divider />

            <div class="chat-messages">
              <div v-if="selectedChat.messages.length === 0" class="text-center mt-5 text-grey">
                Belum ada pesan
              </div>

              <div
                v-for="msg in selectedChat.messages"
                :key="msg.id"
                :class="['d-flex', msg.fromMe ? 'justify-end' : 'justify-start', 'mb-2']"
              >
                <v-chip
                  :color="msg.fromMe ? 'green-darken-2' : 'grey lighten-2'"
                  :text-color="msg.fromMe ? 'white' : 'black'"
                  class="pa-3"
                >
                  {{ msg.text }}
                </v-chip>
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
                />
              </v-col>
              <v-col cols="auto">
                <v-btn color="green-darken-2" @click="sendMessage">Kirim</v-btn>
              </v-col>
            </v-row>
          </template>

          <template v-else>
            <div class="empty-chat d-flex flex-column align-center justify-center">
              <v-icon size="48">mdi-chat</v-icon>
              <div class="text-subtitle-1 mt-2">Pilih percakapan untuk memulai</div>
            </div>
          </template>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useChat } from '@/composables/useChat'
import { useMessages } from '@/composables/useMessages'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
    layout: 'profile',
  })

const { user } = useAuth()
const role = user.value?.role === 3 ? 'student' : 'company'
const userId = computed(() => role === 'student' ? user.value.id : user.value.company?.id || '')

const { chatroom, pending } = useChat(userId.value, role)

const chatList = ref([])
const selectedChat = ref(null)
const newMessage = ref('')
let socket = null

watch(() => chatroom.value?.data, (data) => {
  chatList.value = (data || []).map(item => ({
    id: item.id,
    name: item.company_name,
    lastMessage: item.last_message,
    time: item.last_message_at?.slice(11, 16),
    unreadCount: item.unread_count,
    messages: [],
  }))
}, { immediate: true })

async function selectChat(chat) {
  selectedChat.value = chat
  newMessage.value = ''

  const { messages } = useMessages(chat.id)
  await nextTick()

  const data = messages.value.data || []
  selectedChat.value.messages = data.map(m => ({
    id: m.id,
    text: m.message,
    fromMe: m.sender_type === role,
  }))

  connectWebSocket(chat.id)

  // Kirim sinyal mark_read ke BE
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      action: 'mark_read',
      sender_id: user.value.id,
      sender_type: role,
    }))
  }
}

function connectWebSocket(roomId) {
  if (socket) socket.close()
  socket = new WebSocket(`ws://localhost:3001/ws/${roomId}`)

  socket.onopen = () => {
    console.log('🟢 WebSocket connected')

    if (selectedChat.value) {
      socket.send(JSON.stringify({
        action: 'mark_read',
        sender_id: user.value.id,
        sender_type: role,
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
          fromMe: data.sender_type === role,
        })
        selectedChat.value.lastMessage = data.message
        selectedChat.value.time = new Date(data.created_at).toLocaleTimeString().slice(0,5)
      }

      const chat = chatList.value.find(c => c.id === data.room_id)
      if (chat) {
        chat.lastMessage = data.message
        chat.time = new Date(data.created_at).toLocaleTimeString().slice(0,5)
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

  socket.onclose = () => console.log('🔌 WebSocket disconnected')
  socket.onerror = (e) => console.error('Socket error:', e)
}

function sendMessage() {
  if (!newMessage.value.trim() || !socket || socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify({
    sender_id: user.value.id,
    sender_type: role,
    message: newMessage.value,
  }))
  newMessage.value = ''
}

onUnmounted(() => {
  if (socket) socket.close()
})
</script>

<style scoped>
.chat-wrapper {
  height: 100vh;
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
}
.empty-chat {
  height: 100%;
}
</style>
