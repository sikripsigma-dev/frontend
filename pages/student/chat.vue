<template>
  <v-container class="chat-container">
    <v-row>
      <!-- Sidebar Kontak -->
      <v-col cols="12" md="3" class="contacts">
        <v-card class="pa-4 rounded-lg elevation-3">
          <v-text-field v-model="search" label="Cari Perusahaan" dense outlined prepend-inner-icon="mdi-magnify" />
          <v-divider class="my-3" />
          <v-list nav dense>
            <v-list-item v-for="contact in filteredContacts" :key="contact.id" @click="selectChat(contact)" class="contact-item">
              <v-list-item-avatar>
                <v-img :src="contact.avatar" v-if="contact.avatar" />
                <v-icon v-else>mdi-domain</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ contact.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ contact.lastMessage }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <!-- Chat Area -->
      <v-col cols="12" md="9" class="chat-area">
        <v-card class="chat-box pa-4 rounded-lg elevation-3">
          <v-toolbar flat dense>
            <v-avatar>
              <v-img :src="selectedChat?.avatar" v-if="selectedChat?.avatar" />
              <v-icon v-else>mdi-domain</v-icon>
            </v-avatar>
            <v-toolbar-title class="ml-3">{{ selectedChat?.name || 'Pilih Perusahaan' }}</v-toolbar-title>
          </v-toolbar>
          <v-divider />

          <v-sheet class="messages" ref="messagesContainer">
            <div v-for="message in selectedChat?.messages" :key="message.id" :class="['message', message.sender === 'student' ? 'sent' : 'received']">
              <span>{{ message.text }}</span>
            </div>
          </v-sheet>

          <v-divider />
          <v-text-field v-model="newMessage" label="Ketik pesan..." dense outlined append-inner-icon="mdi-send" @click:append-inner="sendMessage" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

definePageMeta({
  layout: "student",
});


const search = ref('');
const newMessage = ref('');
const messagesContainer = ref(null);
const selectedChat = ref(null);

const contacts = ref([
  { id: 1, name: 'Tech Corp', avatar: '', lastMessage: 'Terima kasih atas proposal Anda.', messages: [] },
  { id: 2, name: 'Data Science Ltd.', avatar: '', lastMessage: 'Kami akan menghubungi Anda segera.', messages: [] },
]);

const filteredContacts = computed(() => {
  return contacts.value.filter(contact => contact.name.toLowerCase().includes(search.value.toLowerCase()));
});

const selectChat = (contact) => {
  selectedChat.value = contact;
};

const sendMessage = () => {
  if (newMessage.value.trim() === '' || !selectedChat.value) return;
  
  selectedChat.value.messages.push({ id: Date.now(), text: newMessage.value, sender: 'student' });
  newMessage.value = '';
  
  nextTick(() => {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  });
};
</script>

<style scoped>
.chat-container {
  margin-top: 16px;
}
.contacts {
  height: 100vh;
  overflow-y: auto;
}
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.message {
  padding: 10px;
  border-radius: 8px;
  margin: 5px 0;
  max-width: 75%;
}
.sent {
  align-self: flex-end;
  background-color: #4caf50;
  color: white;
}
.received {
  align-self: flex-start;
  background-color: #f1f1f1;
}
</style>
