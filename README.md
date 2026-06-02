# Bot Ative Digital 🤖

Central interna de clientes para a Ative Digital, permitindo consulta rápida de acessos, links e notas operacionais diretamente pelo Discord.

## 🚀 Tecnologias

- [Node.js](https://nodejs.org/)
- [Discord.js](https://discord.js.org/)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- Banco de dados em JSON local

## 📂 Estrutura do Projeto

```text
src/
  index.js           # Ponto de entrada do bot
  deploy-commands.js # Script para registrar comandos slash
  commands/          # Definição dos comandos
  services/          # Lógica de negócio e persistência
  data/              # Armazenamento JSON
  utils/             # Utilitários e formatadores
```

## ⚙️ Configuração

### 1. Discord Developer Portal

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique em **"New Application"** e dê um nome (ex: Bot Ative Digital).
3. No menu lateral, vá em **"Bot"**:
   - Clique em **"Reset Token"** para gerar seu token. Copie e guarde.
   - Ative a opção **"Message Content Intent"** (opcional para slash commands, mas recomendado).
4. No menu lateral, vá em **"OAuth2"** -> **"URL Generator"**:
   - Marque os escopos: `bot`, `applications.commands`.
   - Marque as permissões do bot: `Send Messages`, `Embed Links`, `Read Message History`.
   - Copie a URL gerada e abra no seu navegador para convidar o bot para o seu servidor.

### 2. Ambiente Local

1. Clone o repositório ou baixe os arquivos.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para um novo arquivo chamado `.env`:
   ```bash
   cp .env.example .env
   ```
4. Preencha as variáveis no `.env`:
   - `DISCORD_TOKEN`: O token que você copiou do Developer Portal.
   - `CLIENT_ID`: ID da aplicação (encontrado em "General Information" no Portal).
   - `GUILD_ID`: ID do servidor do Discord onde você vai testar (clique com o botão direito no nome do servidor no Discord -> "Copy Server ID").

## 🛠️ Comandos

### Registrar Comandos
Antes de rodar o bot pela primeira vez (ou sempre que criar um novo comando), registre-os no Discord:
```bash
npm run deploy
```

### Iniciar o Bot
```bash
npm start
```

## 📋 Funcionalidades (Slash Commands)

- `/cliente-criar`: Registra um novo cliente.
- `/cliente-info`: Mostra todos os detalhes, acessos, links e notas de um cliente (buscando pelo slug).
- `/cliente-listar`: Lista todos os clientes cadastrados em formato de tabela simples.
- `/acesso-add`: Adiciona dados de acesso (login, senha, plataforma) a um cliente.
- `/link-add`: Adiciona links úteis (BM, Site, Drive, etc) a um cliente.
- `/nota-add`: Adiciona observações operacionais e notas internas.
- **Detecção Automática**: Ao digitar apenas a slug de um cliente no chat (ex: `dom-hari`), o bot responderá automaticamente com o embed de informações.

## 📝 Regras de Uso
- O **Slug** deve ser único e sem espaços (ex: `pizzaria-estrela`). Ele é usado como identificador em todos os outros comandos.
- Os dados são salvos em tempo real no arquivo `src/data/clientes.json`.
- **Importante**: Para a detecção automática de slug funcionar, o bot precisa da permissão **Message Content Intent** ativa no Discord Developer Portal.

---
Desenvolvido para **Ative Digital**.

## Deploy em VPS

Este projeto ja inclui arquivos para deploy automatico com GitHub Actions e PM2:

- `.github/workflows/deploy.yml`
- `ecosystem.config.cjs`
- `.gitignore`
- `docs/DEPLOY.md`

Veja o passo a passo completo em `docs/DEPLOY.md`.
