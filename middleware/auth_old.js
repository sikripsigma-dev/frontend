import axios from "axios";

const API_URL = "http://localhost:3001/api";

export async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });

    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Login failed";
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export async function getUser() {
  try {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await axios.get(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    return response.data.user;
  } catch (error) {
    logout();
    return null;
  }
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false; // Pastikan berjalan di client-side

  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
    return payload.exp * 1000 > Date.now(); // Cek apakah token masih berlaku
  } catch (error) {
    return false; // Jika terjadi error saat parsing, anggap tidak autentikasi
  }
}

