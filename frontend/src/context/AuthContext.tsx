// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import cognitoConfig from "./CognitoConfig";

/* ─────────── types ─────────── */
export interface AuthUser {
  idToken: string;
  accessToken?: string;
  sub: string;
  email?: string;
  username: string;
  profileImage?: string;
  groups?: string[];           // e.g. ["Admin"]
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ─── helper: build a user object from the tokens ─── */
function buildUser(idTok: string, accTok?: string): AuthUser | null {
  try {
    const id = jwtDecode<Record<string, any>>(idTok);

    /* pull groups from access-token (it carries cognito:groups) */
    let groups: string[] | undefined;
    if (accTok) {
      const raw = jwtDecode<any>(accTok)["cognito:groups"];
      if (Array.isArray(raw)) groups = raw;
      else if (typeof raw === "string" && raw.trim() !== "")
        groups = [raw];
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /* ------------ bootstrap on first render ------------ */
    (async () => {
      /* 1️⃣  hydrate from localStorage (page refresh) */
      const storedId = localStorage.getItem("idToken");
      const storedAcc = localStorage.getItem("accessToken");
      if (storedId) {
        const u = buildUser(storedId, storedAcc ?? undefined);
        if (u) setUser(u);
      }
      
      // Mark loading as complete after initial hydration
      setIsLoading(false);

      /* 2️⃣  handle Cognito redirect with ?code= */
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) return;

      /* avoid double exchange (StrictMode / hot-reload) */
      if (sessionStorage.getItem("usedCognitoCode") === code) return;
      sessionStorage.setItem("usedCognitoCode", code);

      try {
        /* 3️⃣  exchange code → tokens */
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
              `&redirect_uri=${encodeURIComponent(
                cognitoConfig.redirectUri
              )}`,
          }
        );

        const data = await res.json();
        if (!data.id_token) throw new Error("Missing id_token");

        /* 4️⃣  store tokens */
        localStorage.setItem("idToken", data.id_token);
        if (data.access_token) {
          localStorage.setItem("accessToken", data.access_token);
        }

        /* 5️⃣  build user (now contains groups) */
        const fresh = buildUser(data.id_token, data.access_token);
        if (fresh) setUser(fresh);

        /* 6️⃣  (optional) notify your backend */
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

        /* 7️⃣  clean the URL */
        window.history.replaceState({}, "", "/");
      } catch (err) {
        console.error("AuthContext: token exchange failed", err);
        localStorage.removeItem("idToken");
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    })();
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
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
