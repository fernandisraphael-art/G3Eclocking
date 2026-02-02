# Configuração de Autenticação Microsoft Office 365

## Como Configurar o Acesso com Conta Microsoft

### 1. Criar Aplicação no Azure AD

1. Acesse [Azure Portal](https://portal.azure.com)
2. Busque por "Registros de aplicativo"
3. Clique em **"Novo registro"**
4. Preencha com:
   - **Nome**: G3Eclocking
   - **Tipos de conta suportados**: "Contas em qualquer diretório organizacional (Qualquer Azure AD)"
   - **URI de redirecionamento**: Selecione "Web" e coloque `http://localhost:3003`
5. Clique em **"Registrar"**

### 2. Copiar ID do Cliente

1. Após registrar, você verá a página de visão geral do aplicativo
2. Copie o **"ID do aplicativo (cliente)"** (também chamado de Client ID)
3. Abra o arquivo `/config/authConfig.ts`
4. Substitua `YOUR_AZURE_CLIENT_ID_HERE` pelo seu Client ID

### 3. Configurar Permissões da API

1. No registro do aplicativo, vá em **"Permissões de API"**
2. Clique em **"Adicionar uma permissão"**
3. Selecione **"Microsoft Graph"** > **"Permissões delegadas"**
4. Procure e selecione:
   - `user.read` - Para ler dados do usuário
   - `mail.send` - Para enviar lembretes por email

### 4. Para Produção

1. Em **"Certificados e segredos"**, crie um novo **"Segredo do cliente"**
2. Copie o valor (você verá apenas uma vez)
3. Este valor será usado no backend para autenticação de servidor
4. Altere a `REDIRECT_URI` em `authConfig.ts` para seu domínio de produção

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
VITE_AZURE_CLIENT_ID=SEU_CLIENT_ID_AQUI
VITE_AZURE_TENANT_ID=seu-tenant-id (opcional, para contas específicas)
```

## Teste Local

Enquanto configura o Azure AD, você pode usar o **modo de teste** na tela de login:
- Uma lista de dropdown com usuários pré-configurados aparecerá
- Selecione um usuário para testar a aplicação
- **Remova este dropdown antes de ir para produção!**

## Fluxo de Autenticação

1. Usuário clica em "Entrar com Microsoft"
2. MSAL abre popup de login Microsoft
3. Usuário faz login com conta Office 365
4. Sistema verifica se email existe na base de dados
5. Se existir, faz login
6. Se não existir, cria novo usuário com dados do Microsoft

## Envio de Lembretes por Email

Após login com Microsoft, a funcionalidade de envio de lembretes usa:
- **Microsoft Graph API** para enviar emails
- Scope: `mail.send`
- Os emails são enviados a partir da conta do usuário autenticado

## Troubleshooting

### Erro: "Client ID not configured"
- Verifique se `authConfig.ts` tem o Client ID correto
- Reconfigure em `VITE_AZURE_CLIENT_ID`

### Popup de login não abre
- Verifique se popups estão bloqueados no navegador
- Whitelist `login.microsoftonline.com`

### Email não pode ser enviado
- Verifique se a permissão `mail.send` foi concedida
- Verifique se o usuário tem acesso ao Outlook

## Documentação Oficial

- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD Application Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview)
