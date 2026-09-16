import api from './api';

export const fetchFolders = (parent, team) =>
  api.get('/folders', { params: { parent: parent || 'root', team: team || 'none' } }).then((r) => r.data.data);

export const fetchFolderPath = (id) => api.get(`/folders/${id}/path`).then((r) => r.data.data);

export const createFolder = (payload) => api.post('/folders', payload).then((r) => r.data.data);

export const renameFolder = (id, name) => api.patch(`/folders/${id}`, { name }).then((r) => r.data.data);

export const deleteFolder = (id) => api.delete(`/folders/${id}`).then((r) => r.data);
