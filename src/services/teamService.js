import api from './api';

export const fetchMyTeams = () => api.get('/teams/mine').then((r) => r.data.data);

export const fetchTeam = (id) => api.get(`/teams/${id}`).then((r) => r.data.data);

export const fetchAllTeams = () => api.get('/teams').then((r) => r.data.data);

export const createTeam = (payload) => api.post('/teams', payload).then((r) => r.data.data);

export const updateTeam = (id, payload) => api.patch(`/teams/${id}`, payload).then((r) => r.data.data);

export const deleteTeam = (id) => api.delete(`/teams/${id}`).then((r) => r.data);
