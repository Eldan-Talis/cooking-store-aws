import { useAuth } from "../context/AuthContext";
import { useCallback } from "react";

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  role?: string;
  status?: string;
  joinDate?: string;
  lastLogin?: string;
  recipesCount?: number;
  favoritesCount?: number;
}

export async function getUsersFromDatabase(idToken: string): Promise<DatabaseUser[]> {
  if (!idToken) {
    throw new Error("Authentication token required");
  }

  console.log("Fetching users from database with token:", idToken ? "Token exists" : "No token");
  console.log("Token length:", idToken?.length);
  console.log("Token starts with:", idToken?.substring(0, 20) + "...");
  console.log("Full Authorization header:", `Bearer ${idToken}`);

  const response = await fetch(
    "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Users",
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Database users response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch users from database:", errorText);
    throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Database users data:", data);
  
  return data as DatabaseUser[];
}

// Hook to use the database users API
export function useDatabaseUsers() {
  const { user } = useAuth();

  const fetchUsers = useCallback(async (): Promise<DatabaseUser[]> => {
    if (!user?.idToken) {
      throw new Error("User not authenticated");
    }
    return await getUsersFromDatabase(user.idToken);
  }, [user?.idToken]);

  return { fetchUsers };
} 