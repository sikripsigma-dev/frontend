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
              selectedChat && selectedChat.id === chat.id
                ? 'bg-green-lighten-4'
                : 'bg-grey-lighten-3'
            ]"
          >
            <v-list-item-avatar size="36">
              <v-avatar size="36" color="grey-lighten-2">
                <template v-if="chat.avatar">
                  <v-img :src="chat.avatar" />
                </template>
                <template v-else>
                  <v-icon size="20" color="grey-darken-1">mdi-account</v-icon>
                </template>
              </v-avatar>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ chat.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-truncate">
                {{ chat.lastMessage }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <span class="text-caption text-grey">{{ chat.time }}</span>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Konten Chat -->
      <v-col cols="12" md="8" class="chat-content pa-4">
        <div class="chat-panel">
          <template v-if="selectedChat">
            <!-- Header -->
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

            <!-- Chat messages (scrollable) -->
            <div class="chat-messages">
              <div v-if="selectedChat.messages.length === 0" class="text-center mt-5 text-grey">
                Belum ada pesan
              </div>

              <div
                v-for="msg in selectedChat.messages"
                :key="msg.id"
                :class="[ 'd-flex', msg.fromMe ? 'justify-end' : 'justify-start', 'mb-2' ]"
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

            <!-- Input -->
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
import { ref, computed } from 'vue'
import { useChat } from '@/composables/useChat'
import { useMessages } from '@/composables/useMessages'

definePageMeta({
  layout: 'profile',
})

// TODO: Ganti ini nanti dengan dari auth
const studentId = '1e4d9c98-3220-4e27-ab93-2a0d2266c757'

const { chatroom, pending, error } = useChat(studentId)

const selectedChat = ref(null)
const newMessage = ref('')

// Format hasil API ke format tampilan
const chatList = computed(() =>
  (chatroom.value?.data || []).map((item) => ({
    id: item.id,
    name: item.company_name,
    avatar: null, // nanti bisa dari logo
    lastMessage: item.last_message,
    time: item.last_message_at?.slice(11, 16),
    messages: [],
  }))
)

async function selectChat(chat) {
  selectedChat.value = chat
  newMessage.value = ''

  const { messages } = useMessages(chat.id)
  await nextTick()

  const messageData = messages.value.data || []

  selectedChat.value.messages = messageData.map((msg) => ({
    id: msg.id,
    text: msg.message,
    fromMe: msg.sender_type === 'student', // Atau bandingkan dengan user.id dari auth
  }))
}


function sendMessage() {
  if (!newMessage.value.trim()) return

  selectedChat.value.messages.push({
    id: Date.now(),
    text: newMessage.value,
    fromMe: true,
  })

  selectedChat.value.lastMessage = newMessage.value
  selectedChat.value.time = new Date().toLocaleTimeString().slice(0, 5)
  newMessage.value = ''
}
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
