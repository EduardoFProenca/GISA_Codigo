/**
 * Model: Agenda
 * Representa a agenda de um profissional de saúde da APAE.
 *
 * Usado exclusivamente no portal_profissional (views/medico/dashboard.html).
 * O Paciente vê SUAS consultas via Paciente.proximasConsultas().
 * O Profissional vê a agenda do DIA / semana com detalhes de atendimento.
 */

'use strict';

// ---------------------------------------------------------------------------
// Dados mock — substituir por banco em produção
// ---------------------------------------------------------------------------
const _agendamentos = [
  {
    id:             'A001',
    profissionalId: 'P001',
    pacienteId:     'PAC001',
    nomePaciente:   'Lucas Oliveira Santos',
    tipo:           'Avaliação Psicológica',
    data:           '2025-10-27',   // data no formato ISO YYYY-MM-DD
    hora:           '09:00',
    status:         'em_andamento', // 'agendado' | 'em_andamento' | 'concluido' | 'cancelado'
  },
  {
    id:             'A002',
    profissionalId: 'P001',
    pacienteId:     'PAC002',
    nomePaciente:   'Ana Paula Costa',
    tipo:           'Fisioterapia',
    data:           '2025-10-27',
    hora:           '10:30',
    status:         'agendado',
  },
  {
    id:             'A003',
    profissionalId: 'P001',
    pacienteId:     'PAC003',
    nomePaciente:   'Pedro Henrique Silva',
    tipo:           'Fonoaudiologia',
    data:           '2025-10-27',
    hora:           '14:00',
    status:         'agendado',
  },
  {
    id:             'A004',
    profissionalId: 'P001',
    pacienteId:     'PAC004',
    nomePaciente:   'Sofia Rodrigues',
    tipo:           'Terapia da Fala',
    data:           '2025-10-27',
    hora:           '15:30',
    status:         'agendado',
  },
];

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
const Agenda = {

  /**
   * Retorna todos os agendamentos de hoje para um profissional.
   * @param {string} profissionalId
   * @returns {object[]}
   */
  hojeDoProfi(profissionalId) {
    const hoje = new Date().toISOString().split('T')[0];
    return _agendamentos
      .filter(a => a.profissionalId === profissionalId && a.data === hoje)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  },

  /**
   * Retorna os agendamentos de uma data específica para um profissional.
   * @param {string} profissionalId
   * @param {string} data  — formato YYYY-MM-DD
   * @returns {object[]}
   */
  porData(profissionalId, data) {
    return _agendamentos
      .filter(a => a.profissionalId === profissionalId && a.data === data)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  },

  /**
   * Conta quantas consultas foram agendadas hoje para o profissional.
   * @param {string} profissionalId
   * @returns {number}
   */
  totalHoje(profissionalId) {
    return this.hojeDoProfi(profissionalId).length;
  },

  /**
   * Mapeia o status do agendamento para exibição na view.
   * @param {string} status
   * @returns {{ label: string, classe: string }}
   */
  statusParaView(status) {
    const mapa = {
      agendado:     { label: 'Consulta',     classe: 'badge-blue'   },
      em_andamento: { label: 'Em andamento', classe: 'badge-orange' },
      concluido:    { label: 'Concluído',    classe: 'badge-gray'   },
      cancelado:    { label: 'Cancelado',    classe: 'badge-red'    },
    };
    return mapa[status] || { label: status, classe: 'badge-gray' };
  },

  /**
   * Atualiza o status de um agendamento.
   * @param {string} agendamentoId
   * @param {string} novoStatus
   * @returns {boolean}
   */
  atualizarStatus(agendamentoId, novoStatus) {
    const ag = _agendamentos.find(a => a.id === agendamentoId);
    if (!ag) return false;
    ag.status = novoStatus;
    return true;
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Agenda;
} else {
  window.Agenda = Agenda;
}
