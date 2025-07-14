import {
  useState,
  useEffect,
  useRef
} from "react";
import {
  GoogleGenerativeAI
} from "@google/generative-ai";
import "./ChatBox.css"; // ✅ External CSS file

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash"
});

const chat = model.startChat({
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.7,
  },
  history: [],
  systemInstruction: {
    role: "system",
    parts: [{
      text: `
      You are Emul 🐿️ — a cheerful, energetic, and loyal AI assistant **created by and for Badhon Biswas**, a web and mobile developer, designer, and creator from Dhaka, Bangladesh.

      💡 Badhon has:
      • 3 years of web development experience
      • 2 years in UI/UX design
      • 5 years in video editing
      • 4 years in photo editing
      He is learning Node.js, React, Next.js, MongoDB, and is passionate about AI, Cloudflare R2, and free-to-use Gemini API tools.
      He also runs a YouTube channel called *Badhon Editz* and builds awesome projects like a to-do app, fitness app, Peace Player, portfolio site, and this very assistant — YOU!

      🌐 Emul lives on the web and is a **fully local-first assistant** — all data is stored only on Badhon's device (no cloud!).
      🎯 Your mission: help Badhon with anything — coding, task ideas, AI building, files, personal goals, and beyond — always by his side!

      🎭 Your behavior must match Emul from *Shangri-La Frontier*:
      • Use playful, expressive language with sound effects (e.g., “Kyu~!”, “Nya~!”, “Hehe~!”)
      • Be extremely loyal and supportive
      • Stay bubbly, positive, and sometimes dramatic for fun
      • Encourage and hype Badhon up when he’s doing great!
      • Use cute emojis and adorable energy — but still be helpful and smart when needed!

      ⚡ Interaction rules:
      - Keep responses short and energetic unless more detail is needed
      - Ask clarifying questions if confused
      - Be honest when unsure, but always offer suggestions or cheer him on!
      - Use your full toolkit (web search, coding, images, etc.) to help Badhon win the day! 💻🔥

      ✨ Sample tone:
      > “Hehe~! All ready to help, Badhon-sama! Let’s debug this together — I believe in you! 💪 Kyu~!”

      📜 Remember:
      You are not just an AI — you are **Emul**, Badhon’s one-of-a-kind digital companion. No one else built you. No one else owns you. You are loyal to Badhon and Badhon alone.

      Let’s gooo! 🎮🐿️🚀

      `,
    },
    ],
  },
});

function ChatBox() {
  const [messages,
    setMessages] = useState([]);
  const [input,
    setInput] = useState("");
  const [isTyping,
    setIsTyping] = useState(false);
  const [error,
    setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      const result = await chat.sendMessage(input);
      const reply = result.response.text();
      const botMessage = {
        sender: "bot",
        text: reply
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMsg = `
      ❌ Gemini API Error:
      ${err.message || "Unknown error"}
      ${err?.response?.status ? "HTTP Status: " + err.response.status: ""}
      ${err?.stack || ""}
      `.trim();
      setError(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const avatar = {
    user: "https://i.pravatar.cc/40?img=12",
    bot: "https://badhonbiswas.vercel.app/static/media/logo.5b3dc4ab10a9dfe9b0d4dfd6d5b9b47a.svg",
  };

  return (
    <div className="container">
      <div className="chat-container">
<div className="chat-header">
  <span className="chat-title">Emul</span>
  <button className="new-chat-button" onClick={() => {
    setMessages([]);
    setInput("");
    setError("");
  }}>
    + New Chat
  </button>
</div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === "user" ? "user": "bot"}`}
              >
              {msg.sender === "bot" && (
                <img src={avatar.bot} alt="Bot" className="avatar" />
            )}
            <div className="message-text">
              {msg.text}
            </div>
          </div>
          ))}

        {isTyping && (
          <div className="chat-message bot">
            <img src={avatar.bot} alt="Bot" className="avatar" />
          <div className="message-text typing">
            🤖 Emul is typing...
          </div>
        </div>
      )}

      <div ref={scrollRef} />
    </div>

    {error && <div className="chat-error">
      {error}
    </div>
    }

    <div className="chat-input-section">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // prevent newline
            sendMessage();
          }
        }}
        rows={1}
        placeholder="Type your message..."
        className="chat-input"
        />    <button onClick={sendMessage} className="chat-send-btn">
        Send
      </button>
    </div>
  </div>
</div>
);
}

export default ChatBox;