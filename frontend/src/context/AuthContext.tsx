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
