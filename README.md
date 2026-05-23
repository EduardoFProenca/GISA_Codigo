# GISA — Arquitetura MVC

## Estrutura de pastas

```
GISA/
├── index.html                          ← Login (ponto de entrada)
├── controllers/
│   └── authController.js               ← Login, logout, proteção de rotas
├── models/
│   ├── Usuario.js                      ← Autenticação + perfis + rotas
│   ├── Profissional.js                 ← Corpo clínico da APAE
│   ├── Paciente.js                     ← Pacientes atendidos + consultas
│   └── Agenda.js                       ← Agenda diária do profissional
├── views/
│   ├── coordenacao/
│   │   ├── dashboard.html              ← Portal Administrativo
│   │   ├── gestao_profissionais.html   ← Listagem do corpo clínico
│   │   └── cadastro_profissional.html  ← Formulário de cadastro
│   ├── medico/
│   │   └── dashboard.html              ← Portal do Profissional ✱
│   ├── paciente/
│   │   └── dashboard.html              ← Portal do Paciente ✱
│   ├── recepcionista/
│   │   └── dashboard.html
│   ├── secretaria/
│   │   └── dashboard.html
│   └── assistente_social/
│       └── dashboard.html
├── css/
│   └── style.css
├── js/
│   └── utils.js
└── assets/
```

---

## Perfis e portais

| Perfil             | Portal                              | Acesso                        |
|--------------------|-------------------------------------|-------------------------------|
| `coordenacao`      | views/coordenacao/dashboard.html    | Admin geral, gestão de equipe |
| `medico`           | views/medico/dashboard.html ✱       | **Portal do Profissional**    |
| `paciente`         | views/paciente/dashboard.html ✱     | **Portal do Paciente**        |
| `recepcionista`    | views/recepcionista/dashboard.html  | Agendamentos                  |
| `secretaria`       | views/secretaria/dashboard.html     | Administrativo                |
| `assistente_social`| views/assistente_social/dashboard.html | Apoio social               |

> ✱ **`medico` e `paciente` são perfis completamente distintos.**
> - O profissional vê sua agenda, receitas, e busca pacientes.
> - O paciente vê suas próprias consultas, histórico e evolução.

---

## Fluxo de autenticação

```
index.html
  └─ models/Usuario.js  (carregado primeiro)
  └─ controllers/authController.js
       ├── fazerLogin()
       │     └── Usuario.autenticar(id, senha)  → sessao
       │     └── Usuario.rotaPorPerfil(perfil)  → redireciona
       ├── exigirLogin(perfil)  ← usado em cada dashboard
       └── logout()
```

---

## Como usar os Models em cada view

### Portal do Profissional (views/medico/dashboard.html)
```html
<script src="../../models/Usuario.js"></script>
<script src="../../models/Profissional.js"></script>
<script src="../../models/Agenda.js"></script>
<script src="../../controllers/authController.js"></script>
<script>
  const usuario     = exigirLogin('medico');          // protege a rota
  const profissional = Profissional.buscarPorUsuario(usuario.profissionalId);
  const agendaHoje  = Agenda.hojeDoProfi(profissional.id);
</script>
```

### Portal do Paciente (views/paciente/dashboard.html)
```html
<script src="../../models/Usuario.js"></script>
<script src="../../models/Paciente.js"></script>
<script src="../../controllers/authController.js"></script>
<script>
  const usuario   = exigirLogin('paciente');          // protege a rota
  const paciente  = Paciente.buscarPorUsuario(usuario.pacienteId);
  const proximas  = Paciente.proximasConsultas(paciente.id);
  const historico = Paciente.historicoConsultas(paciente.id);
</script>
```

### Gestão de Profissionais (views/coordenacao/)
```html
<script src="../../models/Usuario.js"></script>
<script src="../../models/Profissional.js"></script>
<script src="../../controllers/authController.js"></script>
<script>
  exigirLogin('coordenacao');
  const lista = Profissional.listarAtivos();
  // ou: Profissional.buscar('termo de busca');
</script>
```

---

## Próximos passos (segurança)

- [ ] Substituir os dados mock por chamadas a uma API/banco real
- [ ] Hash de senhas com bcrypt no backend
- [ ] JWT ou session server-side (sessionStorage é apenas client-side)
- [ ] Validação de perfil também no backend (nunca só no frontend)
