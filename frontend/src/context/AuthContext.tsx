// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import cognitoConfig from "./CognitoConfig";

/* ────────── user shape ────────── */
export interface AuthUser {
  idToken: string;
  sub: string;
  email?: string;
  username: string;
  profileImage?: string; // from Cognito “picture” claim, optional
}

/* ───────── context type ───────── */
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ───────── helper to decode token ───────── */
function decodeUser(token: string): AuthUser | null {
  try {
    const d = jwtDecode<JwtPayload & Record<string, any>>(token);
    return {
      idToken: token,
      sub: d.sub!,
      email: d.email,
      username:
        d["cognito:username"] ??
        d.username ??
        d.email?.split("@")[0] ??
        "user",
      profileImage: d.picture ?? undefined,
    };
  } catch {
    return null;
  }
}

/* ───────── provider ───────── */
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      /* 1️⃣  hydrate from localStorage if present */
      const stored = localStorage.getItem("idToken");
      if (stored) {
        const u = decodeUser(stored);
        if (u) setUser(u);
      }

      /* 2️⃣  handle Cognito redirect with ?code= */
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        setLoading(false);
        return;
      }

      /* avoid double-exchange in StrictMode / FastRefresh */
      if (sessionStorage.getItem("usedCognitoCode") === code) {
        setLoading(false);
        return;
      }
      sessionStorage.setItem("usedCognitoCode", code);

      try {
        /* 3️⃣  exchange code→tokens */
        const creds = btoa(
          `${cognitoConfig.clientId}:${cognitoConfig.clientSecret}`
        );
        const res = await fetch(
          `https://${cognitoConfig.domain}/oauth2/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${creds}`,
            },
            body:
              `grant_type=authorization_code` +
              `&client_id=${cognitoConfig.clientId}` +
              `&code=${code}` +
              `&redirect_uri=${encodeURIComponent(cognitoConfig.redirectUri)}`,
          }
        );

        const data = await res.json();
        if (!data.id_token) throw new Error("Missing id_token");

        /* 4️⃣  store and set user immediately */
        localStorage.setItem("idToken", data.id_token);
        const fresh = decodeUser(data.id_token);
        if (fresh) setUser(fresh);

        /* 5️⃣  optional Lambda call (fire-and-forget) */
        fetch(
          "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.id_token}`,
            },
            body: JSON.stringify({ source: "cognito-login" }),
          }
        ).catch(console.error);

        /* 6️⃣  remove ?code= from URL */
        window.history.replaceState({}, "", "/");
      } catch (err) {
        console.error("Cognito exchange failed:", err);
        localStorage.removeItem("idToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  /* ───────── helpers ───────── */
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ───────── hook ───────── */
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
