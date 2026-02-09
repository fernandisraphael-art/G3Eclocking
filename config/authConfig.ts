import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

/**
 * CONFIGURAÇÃO AZURE AD
 * 
 * Para usar autenticação Microsoft/Office 365:
 * 1. Acesse: https://portal.azure.com
 * 2. Vá para "Registros de aplicativo" 
 * 3. Clique em "Novo registro"
 * 4. Preencha:
 *    - Nome: G3Eclocking
 *    - Tipos de conta suportados: Contas em qualquer diretório organizacional (Qualquer Azure AD)
 *    - URI de redirecionamento: Web > http://localhost:3003
 * 5. Copie o "ID do aplicativo (cliente)" e cole abaixo em clientId
 * 6. Vá em "Certificados e segredos" > "Novo segredo do cliente"
 * 7. Copie o valor do segredo (você verá uma vez) - isso será usado no backend
 * 8. Vá em "Permissões de API" e adicione:
 *    - Microsoft Graph > user.read
 *    - Microsoft Graph > mail.send (para enviar lembretes)
 */

// Tenta usar variável de ambiente, caso contrário usa um Client ID genérico para modo de desenvolvimento
const CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || '04b07795-8ddb-461a-bbee-02f9e1bf7b46'; // Client ID de teste (Microsoft Graph Explorer)
const AUTHORITY = 'https://login.microsoftonline.com/common';
const REDIRECT_URI = import.meta.env.VITE_AZURE_REDIRECT_URI || (
  import.meta.env.MODE === 'production' 
    ? 'https://seu-dominio.com' 
    : 'http://localhost:3001'
);

export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: AUTHORITY,
    redirectUri: REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ['user.read'],
};

export const graphRequest = {
  scopes: ['user.read', 'mail.send'],
};

export const msalInstance = new PublicClientApplication(msalConfig);
