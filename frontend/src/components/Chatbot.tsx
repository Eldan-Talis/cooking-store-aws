import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import chefIcon from "../assets/chef.png";
import { useAuth } from "../context/AuthContext";
import { askChefBot } from "../API/chatBot";

/**
 * CenteredChatbot – now renders bot replies as Markdown so recipes, lists,
 * headings, etc. show nicely.  Pure React + inline CSS (no Tailwind).
 */
export default function CenteredChatbot() {
  /* ---------- auth ---------- */
  const { user } = useAuth();
  const userName = user?.username || "You";

  /* ---------- state ---------- */
  type ChatMsg = { role: "user" | "bot"; name: string; text: string };
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "bot", name: "ChefBot", text: "Hi! Ask me anything about cooking." },
  ]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ---------- auto-scroll ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ---------- send ---------- */
  const send = async () => {
    if (!draft.trim()) return;
    const userMsg: ChatMsg = { role: "user", name: userName, text: draft.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setIsTyping(true);

    try {
      const botReply = await askChefBot(userMsg.text);
      setMessages((prev) => [
        ...prev,
        { role: "bot", name: "ChefBot", text: botReply || "(no reply)" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", name: "ChefBot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* ---------- styles ---------- */
  const styles: Record<string, React.CSSProperties> = {
    page: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f5f5f5",
      padding: 16,
    },
    chatBox: {
      width: "100%",
      maxWidth: 720,
      height: "80vh",
      backgroundColor: "#fff",
      borderRadius: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
    },
    messages: {
      flex: 1,
      overflowY: "auto",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 24,
    },
    wrapperBot: { display: "flex", alignItems: "flex-start", gap: 12 },
    wrapperUser: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      flexDirection: "row-reverse",
    },
    avatarImg: { width: 40, height: 40, borderRadius: "50%", objectFit: "cover" },
    avatarLetter: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      backgroundColor: "#9ca3af",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      fontWeight: "bold",
    },
    name: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
    bubbleBot: {
      backgroundColor: "#f3f4f6",
      color: "#1f2937",
      padding: "12px 16px",
      borderRadius: 16,
      maxWidth: "min(90%, 600px)",
      lineHeight: 1.5,
      overflowWrap: "anywhere",
    },
    bubbleUser: {
      backgroundColor: "#2563eb",
      color: "#fff",
      padding: "12px 16px",
      borderRadius: 16,
      maxWidth: "min(90%, 600px)",
      lineHeight: 1.5,
      overflowWrap: "anywhere",
    },
    typing: { fontStyle: "italic", color: "#6b7280" },
    inputBar: { display: "flex", padding: 16, borderTop: "1px solid #e5e7eb" },
    input: {
      flex: 1,
      padding: "10px 14px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      marginRight: 8,
      fontSize: 14,
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
    },
    buttonDisabled: { opacity: 0.4, cursor: "default" },
  };

  const avatarInitial = (name: string) => name.charAt(0).toUpperCase();

  /* ---------- render ---------- */
  return (
    <div style={styles.page}>
      <div style={styles.chatBox}>
        {/* message list */}
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === "user" ? styles.wrapperUser : styles.wrapperBot}>
              {m.role === "bot" ? (
                <img src={chefIcon} alt="ChefBot" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarLetter}>{avatarInitial(userName)}</div>
              )}

              <div>
                <div style={styles.name}>{m.name}</div>
                {m.role === "bot" ? (
                  <div style={styles.bubbleBot}>
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div style={styles.bubbleUser}>{m.text}</div>
                )}
              </div>
            </div>
          ))}

          {/* typing indicator */}
          {isTyping && (
            <div style={styles.wrapperBot}>
              <img src={chefIcon} alt="ChefBot" style={styles.avatarImg} />
              <div>
                <div style={styles.name}>ChefBot</div>
                <div style={{ ...styles.bubbleBot, ...styles.typing }}>ChefBot is typing…</div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* input bar */}
        <div style={styles.inputBar}>
          <input
            style={styles.input}
            placeholder="Type your message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            onClick={send}
            style={{ ...styles.button, ...(draft.trim() ? {} : styles.buttonDisabled) }}
            disabled={!draft.trim() || isTyping}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
