// src/cognitoConfig.js
const cognitoConfig = {
  domain: "us-east-1ecygb8ebs.auth.us-east-1.amazoncognito.com",     // דומיין ה-Hosted UI
  clientId: "4he7cfru5ndv29ismusc29emef",                // App client ID
  clientSecret : "1k4i4m2rhs7pn1usqr605i65p0eo97o0h2kb98c7df98ijnnhq7m", // App client secret
  redirectUri: "http://localhost:5173/",                  // כתובת החזרה אחרי ההתחברות
  responseType: "code",                                  // Authorization Code
  scope: "openid+email+phone"                            // הרשאות נדרשות
};

export default cognitoConfig;
