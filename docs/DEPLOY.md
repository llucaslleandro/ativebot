# Deploy no GitHub + VPS + GitHub Actions

Este guia esta ajustado para o contexto atual:

- VPS acessada como `root`.
- Projeto instalado em `/home/ativebot`.
- Dados locais existentes em `src/data/clientes.json`.
- Dados de producao persistentes em `/home/ativebot/data/clientes.json`.
- Bot rodando com PM2.
- Deploy automatico pelo GitHub Actions a cada push na branch `main`.

O ponto mais importante: o arquivo de dados nao deve ficar dentro da pasta do repositorio em producao. O deploy usa `git reset --hard`, entao os dados precisam ficar fora do codigo versionado.

## 1. O que ja foi preparado no projeto

Estes arquivos ja existem no projeto:

- `.gitignore`: impede subir `.env`, `node_modules`, chaves SSH e `src/data/clientes.json`.
- `.github/workflows/deploy.yml`: workflow de deploy automatico por SSH.
- `ecosystem.config.cjs`: configuracao do PM2.
- `.env.example`: modelo das variaveis.
- `src/services/clientesService.js`: aceita `CLIENTES_DATA_PATH`.

O caminho configurado para os dados em producao e:

```text
/home/ativebot/data/clientes.json
```

## 2. Preparar o Git local

Na sua maquina local, dentro da pasta do projeto:

```bash
git status
git add .
git status
git commit -m "Configure VPS deploy"
```

Antes do commit, confira que estes arquivos nao aparecem no `git status`:

- `.env`
- `node_modules/`
- `src/data/clientes.json`
- `github_actions_ativebot`
- `github_actions_ativebot.pub`

Se algum deles aparecer, pare e revise o `.gitignore`.

## 3. Criar o repositorio no GitHub

Crie um repositorio vazio no GitHub, sem README inicial.

Depois, na sua maquina local, conecte o remoto:

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

Entre na VPS:

```bash
ssh root@IP_DA_VPS
```

Atualize pacotes:

```bash
apt update
apt upgrade -y
```

Instale Node.js 20, npm e Git:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git
```

Confira:

```bash
node -v
npm -v
git --version
```

Instale PM2:

```bash
npm install -g pm2
```

## 5. Criar a pasta persistente dos dados

Mesmo que o repositorio tenha a pasta `src/data`, crie uma pasta separada para os dados de producao:

```bash
mkdir -p /home/ativebot/data
```

Por que isso e necessario?

- `src/data/clientes.json` nao deve ir para o GitHub porque contem dados sensiveis.
- O deploy automatico atualiza a pasta do projeto com `git reset --hard`.
- Mantendo os dados em `/home/ativebot/data/clientes.json`, eles nao sao apagados nem sobrescritos pelo deploy.

## 6. Migrar seus dados locais existentes

Como voce ja tem dados locais, copie uma vez o arquivo local:

```text
src/data/clientes.json
```

para a VPS em:

```text
/home/ativebot/data/clientes.json
```

Na sua maquina local, rode:

```bash
scp src/data/clientes.json root@IP_DA_VPS:/home/ativebot/data/clientes.json
```

Na VPS, confira se o arquivo chegou:

```bash
ls -lh /home/ativebot/data/clientes.json
```

Proteja o arquivo:

```bash
chmod 600 /home/ativebot/data/clientes.json
```

## 7. Permitir que a VPS puxe o repositorio do GitHub

Se o repositorio for publico, voce pode clonar por HTTPS e pular a parte da deploy key.

Se o repositorio for privado, crie uma chave SSH na VPS:

```bash
ssh-keygen -t ed25519 -C "ativebot-vps-github" -f ~/.ssh/ativebot_github
cat ~/.ssh/ativebot_github.pub
```

No GitHub:

1. Abra o repositorio.
2. Va em `Settings`.
3. Va em `Deploy keys`.
4. Clique em `Add deploy key`.
5. Cole a chave publica exibida pelo comando `cat`.
6. Deixe permissao somente de leitura.

Configure a VPS para usar essa chave:

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

## 8. Clonar o projeto na VPS

Use `/home/ativebot/app` para o codigo do projeto:

```bash
mkdir -p /home/ativebot/app
cd /home/ativebot/app
git clone git@github.com:SEU_USUARIO/ativebot_discord.git .
```

Se o repositorio for publico e voce preferir HTTPS:

```bash
mkdir -p /home/ativebot/app
cd /home/ativebot/app
git clone https://github.com/SEU_USUARIO/ativebot_discord.git .
```

Instale dependencias:

```bash
npm ci --omit=dev
```

## 9. Criar o `.env` na VPS

Na VPS, dentro do projeto:

```bash
cd /home/ativebot/app
nano .env
```

Conteudo:

```env
DISCORD_TOKEN=seu_token_do_discord
CLIENT_ID=id_da_aplicacao
GUILD_ID=id_do_servidor
CLIENTES_DATA_PATH=/home/ativebot/data/clientes.json
```

Salve o arquivo.

Importante: o `.env` fica somente na VPS. Ele nao deve ir para o GitHub.

## 10. Confirmar a configuracao do PM2

O arquivo `ecosystem.config.cjs` deve apontar para:

```js
CLIENTES_DATA_PATH: '/home/ativebot/data/clientes.json'
```

Esse caminho precisa bater com o `.env`.

## 11. Registrar os slash commands do Discord

Na VPS:

```bash
cd /home/ativebot/app
npm run deploy
```

Esse comando registra os comandos `/cliente-criar`, `/cliente-info`, `/acesso-add` e os demais no servidor configurado em `GUILD_ID`.

## 12. Iniciar o bot com PM2

Na VPS:

```bash
cd /home/ativebot/app
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

O comando `pm2 startup` vai imprimir outro comando. Copie e execute exatamente como ele mostrar.

Confira se esta online:

```bash
pm2 status
pm2 logs ativebot-discord
```

## 13. Criar chave SSH para o GitHub Actions acessar a VPS

Na sua maquina local, crie uma chave separada para o GitHub Actions.

No PowerShell, rode:

```bash
ssh-keygen -t ed25519 -C "github-actions-ativebot" -f ./github_actions_ativebot
```

Isso cria:

- `github_actions_ativebot`: chave privada.
- `github_actions_ativebot.pub`: chave publica.

No Windows, `ssh-copy-id` geralmente nao existe. Entao copie a chave publica manualmente:

```powershell
type .\github_actions_ativebot.pub
```

Copie a linha inteira. Ela precisa comecar com `ssh-ed25519` e terminar com `github-actions-ativebot`.

Entre na VPS:

```bash
ssh root@IP_DA_VPS
```

Na VPS:

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
```

Cole a chave publica no final do arquivo, em uma unica linha. Nao cole a chave privada. Chave publica comeca com `ssh-ed25519`; chave privada comeca com `-----BEGIN OPENSSH PRIVATE KEY-----`.

Depois ajuste permissoes:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Volte ao PowerShell.

Teste:

```powershell
ssh -i ./github_actions_ativebot root@IP_DA_VPS
```

Se pedir senha, a chave foi recusada. Nesse caso, confira se a linha em `authorized_keys` e exatamente igual ao conteudo de `github_actions_ativebot.pub`, sem `...`, sem quebras de linha e sem caracteres faltando.

## 14. Configurar secrets no GitHub

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
| `VPS_USER` | `root` |
| `VPS_PORT` | `22`, a menos que sua SSH use outra porta |
| `VPS_PROJECT_PATH` | `/home/ativebot/app` |
| `VPS_SSH_KEY` | conteudo inteiro da chave privada `github_actions_ativebot` |

Para ver a chave privada local:

```bash
cat github_actions_ativebot
```

Cole o conteudo inteiro, incluindo:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## 15. Como o deploy automatico funciona

O workflow `.github/workflows/deploy.yml` roda a cada push na branch `main`.

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

Como os dados estao em `/home/ativebot/data/clientes.json`, o `git reset --hard` atualiza apenas o codigo em `/home/ativebot/app` e nao mexe nos clientes cadastrados.

## 16. Testar o deploy automatico

Na sua maquina local, faca uma alteracao pequena, depois:

```bash
git add .
git commit -m "Test automatic deploy"
git push
```

No GitHub, abra:

```text
Actions > Deploy VPS
```

Confira se a execucao terminou com sucesso.

Na VPS:

```bash
pm2 status
pm2 logs ativebot-discord
```

## 17. Checklist final

Antes de considerar pronto:

- O repositorio esta no GitHub.
- `.env` nao foi enviado ao GitHub.
- `src/data/clientes.json` nao foi enviado ao GitHub.
- O arquivo local `src/data/clientes.json` foi copiado para `/home/ativebot/data/clientes.json`.
- O `.env` da VPS contem `CLIENTES_DATA_PATH=/home/ativebot/data/clientes.json`.
- O secret `VPS_PROJECT_PATH` no GitHub esta como `/home/ativebot/app`.
- `pm2 status` mostra `ativebot-discord` online.
- Um push na branch `main` dispara o workflow `Deploy VPS`.

## 18. Comandos uteis de manutencao TESTE

Ver logs:

```bash
pm2 logs ativebot-discord
```

Reiniciar manualmente:

```bash
pm2 restart ativebot-discord
```

Ver processos:

```bash
pm2 status
```

Ver se os dados existem:

```bash
ls -lh /home/ativebot/data/clientes.json
```

Fazer backup manual dos dados:

```bash
cp /home/ativebot/data/clientes.json /home/ativebot/data/clientes.backup.json
```
