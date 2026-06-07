import { criarProfissional } from '../../../js/profissionalService.js';
import { listarEspecialidades } from '../../../js/services/especialidadeService.js';

let specialties = [];
let selectedSpecialties = [];

const get = (id) => document.getElementById(id);
const specInput = get('spec-input');
const specDropdown = get('spec-dropdown');
const specTags = get('spec-tags');
const saveButton = document.querySelector('.save-btn');
const generatePasswordButton = get('btn-gerar-senha');
const pjCheck = get('pj-check');
const pjFields = get('pj-fields');
const formMessage = get('form-message');

function renderDropdown(list) {
  specDropdown.innerHTML = list.length
    ? list.map((spec) => `
      <button class="spec-option" type="button" data-id="${spec.id}">
        ${spec.nome}
      </button>
    `).join('')
    : '<div class="empty-option">Nenhuma especialidade encontrada.</div>';
}

function filterSpecs() {
  const query = specInput.value.trim().toLowerCase();
  const filtered = specialties.filter((spec) => {
    const alreadySelected = selectedSpecialties.some((item) => item.id === spec.id);
    return !alreadySelected && spec.nome.toLowerCase().includes(query);
  });
  renderDropdown(filtered);
  specDropdown.classList.add('open');
}

function openDropdown() {
  renderDropdown(specialties.filter((spec) => !selectedSpecialties.some((item) => item.id === spec.id)));
  specDropdown.classList.add('open');
}

function closeDropdown() {
  specDropdown.classList.remove('open');
}

function addSpec(specId) {
  const spec = specialties.find((item) => item.id === specId);
  if (!spec || selectedSpecialties.some((item) => item.id === spec.id)) {
    specInput.value = '';
    closeDropdown();
    return;
  }
  selectedSpecialties.push(spec);
  renderTags();
  specInput.value = '';
  closeDropdown();
}

function removeSpec(specId) {
  selectedSpecialties = selectedSpecialties.filter((item) => item.id !== specId);
  renderTags();
}

function renderTags() {
  specTags.innerHTML = selectedSpecialties.map((spec) => `
    <span class="tag" data-remove-id="${spec.id}">
      ${spec.nome}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  `).join('');
}

function togglePJ() {
  pjFields.classList.toggle('open', pjCheck.checked);
}

function gerarSenhaAutomatica() {
  const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  let senha = '';
  for (let i = 0; i < 8; i += 1) {
    senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  get('inp-senha').value = senha;
}

function formatCPF(event) {
  const input = event.target;
  const raw = input.value.replace(/\D/g, '').slice(0, 11);
  let formatted = raw;
  if (raw.length > 9) formatted = raw.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  else if (raw.length > 6) formatted = raw.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  else if (raw.length > 3) formatted = raw.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  input.value = formatted;
  get('inp-usuario').value = raw.slice(0, 11);
}

function formatPhone(event) {
  const input = event.target;
  let raw = input.value.replace(/\D/g, '').slice(0, 11);
  if (raw.length > 6) raw = raw.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  else if (raw.length > 2) raw = raw.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  input.value = raw;
}

function formatCNPJ(event) {
  const input = event.target;
  let raw = input.value.replace(/\D/g, '').slice(0, 14);
  if (raw.length > 12) raw = raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  else if (raw.length > 8) raw = raw.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
  else if (raw.length > 5) raw = raw.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
  else if (raw.length > 2) raw = raw.replace(/(\d{2})(\d{0,3})/, '$1.$2');
  input.value = raw;
}

function showMessage(message, isError = true) {
  formMessage.style.color = isError ? '#b91c1c' : '#064e3b';
  formMessage.textContent = message;
  if (!isError) {
    setTimeout(() => {
      if (formMessage.textContent === message) {
        formMessage.textContent = '';
      }
    }, 4000);
  }
}

async function loadSpecialties() {
  try {
    const list = await listarEspecialidades();
    specialties = Array.isArray(list)
      ? list.map((item, index) => {
        if (item && typeof item === 'object') {
          const id = item.id ?? item.idEspecialidade ?? item.codigo ?? (index + 1);
          const nome = item.nome ?? item.name ?? item.descricao ?? item.label ?? String(item);
          return { id: Number(id), nome };
        }
        return { id: index + 1, nome: String(item) };
      })
      : [];
    renderDropdown(specialties.filter((spec) => !selectedSpecialties.some((item) => item.id === spec.id)));
  } catch (error) {
    console.error('Erro ao carregar especialidades', error);
    specialties = [];
    renderDropdown([]);
  }
}

async function handleSave(event) {
  event.preventDefault();
  showMessage('');

  try {
    const nome = get('inp-nome').value.trim();
    const cpf = get('inp-cpf').value.replace(/\D/g, '');
    const dataNascimento = get('inp-dataNascimento').value || null;
    const senhaProvisoria = get('inp-senha').value || null;
    const idEspecialidades = selectedSpecialties.map((spec) => spec.id);
    const registroProfissional = get('inp-registro').value || null;
    const estadoRegistro = get('inp-estadoRegistro').value || null;
    const cargaHorariaSemanal = get('inp-carga').value || null;
    const email = get('inp-email').value || null;
    const celular = get('inp-tel').value.replace(/\D/g, '') || null;
    const endereco = {
      rua: get('inp-rua').value || null,
      numero: get('inp-numero').value || null,
      complemento: get('inp-complemento').value || null,
      bairro: get('inp-bairro').value || null,
      cidade: get('inp-cidade').value || null,
      estado: get('inp-estado').value || null,
      cep: get('inp-cep').value.replace(/\D/g, '') || null,
    };
    const isPJ = pjCheck.checked;
    const cnpj = isPJ ? get('inp-cnpj').value.replace(/\D/g, '') || null : null;
    const razaoSocial = isPJ ? get('inp-razaoSocial').value || null : null;
    const nomeFantasia = isPJ ? get('inp-nomeFantasia').value || null : null;
    const inscricaoEstadual = isPJ ? get('inp-inscricaoEstadual').value || null : null;

    const payload = {
      nome,
      cpf,
      dataNascimento,
      senhaProvisoria,
      idEspecialidades,
      registroProfissional,
      estadoRegistro,
      cargaHorariaSemanal,
      email,
      celular,
      endereco,
      cnpj,
      razaoSocial,
      nomeFantasia,
      inscricaoEstadual,
    };

    const res = await criarProfissional(payload);
    if (res && res.status === 201) {
      showMessage('Profissional criado com sucesso.', false);
    } else {
      showMessage('Resposta inesperada do servidor. Verifique os dados e tente novamente.');
    }
  } catch (error) {
    console.error(error);
    showMessage(error.message || 'Erro ao salvar profissional. Tente novamente.');
  }
}

function attachListeners() {
  specInput.addEventListener('input', filterSpecs);
  specInput.addEventListener('focus', openDropdown);
  specInput.addEventListener('blur', () => setTimeout(closeDropdown, 150));
  specDropdown.addEventListener('mousedown', (event) => {
    const button = event.target.closest('.spec-option');
    if (!button) return;
    const specId = Number(button.dataset.id);
    addSpec(specId);
  });
  specTags.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-id]');
    if (!removeButton) return;
    removeSpec(Number(removeButton.dataset.removeId));
  });
  generatePasswordButton.addEventListener('click', gerarSenhaAutomatica);
  pjCheck.addEventListener('change', togglePJ);
  saveButton.addEventListener('click', handleSave);
}

function initialize() {
  attachListeners();
  loadSpecialties();
}

initialize();
