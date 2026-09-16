import api from './api';

export const fetchUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);

export const updateUser = (id, payload) =>
  api.patch(`/admin/users/${id}`, payload).then((r) => r.data.data);

export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((r) => r.data);

export const fetchAllDocuments = (params) =>
  api.get('/admin/documents', { params }).then((r) => r.data);

export const deleteAnyDocument = (id) =>
  api.delete(`/admin/documents/${id}`).then((r) => r.data);

export const shareDocument = (id, userIds) =>
  api.patch(`/admin/documents/${id}/share`, { userIds }).then((r) => r.data.data);

export const fetchStats = () => api.get('/admin/stats').then((r) => r.data.data);

export const fetchCloudinaryUsage = () => api.get('/admin/cloudinary-usage').then((r) => r.data.data);

export const fetchActivityLogs = (params) =>
  api.get('/admin/activity-logs', { params }).then((r) => r.data);
