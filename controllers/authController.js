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
 * 
 * ETAPAS:
 * 1. Captura os valores dos inputs e valida se não estão vazios
 * 2. Chama a função de autenticação do Model Usuario
 * 3. Se autenticado, armazena a sessão e obtém a rota de dashboard
 * 4. Redireciona para o dashboard apropriado do perfil do usuário
 */
async function fazerLogin() {
  // =========================================================================
  // ETAPA 1: Captura de Dados e Validação Básica
  // =========================================================================
  const usuarioInput = document.getElementById('usuario');
  const senhaInput = document.getElementById('senha');

  const id = usuarioInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!id) {
    alert('Por favor, informe seu ID de cadastro.');
    usuarioInput.focus();
    return;
  }

  if (!senha) {
    alert('Por favor, informe sua senha.');
    senhaInput.focus();
    return;
  }

  try {
    // =========================================================================
    // ETAPA 2 & 3: Chamada Real da API (Assíncrona) e Verificação
    // =========================================================================
    // Ajuste a URL abaixo para o endpoint exato de login do seu Spring Boot
    const resposta = await fetch('http://localhost:8080/gisa-api/api/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: Number(id), senha: senha })
    });

    // Se o back-end retornar um status de erro (como 401 ou 404)
    if (!resposta.ok) {
      alert('ID de cadastro ou senha inválidos. Tente novamente.');
      senhaInput.value = '';
      usuarioInput.focus();
      return;
    }

    // Se chegou aqui, as credenciais estão certas no banco!
    const dadosUsuario = await resposta.json();

    // =========================================================================
    // ETAPA 4: Armazenamento e Redirecionamento
    // =========================================================================
    // Monta o objeto de sessão básico exigido pelo restante do script
    const sessao = {
      id: dadosUsuario.id,
      nome: dadosUsuario.nome || 'Profissional',
      perfil: 'profissional' // Forçado simplificado como você pediu
    };

    // Salva no sessionStorage para manter o usuário logado entre as páginas
    _salvarSessao(sessao);

    // Redireciona direto para o painel da coordenação
    window.location.href = 'http://127.0.0.1:5500/views/coordenacao/dashboard.html';

  } catch (erro) {
    console.error('Erro ao tentar conectar com o servidor:', erro);
    alert('Não foi possível conectar ao servidor do GISA. Verifique se o back-end está rodando.');
  }
}

/**
 * Encerra a sessão e volta para o login.
 * Funciona de qualquer profundidade de pasta (1 ou 2 níveis abaixo da raiz).
 */
function logout() {
  sessionStorage.removeItem('usuario');
  const partes = window.location.pathname.split('/').filter(Boolean);
  const prefixo = partes.length >= 2 ? '../../' : './';
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

// ============================================================================
// Exposição Global das Funções
// ============================================================================
// Como o frontend pode usar ES Modules, as funções precisam estar disponíveis
// globalmente para serem chamadas via onclick do HTML
window.fazerLogin = fazerLogin;
window.logout = logout;
window.exigirLogin = exigirLogin;
window.getUsuario = getUsuario;