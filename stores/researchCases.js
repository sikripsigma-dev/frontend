import { defineStore } from "pinia";
import axios from "axios";
import debounce from "lodash/debounce";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useResearchCasesStore = defineStore("researchCases", {
  state: () => ({
    researchCases: [],
    selectedCompany: null,
    selectedLocation: "Semua Lokasi",
    loading: false,
    error: null,
  }),
  actions: {
    async fetchResearchCases() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/research-cases`);

        // Filter berdasarkan lokasi
        const filteredData =
          !this.selectedLocation || this.selectedLocation === "Semua Lokasi"
            ? response.data.data
            : response.data.data.filter((researchCase) =>
                researchCase.location
                  .toLowerCase()
                  .includes(this.selectedLocation.toLowerCase())
              );

        // Tampilkan data awal (misalnya 10 item pertama)
        this.researchCases = filteredData.slice(0, 10);

        // Tambahkan sisanya setelah 500ms untuk mencegah flickering
        setTimeout(() => {
          this.researchCases = filteredData; // Menampilkan semua data yang difilter
        }, 500);
        
      } catch (err) {
        this.error = "Failed to fetch research cases";
      } finally {
        this.loading = false;
      }
    },

    setLocationFilter: debounce(function (location) {
      this.selectedLocation = location;
      this.fetchResearchCases();
    }, 300),

    selectCompany: debounce(function (company) {
      this.selectedCompany = company;
    }, 200),
  },
});
