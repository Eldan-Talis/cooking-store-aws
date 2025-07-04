// src/cognitoConfig.js
const cognitoConfig = {
  domain: "us-east-1gwuidbewg.auth.us-east-1.amazoncognito.com",     // דומיין ה-Hosted UI
  clientId: "7tv78tnmj0g6n3cmsc4qb1757l",                // App client ID
  redirectUri: "http://localhost:5173",                  // כתובת החזרה אחרי ההתחברות
  responseType: "code",                                  // Authorization Code
  scope: "openid email phone"                            // הרשאות נדרשות
};

export default cognitoConfig;
