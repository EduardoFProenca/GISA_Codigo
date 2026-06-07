import { listarProfissionais, deletarProfissional as apiDeletarProfissional } from '../../../js/profissionalService.js';

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

/* Constrói os botões de ação (Passando o objeto 'p' inteiro agora) */
function actionButtons(p) {
  // Tenta extrair o ID por caminhos comuns caso o nome varie
  const idSg = p.id || p.idProfissional || p.codigo || '';

  const wrap = document.createElement('div');
  wrap.className = 'actions';
  wrap.innerHTML = `
  <button class="act-btn" title="Visualizar">${SVG_VIEW}</button>
  <button class="act-btn" title="Editar" disabled style="opacity: 0.3; cursor: not-allowed; pointer-events: none;">${SVG_EDIT}</button>
  <button class="act-btn danger" title="Excluir" data-id="${esc(idSg)}">${SVG_DEL}</button>`;
  
  wrap.querySelector('.act-btn[title="Visualizar"]').addEventListener('click', () => viewProfissional(idSg));
  // Evento do Editar removido temporariamente
  wrap.querySelector('.danger').addEventListener('click', () => deleteProfissional(p)); 
  
  return wrap;
}

function viewProfissional(id) {
  window.location.href = `cadastro_profissional.html?id=${encodeURIComponent(id)}&mode=view`;
}

/* Exclui o profissional analisando o objeto completo */
async function deleteProfissional(p) {
  // Investiga o objeto no console para você ver a estrutura que veio do banco
  console.log('[GISA] Objeto do profissional capturado no clique:', p);

  // Tenta capturar o ID de propriedades alternativas comuns
  const id = p?.id || p?.idProfissional || p?.codigo;
  console.log(`[GISA] ID Identificado para envio: ${id} (Tipo: ${typeof id})`);

  if (id === undefined || id === null || id === '') {
    console.error('[GISA] Erro crítico: Nenhuma propriedade de ID válida foi encontrada no objeto.', p);
    alert('Erro crítico: Não foi possível identificar o ID deste profissional. Abra o Console (F12) para inspecionar as propriedades do objeto.');
    return;
  }

  if (!confirm('Confirma exclusão deste profissional?')) return;

  try {
    const res = await apiDeletarProfissional(id);
    console.log('[GISA] Resposta da API de exclusão:', res);

    if (res && (res.status === 200 || res.status === 204)) {
      // Filtro seguro convertendo ambos os lados para String
      professionals = professionals.filter(item => String(item.id || item.idProfissional || item.codigo) !== String(id));
      filterTable();
    } else {
      throw new Error('Não foi possível excluir o profissional.');
    }
  } catch (error) {
    console.error('[GISA] Erro ao excluir profissional:', error);
    alert('Erro ao excluir o profissional. Tente novamente.');
  }
}

/* ── Renderiza TABELA (desktop) ── */
function renderTabela(list) {
  const tbody = document.getElementById('tbody');
  
  tbody.innerHTML = list.map((p, index) => {
    const temEspecialidade = Array.isArray(p.especialidades) && p.especialidades.length;
    const idSg = p.id || p.idProfissional || p.codigo || '';
    
    const espList = temEspecialidade
      ? p.especialidades
          .map(e => {
            const nome = typeof e === 'object' ? (e?.nome || '') : e;
            return nome ? `<span class="esp-chip">${esc(nome)}</span>` : '';
          })
          .filter(Boolean)
          .join('')
      : '-';
      
    const registro = temEspecialidade ? (p.registroProfissional || '-') : '-';
    const badge = p.status === 'Ativo' ? 'green' : 'badge-gray';
    
    return `
    <tr data-id="${esc(idSg)}">
      <td>
        <div class="prof-cell">
          <div class="avatar">${esc(initials(p.nome))}</div>
          <span class="prof-name">${esc(p.nome)}</span>
        </div>
      </td>
      <td>
        <div class="esp-container">${espList}</div>
      </td>
      <td class="muted col-registro">${esc(registro)}</td>
      <td class="muted col-email">${esc(p.email || '')}</td>
      <td><span class="badge dot ${badge}">${esc(p.status)}</span></td>
      <td class="right" data-actions="${index}"></td>
    </tr>`;
  }).join('');

  /* Injeta botões passando o objeto de dados estruturado por linha */
  list.forEach((p, index) => {
    const cell = tbody.querySelector(`[data-actions="${index}"]`);
    if (cell) cell.appendChild(actionButtons(p)); 
  });
}

/* ── Renderiza CARDS (mobile) ── */
function renderCards(list) {
  const container = document.getElementById('cards-list');
  container.innerHTML = '';

  list.forEach(p => {
    const temEspecialidade = Array.isArray(p.especialidades) && p.especialidades.length;
    const idSg = p.id || p.idProfissional || p.codigo || '';
    
    const espList = temEspecialidade
      ? p.especialidades
          .map(e => {
            const nome = typeof e === 'object' ? (e?.nome || '') : e;
            return nome ? `<span class="esp-chip">${esc(nome)}</span>` : '';
          })
          .filter(Boolean)
          .join('')
      : '-';
      
    const registro = temEspecialidade ? (p.registroProfissional || '-') : '-';
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
        <div class="esp-container">${espList}</div>
      </div>
      <div class="pc-field">
        <span class="pc-label">Registro</span>
        <span class="pc-value">${esc(registro)}</span>
      </div>
      <div class="pc-field">
        <span class="pc-label">E-mail</span>
        <span class="pc-value">${esc(p.email || '')}</span>
      </div>
    </div>
    <div class="pc-footer" data-actions="mobile-${esc(idSg)}"></div>`;

    card.querySelector('[data-actions^="mobile-"]').appendChild(actionButtons(p));
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
  renderCards(list);
}

/* ── Filtra pelo texto de busca ── */
function filterTable() {
  const q = document.getElementById('search').value.toLowerCase();
  const filtered = q
    ? professionals.filter(p => {
      const esp = Array.isArray(p.especialidades)
        ? p.especialidades.map(e => (typeof e === 'object' ? (e?.nome || '') : e)).join(' ').toLowerCase() 
        : '';
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
      if (Array.isArray(data)) {
        professionals = data;
      } else if (Array.isArray(data.content)) {
        professionals = data.content;
      } else {
        professionals = [];
      }
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