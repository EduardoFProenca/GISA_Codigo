/**
 * Controller: Auth
 * Responsável pelo login, logout e proteção de rotas por perfil.
 *
 * Depende de: models/Usuario.js (deve ser carregado antes no HTML)
 *
 * Uso no index.html:
 *   <script src="./models/Usuario.js"></script>
 *   <script src="./controllers/authController.js"></script>
 *
 * Uso nas views internas (ex: views/medico/dashboard.html):
 *   <script src="../../models/Usuario.js"></script>
 *   <script src="../../controllers/authController.js"></script>
 */

'use strict';

// ---------------------------------------------------------------------------
// Helpers de sessão
// ---------------------------------------------------------------------------

/**
 * Persiste os dados do usuário autenticado no sessionStorage.
 * @param {{ id, nome, perfil, profissionalId?, pacienteId? }} dadosSessao
 */
function _salvarSessao(dadosSessao) {
  sessionStorage.setItem('usuario', JSON.stringify(dadosSessao));
}

/**
 * Lê os dados da sessão atual.
 * @returns {{ id, nome, perfil, profissionalId?, pacienteId? } | null}
 */
function getUsuario() {
  const raw = sessionStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

// ---------------------------------------------------------------------------
// Ações públicas
// ---------------------------------------------------------------------------

/**
 * Chamado pelo botão "Entrar" no index.html.
 * Autentica via Model Usuario e redireciona para o portal do perfil.
 */
function fazerLogin() {
  const id    = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value;

  // Delega autenticação ao Model (não mistura regra de negócio no controller)
  const sessao = Usuario.autenticar(id, senha);

  if (!sessao) {
    alert('ID ou senha incorretos.');
    return;
  }

  _salvarSessao(sessao);
  window.location.href = Usuario.rotaPorPerfil(sessao.perfil);
}

/**
 * Encerra a sessão e volta para o login.
 * Funciona de qualquer profundidade de pasta (1 ou 2 níveis abaixo da raiz).
 */
function logout() {
  sessionStorage.removeItem('usuario');
  const partes    = window.location.pathname.split('/').filter(Boolean);
  const prefixo   = partes.length >= 2 ? '../../' : './';
  window.location.href = prefixo + 'index.html';
}

// ---------------------------------------------------------------------------
// Proteção de rotas
// ---------------------------------------------------------------------------

/**
 * Garante que a view atual só é acessível pelo perfil correto.
 * Redireciona para o login se não houver sessão ou o perfil não bater.
 *
 * Uso no topo do script de cada dashboard:
 *   const usuario = exigirLogin('medico');
 *   const usuario = exigirLogin('paciente');
 *
 * @param {string | string[]} perfilEsperado  — perfil ou lista de perfis aceitos
 * @returns {{ id, nome, perfil, profissionalId?, pacienteId? } | null}
 */
function exigirLogin(perfilEsperado) {
  const usuario = getUsuario();

  if (!usuario) {
    window.location.href = _resolverRaiz() + 'index.html';
    return null;
  }

  const perfisAceitos = Array.isArray(perfilEsperado)
    ? perfilEsperado
    : [perfilEsperado];

  if (perfilEsperado && !perfisAceitos.includes(usuario.perfil)) {
    alert('Acesso negado. Você não tem permissão para esta área.');
    window.location.href = _resolverRaiz() + 'index.html';
    return null;
  }

  return usuario;
}

/**
 * Resolve o caminho relativo até a raiz do projeto
 * com base na profundidade da URL atual.
 * @returns {string}  ex: '../../'
 */
function _resolverRaiz() {
  const partes = window.location.pathname.split('/').filter(Boolean);
  return partes.length >= 2 ? '../../' : './';
}
