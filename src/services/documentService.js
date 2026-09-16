import api from './api';

export const fetchDocuments = (params) =>
  api.get('/documents', { params }).then((r) => r.data);

export const fetchDocument = (id) =>
  api.get(`/documents/${id}`).then((r) => r.data.data);

export const fetchSharedDocuments = (params) =>
  api.get('/documents/shared', { params }).then((r) => r.data);

export const fetchShareableUsers = (params) =>
  api.get('/documents/shareable-users', { params }).then((r) => r.data.data);

export const uploadDocuments = (files, { category, tags, folder, team }, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  if (category) formData.append('category', category);
  if (tags) formData.append('tags', tags);
  if (folder) formData.append('folder', folder);
  if (team) formData.append('team', team);

  return api
    .post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    .then((r) => r.data.data);
};

export const suggestDocumentMetadata = (id) =>
  api.post(`/documents/${id}/ai-suggest`).then((r) => r.data.data);

export const shareDocument = (id, userIds) =>
  api.patch(`/documents/${id}/share`, { userIds }).then((r) => r.data.data);

export const updateDocument = (id, payload) =>
  api.patch(`/documents/${id}`, payload).then((r) => r.data.data);

export const deleteDocument = (id) =>
  api.delete(`/documents/${id}`).then((r) => r.data);
