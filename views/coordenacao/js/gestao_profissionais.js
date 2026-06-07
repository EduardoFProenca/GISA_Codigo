import { listarProfissionais } from '../../../js/profissionalService.js';

/* ── SVGs dos botões de ação ── */
const SVG_VIEW = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EDIT = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const SVG_DEL = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

let professionals = [];
let currentPage = 0;
const pageSize = 10;

/* Escapa HTML para evitar XSS */
function esc(v) {
  return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Iniciais para o avatar */
function initials(name) {
  return String(name || '').replace(/^Dr[a]?\.\s*/i, '').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

/* Constrói os botões de ação e registra o evento de exclusão */
function actionButtons(id) {
  const wrap = document.createElement('div');
  wrap.className = 'actions';
  wrap.innerHTML = `
  <button class="act-btn" title="Visualizar">${SVG_VIEW}</button>
  <button class="act-btn" title="Editar">${SVG_EDIT}</button>
  <button class="act-btn danger" title="Excluir" data-id="${esc(id)}">${SVG_DEL}</button>`;
  wrap.querySelector('.danger').addEventListener('click', () => deleteProfissional(id));
  return wrap;
}

/* Exclui da lista mock e re-renderiza */
function deleteProfissional(id) {
  if (!confirm('Confirma exclusão deste profissional?')) return;
  professionals = professionals.filter(p => p.id !== id);
  filterTable();
}

/* ── Renderiza TABELA (desktop) ── */
function renderTabela(list) {
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = list.map(p => {
    const esp = Array.isArray(p.especialidades) ? p.especialidades.map(e => e?.nome || '').join(', ') : '';
    const badge = p.status === 'Ativo' ? 'green' : 'badge-gray';
    return `
    <tr data-id="${esc(p.id)}">
      <td>
        <div class="prof-cell">
          <div class="avatar">${esc(initials(p.nome))}</div>
          <span class="prof-name">${esc(p.nome)}</span>
        </div>
      </td>
      <td>${esc(esp)}</td>
      <td class="muted col-registro">${esc(p.registroProfissional)}</td>
      <td class="muted col-email">${esc(p.email)}</td>
      <td><span class="badge dot ${badge}">${esc(p.status)}</span></td>
      <td class="right" data-actions="${esc(p.id)}"></td>
    </tr>`;
  }).join('');

  /* Injeta botões com eventos (não dá para fazer inline com addEventListener) */
  list.forEach(p => {
    const cell = tbody.querySelector(`[data-actions="${esc(p.id)}"]`);
    if (cell) cell.appendChild(actionButtons(p.id));
  });
}

/* ── Renderiza CARDS (mobile) ── */
function renderCards(list) {
  const container = document.getElementById('cards-list');
  container.innerHTML = '';

  list.forEach(p => {
    const esp = Array.isArray(p.especialidades) ? p.especialidades.map(e => e?.nome || '').join(', ') : '';
    const badge = p.status === 'Ativo' ? 'green' : 'badge-gray';

    const card = document.createElement('div');
    card.className = 'prof-card';
    card.innerHTML = `
    <div class="pc-top">
      <div class="avatar">${esc(initials(p.nome))}</div>
      <span class="pc-name">${esc(p.nome)}</span>
      <span class="badge dot ${badge}">${esc(p.status)}</span>
    </div>
    <div class="pc-details">
      <div class="pc-field">
        <span class="pc-label">Especialidade</span>
        <span class="pc-value">${esc(esp)}</span>
      </div>
      <div class="pc-field">
        <span class="pc-label">Registro</span>
        <span class="pc-value">${esc(p.registroProfissional)}</span>
      </div>
      <div class="pc-field">
        <span class="pc-label">E-mail</span>
        <span class="pc-value">${esc(p.email)}</span>
      </div>
    </div>
    <div class="pc-footer" data-actions="${esc(p.id)}"></div>`;

    card.querySelector('.pc-footer').appendChild(actionButtons(p.id));
    container.appendChild(card);
  });
}

/* ── Renderiza ambos (tabela + cards) e controla empty state ── */
function renderAll(list) {
  const empty = document.getElementById('empty');

  if (!list || list.length === 0) {
    document.getElementById('tbody').innerHTML = '';
    document.getElementById('cards-list').innerHTML = '';
    empty.classList.add('show');
    document.getElementById('empty-term').textContent = document.getElementById('search').value;
    document.getElementById('count').textContent = '0 profissionais';
    return;
  }

  empty.classList.remove('show');
  document.getElementById('count').textContent =
    `${list.length} profissiona${list.length === 1 ? 'l' : 'is'}`;

  renderTabela(list);
  renderCards(list);    /* mobile  */
}

/* ── Filtra pelo texto de busca ── */
function filterTable() {
  const q = document.getElementById('search').value.toLowerCase();
  const filtered = q
    ? professionals.filter(p => {
      const esp = Array.isArray(p.especialidades)
        ? p.especialidades.map(e => e?.nome || '').join(' ').toLowerCase() : '';
      return (p.nome || '').toLowerCase().includes(q) || esp.includes(q);
    })
    : professionals;
  renderAll(filtered);
}

/* ── Carrega profissionais do backend ── */
async function loadProfessionals(page = 0) {
  const loader = document.getElementById('loader');
  try {
    loader.classList.add('show');
    const res = await listarProfissionais(page, pageSize);
    if (res && res.status >= 200 && res.status < 300) {
      const data = res.body || {};
      professionals = Array.isArray(data.content) ? data.content : [];
      currentPage = page;
      renderAll(professionals);
      updatePaginationButtons(data);
    } else {
      throw new Error('Erro ao carregar profissionais');
    }
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error);
    professionals = [];
    renderAll([]);
  } finally {
    loader.classList.remove('show');
  }
}

/* ── Atualiza estado dos botões de paginação ── */
function updatePaginationButtons(data) {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const totalPages = data.totalPages || 1;
  
  prevBtn.disabled = currentPage <= 0;
  nextBtn.disabled = currentPage >= totalPages - 1;
  
  prevBtn.onclick = () => loadProfessionals(currentPage - 1);
  nextBtn.onclick = () => loadProfessionals(currentPage + 1);
}

/* ── Init ── */
function initialize() {
  document.getElementById('search').addEventListener('input', filterTable);
  loadProfessionals(0);
}

window.addEventListener('DOMContentLoaded', initialize);
