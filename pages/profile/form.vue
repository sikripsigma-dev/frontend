<template>
    <v-container fluid class="pa-4 bg-grey-lighten-5 fill-height">
      <v-row no-gutters class="fill-height">
        <v-col
          cols="12"
          class="mx-auto px-4 py-6"
          style="width: 100%; max-width: 960px; box-sizing: border-box;"
        >
          <v-card elevation="2" rounded="lg" class="pa-4">
            <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center mb-2">
              <span>📝 Tambah Studi Kasus</span>
            </v-card-title>
  
            <v-divider class="mb-4" />
  
            <v-form @submit.prevent="submitForm" ref="formRef">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.title"
                    label="Judul Studi Kasus"
                    prepend-inner-icon="mdi-file-document-outline"
                    required
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.field"
                    label="Bidang Studi"
                    prepend-inner-icon="mdi-domain"
                    required
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.education_requirement"
                    label="Kualifikasi Pendidikan"
                    prepend-inner-icon="mdi-school-outline"
                  />
                </v-col>
  
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.duration"
                    label="Durasi Studi Kasus (contoh: 3 bulan)"
                    prepend-inner-icon="mdi-calendar-clock"
                  />
                </v-col>
  
                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    label="Deskripsi Studi Kasus"
                    prepend-inner-icon="mdi-text"
                    auto-grow
                    rows="3"
                    required
                  />
                </v-col>
  
                <v-col cols="12">
                  <v-select
                    v-model="form.tag_ids"
                    :items="availableTags"
                    label="Tag Terkait"
                    multiple
                    chips
                    clearable
                    item-title="label"
                    item-value="value"
                    prepend-inner-icon="mdi-tag-multiple"
                  />
                </v-col>
              </v-row>
  
              <v-divider class="my-4" />
  
              <v-btn type="submit" color="primary" size="large">
                <v-icon start>mdi-content-save</v-icon>
                Simpan Studi Kasus
              </v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  definePageMeta({
    layout: 'profile',
  })
  
  const formRef = ref(null)
  
  const form = ref({
    title: '',
    field: '',
    education_requirement: '',
    duration: '',
    description: '',
    tag_ids: [],
  })
  
  const availableTags = [
    { label: 'Data Science', value: 'data-science' },
    { label: 'Machine Learning', value: 'ml' },
    { label: 'Keuangan', value: 'finance' },
    { label: 'Kesehatan', value: 'health' },
  ]
  
  const submitForm = () => {
    if (!form.value.title || !form.value.field || !form.value.description) {
      alert('Harap lengkapi semua field wajib.')
      return
    }
  
    console.log('Form terkirim:', form.value)
  
    // TODO: Kirim ke API jika sudah siap
    // await $fetch('/api/cases', { method: 'POST', body: form.value })
  
    // Reset form atau redirect
  }
  </script>
  
  <style scoped>
  .fill-height {
    height: 100vh;
  }
  </style>
  