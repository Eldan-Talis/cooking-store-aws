import { useAuth } from "../context/AuthContext";

/* Re-use the same Review interface as the modal */
export interface Review {
  UserId: string;
  Username: string;
  ReviewText: string;
  CreatedAt: string;
}

function authHeaders(idToken?: string): HeadersInit {
  return idToken ? { Authorization: `Bearer ${idToken}` } : {};
}

/**
 *  Hook that exposes review-related API calls
 */
export function useReviewsApi() {
  const { user } = useAuth();
  const idToken = user?.idToken;

  /** GET /Recipes/{id}/Review  – public or authenticated */
  async function getReviews(recipeId: string): Promise<Review[]> {
    const res = await fetch(
      `https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Recipes/${recipeId}/Review`,
      { headers: authHeaders(idToken) }
    );

    if (!res.ok) throw new Error("Failed to load reviews");
    return res.json();
  }

  /** POST new review */
  async function createReview(recipeId: string, text: string): Promise<void> {
    if (!idToken) throw new Error("Not authenticated");
    
    console.log("Creating review with token:", idToken ? "Token exists" : "No token");
    console.log("Token length:", idToken?.length);
    
    const response = await fetch(`https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Recipes/${recipeId}/Review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(idToken),
      },
      body: JSON.stringify({ ReviewText: text }),
    });
    
    console.log("Create review response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Create review failed:", errorText);
      throw new Error(`Create review failed: ${response.status} - ${errorText}`);
    }
  }

  /** PUT edit review (only current user) */
  async function updateReview(recipeId: string, text: string): Promise<void> {
    if (!idToken) throw new Error("Not authenticated");
    await fetch(`https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/Recipes/${recipeId}/Review`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(idToken),
      },
      body: JSON.stringify({ ReviewText: text }),
    }).then((r) => {
      if (!r.ok) throw new Error("Update review failed");
    });
  }

  return { getReviews, createReview, updateReview };
}
