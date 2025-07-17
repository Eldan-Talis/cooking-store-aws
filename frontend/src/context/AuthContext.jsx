import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import cognitoConfig from "./CognitoConfig";

const AuthContext = createContext({
  user: null,
  login: () => { },
  logout: () => { }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // אם אין קוד – ננסה מה-localStorage
    if (!code) {
      const token = localStorage.getItem("idToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            idToken: token,
            sub: decoded.sub,
            email: decoded.email,
            username: decoded.email?.split("@")[0] || "User",
          });
        } catch {
          localStorage.removeItem("idToken");
        }
      }
      return;
    }

    // קוד Cognito קיים → נחליף בטוקן
    const usedCode = sessionStorage.getItem("usedCognitoCode");
    if (usedCode === code) return;
      sessionStorage.setItem("usedCognitoCode", code);
    const credentials = `${cognitoConfig.clientId}:${cognitoConfig.clientSecret}`;
    const encodedCredentials = btoa(credentials); // base64 encode  
    fetch(`https://${cognitoConfig.domain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${encodedCredentials}`
       },
      body:
        `grant_type=authorization_code` +
        `&client_id=${cognitoConfig.clientId}` + 
        `&code=${code}` +
        `&redirect_uri=${encodeURIComponent(cognitoConfig.redirectUri)}`
    })
      .then(res => res.json())
      .then(async (data) => {
        if (!data.id_token) {
          console.error("No id_token returned from Cognito:", data);
          return;
        }

        const decoded = jwtDecode(data.id_token);
        localStorage.setItem("idToken", data.id_token);

        // שליחת הטוקן ל־Lambda
         const res = await fetch("https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.id_token}`
            }
          })
          const json = await res.json();
          console.log("Lambda response JSON:", json);

        // הגדרת המשתמש
        setUser({
          idToken: data.id_token,
          sub: decoded.sub,
          email: decoded.email,
          username: decoded.email?.split("@")[0] || "User",
        });

        window.history.replaceState({}, "", "/");
      })
      .catch((err) => {
        console.error("Token exchange failed:", err);
      });
  }, []);

  const login = () => {
    const { domain, clientId, redirectUri, responseType, scope } = cognitoConfig;
    const authUrl =
      `https://${domain}/login?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&response_type=${encodeURIComponent(responseType)}` +
      `&scope=${scope}`+
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  };

  const logout = () => {
    localStorage.removeItem("idToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
