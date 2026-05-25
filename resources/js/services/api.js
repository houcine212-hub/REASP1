import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export function getDashboard() {
  return api.get('/dashboard');
}

export function getAllProjects(page = 1) {
  return api.get(`/projects?page=${page}`);
}

export function getProject(id) {
  return api.get(`/projects/${id}`);
}

export function createProject(data) {
  return api.post('/projects', data);
}

export function updateProject(id, data) {
  return api.put(`/projects/${id}`, data);
}

export function deleteProject(id) {
  return api.delete(`/projects/${id}`);
}

export function getProjectArticles(projectId, page = 1) {
  return api.get(`/projects/${projectId}/articles?page=${page}`);
}

export function createArticle(projectId, data) {
  return api.post(`/projects/${projectId}/articles`, data);
}

export function updateArticle(id, data) {
  return api.put(`/articles/${id}`, data);
}

export function deleteArticle(id) {
  return api.delete(`/articles/${id}`);
}

export function exportCsv(projectId) {
  return api.get(`/projects/${projectId}/export/csv`, { responseType: 'blob' });
}

export function sendContact(data) {
  return api.post('/contact', data);
}

export default api;
