# Deploy no GitHub + VPS + GitHub Actions

Este projeto e um bot Discord em Node.js. Ele nao precisa de build: em producao ele roda com `node src/index.js`.

O fluxo recomendado e:

1. O codigo fica no GitHub.
2. A VPS roda o bot com PM2.
3. O arquivo `.env` fica somente na VPS.
4. O arquivo de dados `clientes.json` fica fora do repositorio, em uma pasta persistente da VPS.
5. A cada push na branch `main`, o GitHub Actions acessa a VPS por SSH, atualiza o codigo e reinicia o bot.

## 1. Arquivos importantes adicionados

- `.gitignore`: impede subir `node_modules`, `.env` e `src/data/clientes.json`.
- `ecosystem.config.cjs`: configuracao do PM2 para manter o bot online.
- `.github/workflows/deploy.yml`: workflow de deploy automatico por SSH.
- `.env.example`: modelo das variaveis de ambiente.

## 2. Preparar o repositorio local

Na pasta do projeto:

```bash
git init
git branch -M main
git add .
git status
git commit -m "Initial deploy setup"
```

Confirme no `git status` que estes arquivos NAO aparecem para commit:

- `.env`
- `node_modules/`
- `src/data/clientes.json`

## 3. Criar o repositorio no GitHub

Crie um repositorio vazio no GitHub, sem README inicial.

Depois conecte o remoto local:

```bash
git remote add origin git@github.com:SEU_USUARIO/ativebot_discord.git
git push -u origin main
```

Se preferir HTTPS:

```bash
git remote add origin https://github.com/SEU_USUARIO/ativebot_discord.git
git push -u origin main
```

## 4. Preparar a VPS

Os comandos abaixo assumem Ubuntu/Debian.

Entre na VPS:

```bash
ssh usuario@IP_DA_VPS
```

Atualize pacotes:

```bash
sudo apt update
sudo apt upgrade -y
```

Instale Git, Node.js e npm. Exemplo com NodeSource para Node 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
```

Instale PM2:

```bash
sudo npm install -g pm2
```

Crie a pasta persistente dos dados:

```bash
sudo mkdir -p /var/lib/ativebot
sudo chown -R "$USER":"$USER" /var/lib/ativebot
```

## 5. Permitir que a VPS puxe o repositorio

Se o repositorio for publico, voce pode clonar por HTTPS.

Se for privado, o melhor e criar uma chave SSH na VPS:

```bash
ssh-keygen -t ed25519 -C "ativebot-vps-deploy" -f ~/.ssh/ativebot_github
cat ~/.ssh/ativebot_github.pub
```

No GitHub:

1. Abra o repositorio.
2. Va em `Settings`.
3. Va em `Deploy keys`.
4. Clique em `Add deploy key`.
5. Cole a chave publica mostrada no comando `cat`.
6. Marque apenas permissao de leitura.

Configure o SSH da VPS para usar essa chave:

```bash
nano ~/.ssh/config
```

Adicione:

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/ativebot_github
  IdentitiesOnly yes
```

Teste:

```bash
ssh -T git@github.com
```

## 6. Clonar o projeto na VPS

Escolha uma pasta para o projeto. Exemplo:

```bash
mkdir -p ~/apps
cd ~/apps
git clone git@github.com:SEU_USUARIO/ativebot_discord.git
cd ativebot_discord
```

Instale dependencias:

```bash
npm ci --omit=dev
```

## 7. Criar o `.env` na VPS

Na pasta do projeto da VPS:

```bash
nano .env
```

Conteudo:

```env
DISCORD_TOKEN=seu_token_do_discord
CLIENT_ID=id_da_aplicacao
GUILD_ID=id_do_servidor
CLIENTES_DATA_PATH=/var/lib/ativebot/clientes.json
```

Importante: esse arquivo nao deve ser enviado ao GitHub.

## 8. Migrar dados existentes, se necessario

Se voce ja tem clientes cadastrados neste computador local, copie uma vez o arquivo `src/data/clientes.json` para a VPS.

No seu computador local:

```bash
scp src/data/clientes.json usuario@IP_DA_VPS:/var/lib/ativebot/clientes.json
```

Depois, na VPS:

```bash
chmod 600 /var/lib/ativebot/clientes.json
```

## 9. Registrar os slash commands do Discord

Na VPS, dentro da pasta do projeto:

```bash
npm run deploy
```

Esse comando registra os comandos `/cliente-criar`, `/cliente-info`, `/acesso-add` e os demais no servidor configurado em `GUILD_ID`.

## 10. Iniciar o bot com PM2

Na VPS, dentro da pasta do projeto:

```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

O comando `pm2 startup` vai imprimir outro comando com `sudo`. Copie e execute exatamente como ele mostrar.

Confira se esta online:

```bash
pm2 status
pm2 logs ativebot-discord
```

## 11. Criar chave SSH para o GitHub Actions acessar a VPS

No seu computador local, crie uma chave separada para o GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions-ativebot" -f ./github_actions_ativebot
```

Isso cria:

- `github_actions_ativebot`: chave privada.
- `github_actions_ativebot.pub`: chave publica.

Copie a chave publica para a VPS:

```bash
ssh-copy-id -i ./github_actions_ativebot.pub usuario@IP_DA_VPS
```

Teste:

```bash
ssh -i ./github_actions_ativebot usuario@IP_DA_VPS
```

## 12. Configurar secrets no GitHub

No GitHub:

1. Abra o repositorio.
2. Va em `Settings`.
3. Va em `Secrets and variables`.
4. Va em `Actions`.
5. Clique em `New repository secret`.

Crie estes secrets:

| Secret | Valor |
| --- | --- |
| `VPS_HOST` | IP ou dominio da VPS |
| `VPS_USER` | usuario SSH da VPS |
| `VPS_PORT` | porta SSH, geralmente `22` |
| `VPS_PROJECT_PATH` | caminho do projeto na VPS, ex: `/home/usuario/apps/ativebot_discord` |
| `VPS_SSH_KEY` | conteudo da chave privada `github_actions_ativebot` |

Para ver a chave privada:

```bash
cat github_actions_ativebot
```

Cole o conteudo inteiro, incluindo:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## 13. Como funciona o deploy automatico

O arquivo `.github/workflows/deploy.yml` roda a cada push na branch `main`.

Ele executa na VPS:

```bash
cd "$VPS_PROJECT_PATH"
git fetch origin main
git reset --hard origin/main
npm ci --omit=dev
npm run deploy
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save
```

Ou seja: atualiza o codigo, reinstala dependencias, registra slash commands e reinicia o bot.

## 14. Testar o deploy

Faca uma alteracao pequena no projeto, por exemplo no README, e envie:

```bash
git add .
git commit -m "Test automatic deploy"
git push
```

No GitHub, va em:

```text
Actions > Deploy VPS
```

Abra a execucao e confira se terminou com sucesso.

Na VPS:

```bash
pm2 status
pm2 logs ativebot-discord
```

## 15. Cuidados importantes

- Nunca suba `.env` para o GitHub.
- Nunca suba `src/data/clientes.json` se ele contem clientes, logins ou senhas.
- Se trocar comandos slash, o workflow ja roda `npm run deploy`.
- Se o bot parar, veja logs com `pm2 logs ativebot-discord`.
- Se o deploy falhar no `git fetch`, a VPS provavelmente nao tem acesso ao repositorio.
- Se o deploy falhar no SSH, revise `VPS_HOST`, `VPS_USER`, `VPS_PORT` e `VPS_SSH_KEY`.

