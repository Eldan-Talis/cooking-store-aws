import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
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
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ───────── helper: build user ───────── */
function buildUser(idTok: string, accTok?: string): AuthUser | null {
  try {
    const id = jwtDecode<JwtPayload & Record<string, any>>(idTok);

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      /* 1️⃣  hydrate from localStorage */
      const storedId = localStorage.getItem("idToken");
      const storedAcc = localStorage.getItem("accessToken");
      if (storedId) {
        const u = buildUser(storedId, storedAcc ?? undefined);
        if (u) setUser(u);
      }

      /* 2️⃣  handle ?code= after Cognito redirect */
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        setLoading(false);
        return;
      }
      if (sessionStorage.getItem("usedCognitoCode") === code) {
        setLoading(false);
        return;
      }
      sessionStorage.setItem("usedCognitoCode", code);

      try {
        /* exchange code → tokens */
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

        /* 3️⃣  store tokens */
        localStorage.setItem("idToken", data.id_token);
        localStorage.setItem("accessToken", data.access_token);

        /* 4️⃣  create user object */
        const fresh = buildUser(data.id_token, data.access_token);
        if (fresh) setUser(fresh);

        /* 5️⃣  fire-and-forget Lambda */
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

        /* 6️⃣  clean URL */
        window.history.replaceState({}, "", "/");
      } catch (err) {
        console.error("Cognito exchange failed:", err);
        localStorage.removeItem("idToken");
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───────── helpers ───────── */
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
