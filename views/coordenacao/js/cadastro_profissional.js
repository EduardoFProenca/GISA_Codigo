import {
    criarProfissional,
    buscarProfissionalPorId,
    atualizarProfissional,
} from '../../../js/profissionalService.js';
import { listarEspecialidades } from '../../../js/services/especialidadeService.js';

let specialties = [];
let selectedSpecialties = [];
let editId = null;
let viewMode = false;

const get = (id) => document.getElementById(id);
const specInput = get('spec-input');
const specDropdown = get('spec-dropdown');
const specTags = get('spec-tags');
const saveButton = document.querySelector('.save-btn');
const generatePasswordButton = get('btn-gerar-senha');
const pjCheck = get('pj-check');
const pjFields = get('pj-fields');
const accessDataSection = get('access-data-section');
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

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function normalizeSpecialty(item, index) {
    if (!item || typeof item !== 'object') {
        return { id: index + 1, nome: String(item) };
    }
    const id = item.id ?? item.idEspecialidade ?? item.codigo ?? (index + 1);
    const nome = item.nome ?? item.name ?? item.descricao ?? item.label ?? String(item);
    return { id: Number(id), nome };
}

function filterSpecs() {
    if (specInput && specInput.disabled) return; 
    
    const query = specInput.value.trim().toLowerCase();
    const filtered = specialties.filter((spec) => {
        const alreadySelected = selectedSpecialties.some((item) => item.id === spec.id);
        return !alreadySelected && spec.nome.toLowerCase().includes(query);
    });
    renderDropdown(filtered);
    specDropdown.classList.add('open');
}

function openDropdown() {
    if (specInput && specInput.disabled) return; 
    
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
    specTags.innerHTML = selectedSpecialties.map((spec) => {
        if (viewMode) {
            return `<span class="tag" style="padding-right: 12px;">${spec.nome}</span>`;
        }
        return `
        <span class="tag" data-remove-id="${spec.id}">
          ${spec.nome}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      `;
    }).join('');
}

function togglePJ() {
    pjFields.classList.toggle('open', pjCheck.checked);
}

function gerarSenhaAutomatica() {
    const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    let senha = '';
    for (let i = 0; i < 8; i += 1) {
        senha += caracteres.charAt(Math.floor(Math.floor(Math.random() * caracteres.length)));
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

function formatCEP(event) {
    const input = event.target;
    let raw = input.value.replace(/\D/g, '').slice(0, 8);
    if (raw.length > 5) raw = raw.replace(/(\d{5})(\d{0,3})/, '$1-$2');
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

function populateForm(prof) {
    get('inp-nome').value = prof.nome || '';
    get('inp-cpf').value = prof.cpf ? String(prof.cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';
    get('inp-dataNascimento').value = prof.dataNascimento || '';
    get('inp-registro').value = prof.registroProfissional || '';
    get('inp-email').value = prof.email || '';
    get('inp-tel').value = prof.celular ? String(prof.celular).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '';

    const sistemaId = prof.id ?? prof.idProfissional ?? prof.idCadastro ?? prof.usuario ?? '';
    get('inp-usuario').value = String(sistemaId);
    get('inp-senha').value = prof.senhaProvisoria ?? prof.senha ?? '';

    let endereco = prof.endereco || {};
    if (Array.isArray(prof.enderecos) && prof.enderecos.length > 0) {
        endereco = prof.enderecos[0];
    }

    get('inp-rua').value = endereco.rua || '';
    get('inp-numero').value = endereco.numero || '';
    get('inp-complemento').value = endereco.complemento || '';
    get('inp-bairro').value = endereco.bairro || '';
    get('inp-cidade').value = endereco.cidade || '';
    get('inp-estado').value = endereco.estado || '';
    get('inp-cep').value = endereco.cep ? String(endereco.cep).replace(/(\d{5})(\d{3})/, '$1-$2') : '';

    const specs = Array.isArray(prof.especialidades) ? prof.especialidades : [];
    selectedSpecialties = specs.map(normalizeSpecialty);
    renderTags();

    const hasPJ = Boolean(prof.cnpj || prof.razaoSocial || prof.nomeFantasia || prof.inscricaoEstadual || prof.isPJ);
    pjCheck.checked = hasPJ;
    pjFields.classList.toggle('open', hasPJ);
    
    get('inp-cnpj').value = prof.cnpj ? String(prof.cnpj).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
    get('inp-razaoSocial').value = prof.razaoSocial || ''; 
    get('inp-nomeFantasia').value = prof.nomeFantasia || '';
    get('inp-inscricaoEstadual').value = prof.inscricaoEstadual || '';
}

async function loadProfessionalForEdit(id, mode = 'edit') {
    if (!id) return;
    try {
        const res = await buscarProfissionalPorId(id);
        console.log("Resposta da API recebida:", res);
        if (res && res.status >= 200 && res.status < 300 && res.body) {
            const prof = res.body;

            editId = id;
            viewMode = mode === 'view';

            populateForm(prof);

            const title = document.querySelector('header h1');
            const subtitle = document.querySelector('header p');
            const buttonText = document.querySelector('.save-btn span');

            if (mode === 'view') {
                if (title) title.textContent = 'Visualizar Profissional';
                if (subtitle) subtitle.textContent = 'Consulta de dados do profissional';
                if (buttonText) buttonText.textContent = 'Visualização';

                saveButton.disabled = true;
                if (generatePasswordButton) generatePasswordButton.style.display = 'none';
                if (accessDataSection) accessDataSection.style.display = 'none';
                if (specInput) specInput.style.display = 'none';

                setFormReadOnly(true);
            } else if (mode === 'edit_limited') {
                if (title) title.textContent = 'Alterar Profissional';
                if (subtitle) subtitle.textContent = 'Atualize os dados permitidos do corpo clínico';
                if (buttonText) buttonText.textContent = 'Salvar Alterações';

                saveButton.disabled = false;
                if (generatePasswordButton) generatePasswordButton.style.display = 'none';
                if (accessDataSection) accessDataSection.style.display = 'none'; 

                setFormReadOnly(false);

                // ── LIMPO: Esconde apenas as especialidades e o registro de conselho remanescentes para não-clínicos ──
                const specs = prof.especialidades || [];
                const temEspecialidade = Array.isArray(specs) && specs.length > 0;
                
                if (!temEspecialidade) {
                    specInput?.closest('.field')?.style.setProperty('display', 'none');
                    get('inp-registro')?.closest('.field')?.style.setProperty('display', 'none');
                }
            } else {
                if (title) title.textContent = 'Editar Profissional';
                if (subtitle) subtitle.textContent = 'Atualizar informações do profissional';
                if (buttonText) buttonText.textContent = 'Salvar Alterações';

                if (accessDataSection) accessDataSection.style.display = 'none';
                saveButton.disabled = false;
                if (generatePasswordButton) generatePasswordButton.style.display = '';

                setFormReadOnly(false);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar profissional para edição', error);
        showMessage('Não foi possível carregar os dados do profissional para edição.');
    }
}

function setFormReadOnly(readOnly) {
    const controls = document.querySelectorAll('input, select, button');
    controls.forEach((control) => {
        if (control === saveButton || control === generatePasswordButton) {
            return;
        }
        if (control.type === 'button' && !control.matches('#btn-gerar-senha')) {
            return;
        }
        if (control.id === 'spec-dropdown') return;
        control.disabled = readOnly;
    });
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

    const nome = get('inp-nome').value.trim();
    const cpf = get('inp-cpf').value.replace(/\D/g, '');
    const dataNascimento = get('inp-dataNascimento').value || null;
    const senhaProvisoria = get('inp-senha').value.trim();
    const registroProfissional = get('inp-registro').value.trim();
    const email = get('inp-email').value.trim();
    const celular = get('inp-tel').value.replace(/\D/g, '');
    
    const cep = get('inp-cep').value.replace(/\D/g, '');
    const rua = get('inp-rua').value.trim();
    const numero = get('inp-numero').value.trim();
    const complemento = get('inp-complemento').value.trim() || null;
    const bairro = get('inp-bairro').value.trim();
    const city = get('inp-cidade').value.trim();
    const estado = get('inp-estado').value.trim();

    const isPJ = pjCheck.checked;
    const cnpj = get('inp-cnpj').value.replace(/\D/g, '');
    const razaoSocial = get('inp-razaoSocial').value.trim();
    const nomeFantasia = get('inp-nomeFantasia').value.trim() || null;
    const inscricaoEstadual = get('inp-inscricaoEstadual').value.trim() || null;

    // Validações gerais básicas
    if (!nome) { showMessage('O campo Nome Completo é obrigatório.'); return; }
    if (!cpf || cpf.length !== 11) { showMessage('O campo CPF é obrigatório e deve conter 11 dígitos.'); return; }
    if (!editId && !senhaProvisoria) { showMessage('O campo Senha Provisória é obrigatório para novos cadastros.'); return; }
    if (!email) { showMessage('O campo E-mail é obrigatório.'); return; }
    if (!celular) { showMessage('O campo Telefone é obrigatório.'); return; }
    
    // ── LIMPO: Trava clínica simplificada, validando apenas o que restou visível na tela ──
    const escondeClinico = get('inp-registro')?.closest('.field')?.style.display === 'none';
    if (!escondeClinico) {
        if (selectedSpecialties.length === 0) { showMessage('O campo Especialidade é obrigatório. Selecione ao menos uma.'); return; }
        if (!registroProfissional) { showMessage('O campo Registro Profissional é obrigatório.'); return; }
    }

    // Validações de endereço
    if (!cep || cep.length !== 8) { showMessage('O campo CEP é obrigatório e deve conter 8 dígitos.'); return; }
    if (!rua) { showMessage('O campo Rua/Logradouro é obrigatório.'); return; }
    if (!numero) { showMessage('O campo Número é obrigatório.'); return; }
    if (!bairro) { showMessage('O campo Bairro é obrigatório.'); return; }
    if (!city) { showMessage('O campo Cidade é obrigatório.'); return; }
    if (!estado) { showMessage('O campo Estado/UF é obrigatório.'); return; }

    if (isPJ) {
        if (!cnpj || cnpj.length !== 14) { showMessage('O campo CNPJ é obrigatório para PJ e deve conter 14 dígitos.'); return; }
        if (!razaoSocial) { showMessage('O campo Razão Social é obrigatório para PJ.'); return; }
    }

    try {
        const idEspecialidades = selectedSpecialties.map((spec) => spec.id);
        const endereco = { rua, numero, complemento, bairro, cidade: city, estado, cep };

        const payload = {
            nome,
            cpf,
            dataNascimento,
            ...(editId ? {} : { senhaProvisoria }),
            idEspecialidades,
            registroProfissional,
            email,
            celular,
            endereco,
            cnpj: isPJ ? cnpj : null,
            razaoSocial: isPJ ? razaoSocial : null,
            nomeFantasia: isPJ ? nomeFantasia : null,
            inscricaoEstadual: isPJ ? inscricaoEstadual : null,
        };

        const res = editId
            ? await atualizarProfissional(editId, payload)
            : await criarProfissional(payload);

        if (res && (res.status === 201 || res.status === 200)) {
            showMessage(editId ? 'Profissional updated com sucesso.' : 'Profissional criado com sucesso.', false);

            setTimeout(() => {
                window.location.href = 'gestao_profissionais.html';
            }, 1550);
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
        if (viewMode) return;

        const removeButton = event.target.closest('[data-remove-id]');
        if (!removeButton) return;
        removeSpec(Number(removeButton.dataset.removeId));
    });
    generatePasswordButton.addEventListener('click', gerarSenhaAutomatica);
    pjCheck.addEventListener('change', togglePJ);
    saveButton.addEventListener('click', handleSave);
    get('inp-cpf').addEventListener('input', formatCPF);
    get('inp-tel').addEventListener('input', formatPhone);
    get('inp-cep').addEventListener('input', formatCEP);
}

async function initialize() {
    attachListeners();
    await loadSpecialties();

    const professionalId = getQueryParam('id');
    console.log("ID capturado da URL:", professionalId);
    const mode = getQueryParam('mode');

    if (professionalId) {
        await loadProfessionalForEdit(Number(professionalId), mode || 'edit');
    }
}

initialize();