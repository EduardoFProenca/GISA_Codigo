/**
 * Model: Usuario
 * Representa um usuário autenticável no sistema GISA.
 *
 * PERFIS DISPONÍVEIS:
 *   'coordenacao'       → acesso admin, gestão de profissionais
 *   'medico'            → perfil profissional (portal_profissional)
 *   'paciente'          → perfil paciente/responsável (portal_paciente)
 *   'recepcionista'     → agendamentos
 *   'secretaria'        → administrativo
 *   'assistente_social' → apoio social
 *
 * IMPORTANTE: 'medico' e 'paciente' são perfis distintos e independentes.
 * Cada um tem suas próprias rotas, dados e permissões.
 *
 * Segurança: este arquivo usa dados em memória (mock).
 * Em produção, substituir por chamadas a banco de dados com senhas hasheadas (bcrypt).
 */

'use strict';

// ---------------------------------------------------------------------------
// Dados mock — substituir por ORM/banco em produção
// ---------------------------------------------------------------------------
const _usuarios = [
  {
    id:     '1001',
    senha:  'admin123',   // ⚠ em produção: hash bcrypt
    perfil: 'coordenacao',
    nome:   'Dra. Ana Coordenação',
    ativo:  true,
  },
  {
    id:     '2001',
    senha:  'medico123',
    perfil: 'medico',
    nome:   'Dr. Roberto Almeida',
    ativo:  true,
    // vínculo com o Model Profissional
    profissionalId: 'P001',
  },
  {
    id:     '3001',
    senha:  'pac123456',
    perfil: 'paciente',
    nome:   'Maria Santos',   // nome do responsável/paciente logado
    ativo:  true,
    // vínculo com o Model Paciente
    pacienteId: 'PAC001',
  },
  {
    id:     '4001',
    senha:  'recep123',
    perfil: 'recepcionista',
    nome:   'Recepcionista',
    ativo:  true,
  },
  {
    id:     '5001',
    senha:  'secr1234',
    perfil: 'secretaria',
    nome:   'Secretaria',
    ativo:  true,
  },
  {
    id:     '6001',
    senha:  'assist12',
    perfil: 'assistente_social',
    nome:   'Assistente Social',
    ativo:  true,
  },
];

// ---------------------------------------------------------------------------
// Rotas por perfil — cada perfil tem seu próprio portal
// ---------------------------------------------------------------------------
const ROTAS_POR_PERFIL = {
  coordenacao:       'views/coordenacao/dashboard.html',
  medico:            'views/medico/dashboard.html',       // portal_profissional
  paciente:          'views/paciente/dashboard.html',     // portal_paciente
  recepcionista:     'views/recepcionista/dashboard.html',
  secretaria:        'views/secretaria/dashboard.html',
  assistente_social: 'views/assistente_social/dashboard.html',
};

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
const Usuario = {

  /**
   * Autentica um usuário pelo ID e senha.
   * @param {string} id
   * @param {string} senha
   * @returns {{ id, nome, perfil, profissionalId?, pacienteId? } | null}
   */
  autenticar(id, senha) {
    const user = _usuarios.find(u => u.id === id && u.senha === senha && u.ativo);
    if (!user) return null;

    // Retorna apenas o necessário para a sessão — nunca expõe a senha
    return {
      id:             user.id,
      nome:           user.nome,
      perfil:         user.perfil,
      profissionalId: user.profissionalId || null,
      pacienteId:     user.pacienteId     || null,
    };
  },

  /**
   * Retorna a rota de dashboard para o perfil informado.
   * @param {string} perfil
   * @returns {string}
   */
  rotaPorPerfil(perfil) {
    return ROTAS_POR_PERFIL[perfil] || 'index.html';
  },

  /**
   * Lista todos os perfis válidos do sistema.
   * @returns {string[]}
   */
  perfisValidos() {
    return Object.keys(ROTAS_POR_PERFIL);
  },
};

// Exporta para uso no authController (Node) ou como global no browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Usuario;
} else {
  window.Usuario = Usuario;
}
