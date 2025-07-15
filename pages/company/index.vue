<template>
    <v-container class="py-8">
      <!-- Hero Section -->
      <v-row class="mb-8" justify="center">
        <v-col cols="12" md="10" lg="8" class="text-center">
          <h1 class="text-h3 font-weight-bold mb-4 primary--text">Temukan Perusahaan Terbaik</h1>
          <p class="text-h6 font-weight-regular text-grey-darken-1 mb-6">
            Jelajahi jaringan mitra terpercaya kami dengan rating dan ulasan terverifikasi
          </p>
          <v-text-field
            v-model="search"
            outlined
            placeholder="Search companies..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="mx-auto"
            style="max-width: 600px;"
          ></v-text-field>
        </v-col>
      </v-row>
  
      <!-- Filter Chips -->
      <v-row class="mb-6" justify="center">
        <v-col cols="12" class="d-flex flex-wrap justify-center">
          <v-chip
            v-for="(filter, index) in filters"
            :key="index"
            class="ma-1"
            :color="activeFilter === index ? 'primary' : ''"
            :text-color="activeFilter === index ? 'white' : ''"
            @click="activeFilter = index"
          >
            {{ filter.label }}
          </v-chip>
        </v-col>
      </v-row>
  
      <!-- Companies List -->
      <v-row>
        <v-col
          v-for="(company, index) in filteredCompanies"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            hover
            class="h-100 d-flex flex-column"
            @click="viewCompany(company.id)"
          >
            <v-img
              :src="company.image"
              height="160"
              cover
              gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3)"
            >
              <v-chip
                small
                class="ma-2"
                color="white"
                text-color="primary"
                v-if="company.featured"
              >
                <v-icon small left>mdi-star</v-icon>
                Featured
              </v-chip>
            </v-img>
  
            <v-card-title class="text-h6 font-weight-medium">
              {{ company.name }}
            </v-card-title>
  
            <v-card-subtitle class="d-flex align-center">
              <v-icon small color="grey" class="mr-1">mdi-map-marker-outline</v-icon>
              {{ company.location }}
            </v-card-subtitle>
  
            <v-card-text class="flex-grow-1">
              <div class="d-flex align-center mb-2">
                <v-rating
                  v-model="company.rating"
                  color="amber"
                  dense
                  half-increments
                  readonly
                  size="18"
                ></v-rating>
                <span class="text-caption text-grey ml-1">
                  ({{ company.reviews }} reviews)
                </span>
              </div>
              <p class="text-body-2 text-truncate-2">
                {{ company.description }}
              </p>
            </v-card-text>
  
            <v-card-actions class="px-4 pb-4">
              <v-btn
                color="primary"
                small
                text
                @click.stop="viewCompany(company.id)"
              >
                View Details
              </v-btn>
              <v-spacer></v-spacer>
              <v-chip small :color="getIndustryColor(company.industry)">
                {{ company.industry }}
              </v-chip>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Pagination -->
      <v-row class="mt-8" justify="center">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="Math.ceil(filteredCompanies.length / itemsPerPage)"
            circle
            color="primary"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        search: '',
        page: 1,
        itemsPerPage: 8,
        activeFilter: 0,
        filters: [
          { label: 'All', value: 'all' },
          { label: 'Technology', value: 'Technology' },
          { label: 'Finance', value: 'Finance' },
          { label: 'Healthcare', value: 'Healthcare' },
          { label: 'Education', value: 'Education' },
          { label: 'Manufacturing', value: 'Manufacturing' },
        ],
        companies: [
          {
            id: 1,
            name: 'TechVista Solutions',
            image: 'https://source.unsplash.com/random/300x200/?tech,office',
            location: 'San Francisco, CA',
            rating: 4.5,
            reviews: 128,
            industry: 'Technology',
            description: 'Leading provider of innovative tech solutions for modern businesses.',
            featured: true
          },
          {
            id: 2,
            name: 'GreenLeaf Agriculture',
            image: 'https://source.unsplash.com/random/300x200/?agriculture',
            location: 'Denver, CO',
            rating: 4.2,
            reviews: 86,
            industry: 'Agriculture',
            description: 'Sustainable farming solutions for the 21st century.',
            featured: false
          },
          {
            id: 3,
            name: 'UrbanSpace Architects',
            image: 'https://source.unsplash.com/random/300x200/?architecture',
            location: 'New York, NY',
            rating: 4.7,
            reviews: 215,
            industry: 'Construction',
            description: 'Designing the urban landscapes of tomorrow.',
            featured: true
          },
          {
            id: 4,
            name: 'MediCare Plus',
            image: 'https://source.unsplash.com/random/300x200/?hospital',
            location: 'Boston, MA',
            rating: 4.8,
            reviews: 342,
            industry: 'Healthcare',
            description: 'Comprehensive healthcare services for all ages.',
            featured: false
          },
          {
            id: 5,
            name: 'EduFuture Academy',
            image: 'https://source.unsplash.com/random/300x200/?school',
            location: 'Chicago, IL',
            rating: 4.3,
            reviews: 176,
            industry: 'Education',
            description: 'Innovative learning solutions for students worldwide.',
            featured: false
          },
          {
            id: 6,
            name: 'BlueOcean Finance',
            image: 'https://source.unsplash.com/random/300x200/?finance',
            location: 'Charlotte, NC',
            rating: 4.1,
            reviews: 92,
            industry: 'Finance',
            description: 'Personalized financial solutions for your future.',
            featured: false
          },
          {
            id: 7,
            name: 'Precision Manufacturing',
            image: 'https://source.unsplash.com/random/300x200/?factory',
            location: 'Detroit, MI',
            rating: 4.0,
            reviews: 64,
            industry: 'Manufacturing',
            description: 'High-quality manufacturing with precision engineering.',
            featured: false
          },
          {
            id: 8,
            name: 'DataSphere Analytics',
            image: 'https://source.unsplash.com/random/300x200/?data',
            location: 'Austin, TX',
            rating: 4.6,
            reviews: 153,
            industry: 'Technology',
            description: 'Transforming data into actionable insights.',
            featured: true
          },
        ]
      }
    },
    computed: {
      filteredCompanies() {
        let filtered = this.companies;
        
        // Apply search filter
        if (this.search) {
        const searchTerm = this.search.toLowerCase();
        filtered = filtered.filter(company => 
            company.name.toLowerCase().includes(searchTerm) || 
            company.description.toLowerCase().includes(searchTerm) ||
            company.industry.toLowerCase().includes(searchTerm)
        );  // Added missing closing parenthesis here
        }
        
        // Apply category filter
        if (this.activeFilter > 0) {
          const filterValue = this.filters[this.activeFilter].value;
          filtered = filtered.filter(company => company.industry === filterValue);
        }
        
        return filtered;
      },
      paginatedCompanies() {
        const start = (this.page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredCompanies.slice(start, end);
      }
    },
    methods: {
      viewCompany(id) {
        // In a real app, this would navigate to company detail page
        console.log(`Viewing company with ID: ${id}`);
      },
      getIndustryColor(industry) {
        const colors = {
          'Technology': 'blue lighten-4',
          'Finance': 'green lighten-4',
          'Healthcare': 'red lighten-4',
          'Education': 'amber lighten-4',
          'Manufacturing': 'indigo lighten-4',
          'Agriculture': 'light-green lighten-4',
          'Construction': 'deep-orange lighten-4'
        };
        return colors[industry] || 'grey lighten-3';
      }
    }
  }
  </script>
  
  <style scoped>
  .text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .h-100 {
    height: 100%;
  }
  
  .v-card {
    transition: all 0.3s ease;
  }
  
  .v-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
  }
  
  .primary--text {
    color: #1976D2 !important;
  }
  </style>