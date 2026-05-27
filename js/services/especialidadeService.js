import apiClient from '../api.js';

export async function listarEspecialidades() {
  const res = await apiClient.get('/api/especialidades');
  if (!res) return [];
  if (res.status >= 200 && res.status < 300) return res.body || [];
  throw new Error('Erro ao obter especialidades');
}

export default { listarEspecialidades };