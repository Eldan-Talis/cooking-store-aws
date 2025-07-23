import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import cognitoConfig from "./CognitoConfig";

/* ─────────── user shape ─────────── */
export interface AuthUser {
  idToken: string;
  accessToken?: string;
  sub: string;
  email?: string;
  username: string;
  profileImage?: string;
  groups?: string[];               // Admin, etc.
}

/* ───────── context type ────────── */
interface AuthContextType {
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
}

// 👇 3️⃣ Create the context with proper type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ───────── helper: build user ───────── */
function buildUser(idTok: string, accTok?: string): AuthUser | null {
  try {
    const id = jwtDecode< Record<string, any>>(idTok);

    /* groups come from access-token */
    let groups: string[] | undefined;
    if (accTok) {
      const raw = jwtDecode<any>(accTok)["cognito:groups"];
      if (Array.isArray(raw)) groups = raw;
      else if (typeof raw === "string" && raw.trim() !== "") groups = [raw];
    }

    return {
      idToken: idTok,
      accessToken: accTok,
      sub: id.sub!,
      email: id.email,
      username:
        id["cognito:username"] ??
        id.username ??
        id.email?.split("@")[0] ??
        "user",
      profileImage: id.picture,
      groups,
    };
  } catch {
    return null;
  }
}

/* ───────── provider ───────── */
interface AuthProviderProps {
  children: ReactNode;
}

// 👇 5️⃣ AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    console.log("AuthContext - URL code:", code);

    // If no code, try to load token from localStorage
    if (!code) {
      const token = localStorage.getItem("idToken");
      console.log("AuthContext - Token from localStorage:", token ? "exists" : "not found");
      console.log("AuthContext - Token length:", token?.length);
      
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          console.log("AuthContext - Decoded token:", decoded);
          setUser({
            idToken: token,
            sub: decoded.sub,
            email: decoded.email,
            username: decoded.email?.split("@")[0] || "User",
          });
          console.log("AuthContext - User set successfully");
        } catch (error) {
          console.error("AuthContext - Error decoding token:", error);
          localStorage.removeItem("idToken");
        }
      } else {
        console.log("AuthContext - No token found in localStorage");
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
            "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users",
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
          username: decoded.username,
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
      `&scope=${scope}` +
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
