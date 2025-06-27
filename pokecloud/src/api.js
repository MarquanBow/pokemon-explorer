import axios from "axios";

const API_BASE = "https://pokemon-api-r8sq.onrender.com";

// Save a team
export async function saveTeam(teamData) {
  return axios.post(`${API_BASE}/teams/save`, teamData);
}

// Get all teams by user ID
export async function getTeams(userId) {
  const res = await axios.get(`${API_BASE}/teams/${userId}`);
  return res.data;
}
