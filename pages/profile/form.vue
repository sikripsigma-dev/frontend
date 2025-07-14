<template>
  <v-container class="py-4 px-6">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon color="primary" size="40" class="mr-3">mdi-calendar-week</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">Laporan Mingguan</h1>
            <p class="text-subtitle-1 text-grey-darken-1 mb-0">
              Isi perkembangan mingguan Anda dan bagaimana perasaan Anda
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Progress Card -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card elevation="2" rounded="lg">
          <v-card-text class="pa-6">
            <!-- Week Selection -->
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentWeek"
                  :items="weeks"
                  label="Minggu Ke-"
                  outlined
                  dense
                  prepend-icon="mdi-numeric"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dateRange"
                  label="Rentang Tanggal"
                  outlined
                  dense
                  readonly
                  prepend-icon="mdi-calendar-range"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Progress Input -->
            <v-textarea
              v-model="progressReport"
              outlined
              label="Apa yang sudah Anda capai minggu ini?"
              placeholder="Jelaskan pencapaian, tantangan, dan solusi yang Anda temukan..."
              rows="5"
              counter
              maxlength="1000"
              class="mt-2"
            ></v-textarea>

            <!-- Mood Rating -->
            <v-card-title class="d-flex align-center pl-0 pt-4">
              <v-icon left>mdi-emoticon-outline</v-icon>
              <span class="text-h6">Kondisi Minggu Ini</span>
            </v-card-title>
            <div class="mb-4">
              <v-rating
                v-model="moodRating"
                color="amber"
                background-color="grey lighten-1"
                size="40"
                half-increments
                class="justify-center"
              ></v-rating>
              <p class="text-body-1 mt-3 text-center">
                {{ moodDescription }}
              </p>
            </div>

            <!-- Next Week Plan -->
            <v-textarea
              v-model="nextWeekPlan"
              outlined
              label="Rencana Minggu Depan"
              placeholder="Apa target Anda untuk minggu depan?"
              rows="3"
              counter
              maxlength="500"
              class="mt-2"
            ></v-textarea>

            <!-- Action Buttons -->
            <div class="d-flex justify-end mt-4">
              <v-btn color="grey lighten-1" text class="mr-3">
                Reset
              </v-btn>
              <v-btn color="primary" depressed>
                <v-icon left>mdi-content-save</v-icon>
                Simpan Laporan
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      currentWeek: 1,
      weeks: Array.from({ length: 16 }, (_, i) => i + 1),
      progressReport: '',
      moodRating: 3.5,
      nextWeekPlan: '',
      moodDescriptions: [
        "Sangat tidak nyaman dengan banyak kendala",
        "Beberapa tantangan yang signifikan",
        "Cukup nyaman dengan beberapa kendala kecil",
        "Baik dengan pencapaian memuaskan",
        "Sangat baik dengan banyak kemajuan"
      ]
    }
  },
  computed: {
    dateRange() {
      // Example calculation - adjust based on your academic calendar
      const startDate = new Date(2023, 7, 28) // August 28, 2023
      startDate.setDate(startDate.getDate() + (this.currentWeek - 1) * 7)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      
      const options = { day: 'numeric', month: 'long' }
      return `${startDate.toLocaleDateString('id-ID', options)} - ${endDate.toLocaleDateString('id-ID', options)}`
    },
    moodDescription() {
      const index = Math.floor(this.moodRating) - 1
      return this.moodDescriptions[Math.max(0, Math.min(index, 4))]
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.1) !important;
}
</style>