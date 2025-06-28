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

// DELETE
export async function deleteTeam(userId, teamId) {
  return axios.delete(`${API_BASE}/teams/${userId}/${teamId}`);
}

// PUT (edit)
export async function updateTeam(userId, teamId, updatedFields) {
  return axios.put(`${API_BASE}/teams/${userId}/${teamId}`, updatedFields);
}
