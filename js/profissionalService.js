import apiClient from './api.js';

const PROFISSIONAL_DTO_KEYS = [
    'nome',
    'cpf',
    'dataNascimento',
    'senhaProvisoria',
    'idEspecialidades',
    'registroProfissional',
    'estadoRegistro',
    'cargaHorariaSemanal',
    'email',
    'celular',
    'endereco',
    'cnpj',
    'razaoSocial',
    'nomeFantasia',
    'inscricaoEstadual',
];

// Adicione um segundo parâmetro "isUpdate" falso por padrão
function buildProfissionalPayload(dados, isUpdate = false) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw new TypeError('O parâmetro dados deve ser um objeto válido.');
    }

    return PROFISSIONAL_DTO_KEYS.reduce((payload, key) => {
        if (Object.prototype.hasOwnProperty.call(dados, key)) {
            payload[key] = dados[key];
        } else if (!isUpdate) {
            // Só força null no POST (criação) para garantir que campos de PJ fiquem explícitos
            payload[key] = null;
        }
        return payload;
    }, {});
}

export async function criarProfissional(dados) {
    const payload = buildProfissionalPayload(dados, false); // POST comum
    return apiClient.post('/api/profissionais', payload);
}

export async function listarProfissionais(page = 0, size = 10) {
    return apiClient.get(`/api/profissionais?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`);
}

export async function buscarProfissionalPorId(id) {
    if (id === undefined || id === null) {
        throw new TypeError('O parâmetro id é obrigatório.');
    }
    return apiClient.get(`/api/profissionais/${id}`);
}

export async function atualizarProfissional(id, dados) {
    if (id === undefined || id === null) {
        throw new TypeError('O parâmetro id é obrigatório.');
    }
    const payload = buildProfissionalPayload(dados, true); // TRUE avisa que é atualização parcial
    return apiClient.put(`/api/profissionais/${id}`, payload);
}

export async function deletarProfissional(id) {
    if (id === undefined || id === null) {
        throw new TypeError('O parâmetro id é obrigatório.');
    }
    return apiClient.delete(`/api/profissionais/${id}`);
}

export default {
    criarProfissional,
    listarProfissionais,
    buscarProfissionalPorId,
    atualizarProfissional,
    deletarProfissional,
};
