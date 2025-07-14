<template>
    <v-container fluid class="pa-6 bg-grey-lighten-4 fill-height">
      <v-row justify="center">
        <v-col cols="12" md="12" lg="10" xl="8">
          <v-card elevation="8" rounded="2xl" class="pa-6" style="background: linear-gradient(135deg, #ffffff, #f3f6f9);">
            <v-card-title class="text-h5 font-weight-bold text-primary d-flex justify-space-between align-center">
              <div>
                <v-icon class="mr-2" color="primary">mdi-file-document-edit-outline</v-icon>
                {{ isEdit ? 'Edit Studi Kasus' : 'Tambah Studi Kasus' }}
              </div>
              <v-btn icon color="primary" @click="router.back()">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
            </v-card-title>
  
            <v-card-subtitle class="text-grey-darken-1 mb-4">
              Lengkapi detail studi kasus agar mudah dipahami mahasiswa.
            </v-card-subtitle>
  
            <v-divider class="mb-4" />
  
            <v-form @submit.prevent="saveCase" v-model="formValid">
              <v-row dense class="g-4">
                <v-col cols="12" class="pb-3">
                  <v-text-field
                    v-model="form.title"
                    label="Judul Studi Kasus"
                    prepend-inner-icon="mdi-book-open-variant"
                    :rules="[v => !!v || 'Judul wajib diisi']"
                    variant="outlined"
                    color="primary"
                    required
                  />
                </v-col>
  
                <v-col cols="12" md="6" class="pb-3">
                  <v-text-field
                    v-model="form.field"
                    label="Bidang"
                    prepend-inner-icon="mdi-briefcase-variant"
                    :rules="[v => !!v || 'Bidang wajib diisi']"
                    variant="outlined"
                    color="primary"
                    required
                  />
                </v-col>
  
                <v-col cols="12" md="6" class="pb-3">
                  <v-text-field
                    v-model="form.location"
                    label="Lokasi"
                    prepend-inner-icon="mdi-map-marker"
                    variant="outlined"
                    color="primary"
                  />
                </v-col>
  
                <v-col cols="12" md="6" class="pb-3">
                  <v-text-field
                    v-model="form.education_requirement"
                    label="Persyaratan Pendidikan"
                    prepend-inner-icon="mdi-school-outline"
                    variant="outlined"
                    color="primary"
                  />
                </v-col>
  
                <v-col cols="12" md="6" class="pb-3">
                  <v-text-field
                    v-model="form.duration"
                    label="Durasi"
                    prepend-inner-icon="mdi-timer-outline"
                    variant="outlined"
                    color="primary"
                  />
                </v-col>
  
                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    label="Deskripsi"
                    prepend-inner-icon="mdi-text-box-outline"
                    rows="4"
                    auto-grow
                    variant="outlined"
                    color="primary"
                  />
                </v-col>
              </v-row>
  
              <v-card-actions class="pt-4">
                <v-spacer />
                <v-btn color="grey" variant="outlined" size="large" rounded="xl" class="mr-2" @click="router.back()">
                  Batal
                </v-btn>
                <v-btn type="submit" :loading="pending" color="primary" size="large" rounded="xl" elevation="2">
                  <v-icon start>mdi-content-save</v-icon> Simpan
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useResearchCaseService } from '@/composables/useResearchCase'
  import { useDataUser } from '@/composables/useDataUser'
  
  definePageMeta({ layout: 'profile' })
  
  const route = useRoute()
  const router = useRouter()
  const { user } = useDataUser()
  const { getById, create, update } = useResearchCaseService()
  
  const id = route.query.id
  const isEdit = !!id
  const pending = ref(false)
  const formValid = ref(true)
  
  const form = ref({
    title: '',
    field: '',
    location: '',
    education_requirement: '',
    duration: '',
    description: ''
  })
  
  onMounted(async () => {
    if (isEdit) {
      pending.value = true
      const { data, error } = await getById(id)
      if (data.value) {
        Object.assign(form.value, data.value.research_case)
      } else if (error.value) {
        console.error('Gagal fetch data:', error.value)
        router.push('/profile/cases')
      }
      pending.value = false
    }
  })
  
  const saveCase = async () => {
    if (!formValid.value) return
    pending.value = true
  
    try {
      if (isEdit) {
        await update(id, form.value)
      } else {
        await create({
          ...form.value,
          company_id: user.value.user.company.id
        })
      }
      router.push('/profile/cases')
    } catch (e) {
      console.error('Gagal simpan:', e)
    } finally {
      pending.value = false
    }
  }
  </script>
  