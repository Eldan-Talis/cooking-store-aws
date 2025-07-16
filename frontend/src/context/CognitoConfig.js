// src/cognitoConfig.js
const cognitoConfig = {
  domain: "us-east-10h3oc4brf.auth.us-east-1.amazoncognito.com",     // דומיין ה-Hosted UI
  clientId: "5c091bcc21e5cm79qfdf4boik9",                // App client ID
  clientSecret : "1ebjogkmv99o181c9v37r7uprslqvnas06lb7fc39dgga86jvv35", // App client secret
  redirectUri: "http://localhost:5173/",                 // כתובת החזרה אחרי ההתחברות
  responseType: "code",                                  // Authorization Code
  scope: "openid+email+phone"                            // הרשאות נדרשות
};

export default cognitoConfig;
