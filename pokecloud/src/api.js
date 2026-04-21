import axios from "axios";

const API_BASE = "https://pokemon-api-r8sq.onrender.com";

// 15-second timeout on every request — prevents hanging when Render cold-starts
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

export async function saveTeam(teamData) {
  return api.post("/teams/save", teamData);
}

// Returns full axios response so callers can do res.data
export async function getTeams(userId) {
  return api.get(`/teams/${userId}`);
}

export async function deleteTeam(userId, teamId) {
  return api.delete(`/teams/${userId}/${teamId}`);
}

export async function updateTeam(userId, teamId, updatedFields) {
  return api.put(`/teams/${userId}/${teamId}`, updatedFields);
}
