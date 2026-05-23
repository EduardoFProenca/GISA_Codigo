// utils.js — funções compartilhadas

function getUsuarioLogado() {
  const u = sessionStorage.getItem('usuario');
  return u ? JSON.parse(u) : null;
}

function logout() {
  sessionStorage.removeItem('usuario');
  // Volta para a raiz do projeto (2 níveis acima de views/<perfil>/)
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const up = depth >= 2 ? '../../' : './';
  window.location.href = up + 'index.html';
}
