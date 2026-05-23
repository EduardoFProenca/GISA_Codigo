/**
 * Model: Paciente
 * Representa o paciente atendido pela APAE e/ou seu responsável.
 *
 * DIFERENÇA DE 'profissional':
 *   - Paciente acessa o portal_paciente (views/paciente/dashboard.html),
 *     vê suas consultas, histórico e evolução do tratamento.
 *   - Profissional acessa o portal_profissional (views/medico/dashboard.html),
 *     gerencia agenda, receitas e prontuários de múltiplos pacientes.
 *
 * Um mesmo usuário logado com perfil 'paciente' pode ser o responsável
 * (ex.: mãe logada acompanhando o filho com deficiência).
 */

'use strict';

// ---------------------------------------------------------------------------
// Dados mock — substituir por banco em produção
// ---------------------------------------------------------------------------
const _pacientes = [
  {
    id:              'PAC001',
    usuarioId:       '3001',          // vínculo com Usuario (perfil 'paciente')
    // Dados do paciente atendido
    nome:            'Lucas Oliveira Santos',
    dataNascimento:  '2015-03-12',
    diagnostico:     'Transtorno do Espectro Autista (TEA) — CID F84.0',
    // Responsável (quem faz o login)
    responsavel: {
      nome:      'Maria Santos',
      parentesco: 'Mãe',
      telefone:  '(11) 99999-0000',
      email:     'maria.santos@email.com',
    },
    ativo: true,
  },
];

// ---------------------------------------------------------------------------
// Dados de consultas mock
// ---------------------------------------------------------------------------
const _consultas = [
  {
    id:              'C001',
    pacienteId:      'PAC001',
    profissionalId:  'P001',
    nomeProfissional:'Dr. Roberto Almeida',
    tipo:            'Consulta Neurológica',
    data:            '2025-11-03',
    hora:            '11:00',
    status:          'agendada',    // 'agendada' | 'realizada' | 'cancelada'
  },
  {
    id:              'C002',
    pacienteId:      'PAC001',
    profissionalId:  'P006',
    nomeProfissional:'Dr. Marcos Vieira',
    tipo:            'Avaliação Neuropsiquiátrica',
    data:            '2025-11-05',
    hora:            '10:00',
    status:          'agendada',
  },
  {
    id:              'C003',
    pacienteId:      'PAC001',
    profissionalId:  'P004',
    nomeProfissional:'Dr. Carlos Eduardo',
    tipo:            'Psicoterapia',
    data:            '2025-11-06',
    hora:            '14:30',
    status:          'agendada',
  },
  {
    id:              'C004',
    pacienteId:      'PAC001',
    profissionalId:  'P004',
    nomeProfissional:'Dr. Carlos Eduardo',
    tipo:            'Avaliação Psicológica',
    data:            '2025-10-25',
    hora:            '09:00',
    status:          'realizada',
  },
];

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
const Paciente = {

  /**
   * Busca o paciente vinculado ao usuário logado.
   * Usado no portal_paciente para carregar os dados da sessão.
   * @param {string} usuarioId
   * @returns {object | null}
   */
  buscarPorUsuario(usuarioId) {
    return _pacientes.find(p => p.usuarioId === usuarioId) || null;
  },

  /**
   * Busca um paciente pelo ID interno.
   * @param {string} id
   * @returns {object | undefined}
   */
  buscarPorId(id) {
    return _pacientes.find(p => p.id === id);
  },

  /**
   * Lista todos os pacientes ativos.
   * Usado pelos profissionais para busca no portal_profissional.
   * @returns {object[]}
   */
  listarAtivos() {
    return _pacientes.filter(p => p.ativo);
  },

  /**
   * Filtra pacientes por nome (para busca no portal_profissional).
   * @param {string} termo
   * @returns {object[]}
   */
  buscar(termo) {
    const q = (termo || '').toLowerCase().trim();
    if (!q) return this.listarAtivos();
    return _pacientes.filter(p =>
      p.ativo && p.nome.toLowerCase().includes(q)
    );
  },

  /**
   * Calcula a idade do paciente a partir da data de nascimento.
   * @param {object} paciente
   * @returns {number}
   */
  calcularIdade(paciente) {
    const hoje   = new Date();
    const nasc   = new Date(paciente.dataNascimento);
    let idade    = hoje.getFullYear() - nasc.getFullYear();
    const m      = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  },

  // ── Consultas ──────────────────────────────────────────────────────────

  /**
   * Retorna as consultas futuras (agendadas) de um paciente.
   * @param {string} pacienteId
   * @returns {object[]}
   */
  proximasConsultas(pacienteId) {
    const hoje = new Date().toISOString().split('T')[0];
    return _consultas
      .filter(c => c.pacienteId === pacienteId &&
                   c.status === 'agendada' &&
                   c.data >= hoje)
      .sort((a, b) => a.data.localeCompare(b.data));
  },

  /**
   * Retorna o histórico de consultas realizadas de um paciente.
   * @param {string} pacienteId
   * @returns {object[]}
   */
  historicoConsultas(pacienteId) {
    return _consultas
      .filter(c => c.pacienteId === pacienteId && c.status === 'realizada')
      .sort((a, b) => b.data.localeCompare(a.data));
  },

  /**
   * Cancela uma consulta agendada.
   * @param {string} consultaId
   * @param {string} pacienteId  — garante que o paciente só cancela a própria consulta
   * @returns {boolean}
   */
  cancelarConsulta(consultaId, pacienteId) {
    const consulta = _consultas.find(
      c => c.id === consultaId && c.pacienteId === pacienteId
    );
    if (!consulta || consulta.status !== 'agendada') return false;
    consulta.status = 'cancelada';
    return true;
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Paciente;
} else {
  window.Paciente = Paciente;
}
