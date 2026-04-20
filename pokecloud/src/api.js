import axios from "axios";

const API_BASE = "https://pokemon-api-r8sq.onrender.com";

export async function saveTeam(teamData) {
  return axios.post(`${API_BASE}/teams/save`, teamData);
}

// Returns full axios response so callers can do res.data
export async function getTeams(userId) {
  return axios.get(`${API_BASE}/teams/${userId}`);
}

export async function deleteTeam(userId, teamId) {
  return axios.delete(`${API_BASE}/teams/${userId}/${teamId}`);
}

export async function updateTeam(userId, teamId, updatedFields) {
  return axios.put(`${API_BASE}/teams/${userId}/${teamId}`, updatedFields);
}
