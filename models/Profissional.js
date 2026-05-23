/**
 * Model: Profissional
 * Representa um membro do corpo clínico/terapêutico da APAE.
 *
 * DIFERENÇA DE 'paciente':
 *   - Profissional tem CRP/CRM/CREFITO, especialidade, agenda e acessa
 *     o portal_profissional (views/medico/dashboard.html).
 *   - Paciente é o usuário atendido, com prontuário e consultas agendadas,
 *     e acessa o portal_paciente (views/paciente/dashboard.html).
 *   Os dois perfis são completamente separados.
 */

'use strict';

// ---------------------------------------------------------------------------
// Dados mock — substituir por banco em produção
// ---------------------------------------------------------------------------
const _profissionais = [
  {
    id:          'P001',
    usuarioId:   '2001',          // vínculo com Usuario (perfil 'medico')
    nome:        'Dr. Roberto Almeida',
    especialidades: ['Neurologista Pediátrico'],
    registro:    'CRM-SP 123456',
    email:       'roberto.almeida@apae.org',
    ativo:       true,
  },
  {
    id:          'P002',
    usuarioId:   null,            // profissional sem acesso ao sistema ainda
    nome:        'Dra. Fernanda Lima',
    especialidades: ['Fisioterapeuta'],
    registro:    'CREFITO-3 45678',
    email:       'fernanda.lima@apae.org',
    ativo:       true,
  },
  {
    id:          'P003',
    usuarioId:   null,
    nome:        'Dra. Juliana Mendes',
    especialidades: ['Fonoaudióloga'],
    registro:    'CRFa 2-12345',
    email:       'juliana.mendes@apae.org',
    ativo:       true,
  },
  {
    id:          'P004',
    usuarioId:   null,
    nome:        'Dr. Carlos Eduardo',
    especialidades: ['Psicólogo'],
    registro:    'CRP 06/98765',
    email:       'carlos.eduardo@apae.org',
    ativo:       true,
  },
  {
    id:          'P005',
    usuarioId:   null,
    nome:        'Dra. Patricia Santos',
    especialidades: ['Terapeuta Ocupacional'],
    registro:    'CREFITO-3 67890',
    email:       'patricia.santos@apae.org',
    ativo:       true,
  },
  {
    id:          'P006',
    usuarioId:   null,
    nome:        'Dr. Marcos Vieira',
    especialidades: ['Neurologista Pediátrico', 'Psiquiatra'],
    registro:    'CRM-SP 234567',
    email:       'marcos.vieira@apae.org',
    ativo:       true,
  },
];

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
const Profissional = {

  /**
   * Retorna todos os profissionais ativos.
   * @returns {object[]}
   */
  listarAtivos() {
    return _profissionais.filter(p => p.ativo);
  },

  /**
   * Busca um profissional pelo ID interno.
   * @param {string} id
   * @returns {object | undefined}
   */
  buscarPorId(id) {
    return _profissionais.find(p => p.id === id);
  },

  /**
   * Busca o profissional vinculado a um usuário logado.
   * Usado no portal_profissional para carregar os dados da sessão.
   * @param {string} usuarioId
   * @returns {object | null}
   */
  buscarPorUsuario(usuarioId) {
    return _profissionais.find(p => p.usuarioId === usuarioId) || null;
  },

  /**
   * Filtra por nome ou especialidade (busca case-insensitive).
   * @param {string} termo
   * @returns {object[]}
   */
  buscar(termo) {
    const q = (termo || '').toLowerCase().trim();
    if (!q) return this.listarAtivos();
    return _profissionais.filter(p =>
      p.ativo &&
      (p.nome.toLowerCase().includes(q) ||
       p.especialidades.some(e => e.toLowerCase().includes(q)))
    );
  },

  /**
   * Retorna a especialidade formatada para exibição.
   * Múltiplas especialidades são unidas por vírgula.
   * @param {object} profissional
   * @returns {string}
   */
  especialidadeFormatada(profissional) {
    return (profissional.especialidades || []).join(', ');
  },

  /**
   * Cadastra um novo profissional (mock — não persiste).
   * @param {{ nome, especialidades, registro, email }} dados
   * @returns {object}
   */
  cadastrar(dados) {
    const novo = {
      id:             `P${String(_profissionais.length + 1).padStart(3, '0')}`,
      usuarioId:      null,
      nome:           dados.nome,
      especialidades: Array.isArray(dados.especialidades)
                        ? dados.especialidades
                        : [dados.especialidades],
      registro:       dados.registro,
      email:          dados.email,
      ativo:          true,
    };
    _profissionais.push(novo);
    return novo;
  },

  /**
   * Desativa um profissional (soft delete).
   * @param {string} id
   * @returns {boolean}
   */
  desativar(id) {
    const prof = this.buscarPorId(id);
    if (!prof) return false;
    prof.ativo = false;
    return true;
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Profissional;
} else {
  window.Profissional = Profissional;
}
