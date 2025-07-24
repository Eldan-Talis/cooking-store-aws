const CHATBOT_API_URL = "https://6atvdcxzgf.execute-api.us-east-1.amazonaws.com/dev/chat";

export async function askChefBot(message: string): Promise<string> {
  const res = await fetch(CHATBOT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    console.error("ChefBot API error:", res.status);
    return "Sorry, something went wrong.";
  }

  const data = await res.json();
  return data.reply || "Sorry, no reply.";
}
