import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import cognitoConfig from "./CognitoConfig";

// 👇 1️⃣ Define the user shape
export interface AuthUser {
  idToken: string;
  sub: string; // Cognito unique user ID
  email: string;
  username: string;
}

// 👇 2️⃣ Define the context type
interface AuthContextType {
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
}

// 👇 3️⃣ Create the context with proper type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 👇 4️⃣ Type the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// 👇 5️⃣ AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // If no code, try to load token from localStorage
    if (!code) {
      const token = localStorage.getItem("idToken");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
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

    // If we have a new Cognito code, exchange it for tokens
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
        `&redirect_uri=${encodeURIComponent(cognitoConfig.redirectUri)}`,
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.id_token) {
          console.error("No id_token returned from Cognito:", data);
          return;
        }

        const decoded: any = jwtDecode(data.id_token);
        localStorage.setItem("idToken", data.id_token);

        // Optionally: Call your Lambda if needed
        try {
          await fetch(
            "https://f5xanmlhpc.execute-api.us-east-1.amazonaws.com/dev/Users",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.id_token}`,
              },
              body: JSON.stringify({ source: "cognito-login" }),
            }
          );
        } catch (err) {
          console.error("Lambda call failed:", err);
        }

        // Set user
        setUser({
          idToken: data.id_token,
          sub: decoded.sub,
          email: decoded.email,
          username: decoded.email?.split("@")[0] || "User",
        });

        // Clean URL
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

// 👇 6️⃣ useAuth hook with safe context type
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
