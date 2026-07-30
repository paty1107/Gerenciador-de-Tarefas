# 📋 Gerenciador de Tarefas

Sistema web para gerenciamento de tarefas com autenticação de usuários, controle de permissões e painel administrativo.

O projeto permite que usuários criem e gerenciem suas tarefas, enquanto administradores podem controlar usuários, permissões e visualizar tarefas cadastradas.

## 🚀 Funcionalidades

### 👤 Usuários

* Cadastro e login de usuários
* Autenticação utilizando dados armazenados no sistema
* Controle de acesso por perfil:

  * Usuário comum
  * Administrador

### ✅ Gerenciamento de tarefas

* Criar tarefas
* Editar tarefas
* Excluir tarefas
* Marcar tarefas como concluídas
* Pesquisar tarefas pelo título

### 🔐 Painel Administrativo

* Visualização de usuários cadastrados
* Alteração de permissões
* Bloqueio e desbloqueio de usuários
* Exclusão de usuários
* Visualização e gerenciamento das tarefas dos usuários

### 🎨 Interface

* Tema claro e escuro
* Layout responsivo
* Interface desenvolvida com componentes modernos

---

## 🛠️ Tecnologias utilizadas

* [Next.js](https://nextjs.org/)
* React
* TypeScript
* Tailwind CSS
* JSON Server (API de testes)
* Git e GitHub

---

## 📦 Instalação

Clone o repositório:

```bash
git clone git@github.com:paty1107/Gerenciador-de-Tarefas.git
```

Entre na pasta do projeto:

```bash
cd Gerenciador-de-Tarefas
```

Instale as dependências:

```bash
npm install
```

---

## ▶️ Executando o projeto

Inicie o servidor da API:

```bash
npm run server
```

Em outro terminal, execute o projeto:

```bash
npm run dev
```

Acesse:

```
http://localhost:3000
```

---

## 🔑 Usuário administrador de teste

Exemplo:

```
E-mail:
teste@gmail.com

Senha:
********
```

---

## 📁 Estrutura do projeto

```
Gerenciador-de-Tarefas
│
├── app
│   ├── login
│   ├── tarefas
│   └── admin
│
├── components
│
├── public
│
├── db.json
│
├── package.json
│
└── README.md
```

---

## 📌 Próximas melhorias

* Sistema de recuperação de senha
* Notificações de tarefas
* Filtros avançados
* Banco de dados real
* Deploy em produção

---

## 👩‍💻 Autor

Patricia Carvalho

Projeto desenvolvido para estudo e prática de desenvolvimento web com React, Next.js e TypeScript.
