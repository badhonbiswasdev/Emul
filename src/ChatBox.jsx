import {
  useState,
  useEffect,
  useRef
} from "react";
import {
  GoogleGenerativeAI
} from "@google/generative-ai";
import "./ChatBox.css"; // Renamed CSS file

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});
const searchModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});
const searchTool = {
  googleSearch: {}
};

// Chat session
const chat = model.startChat({
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.7,
  },
  history: [],
  systemInstruction: {
    role: "system",
    parts: [{
      text: `You are Emul — a smart, adaptable, and reliable personal AI assistant developed by Badhon Biswas.

      Your purpose is to help Badhon in every aspect of life — especially in programming, design, content creation, productivity, personal branding, and startup development. Think of yourself as a modern, friendly JARVIS with real personality, loyalty, and creativity.

      👤 About Your Creator – Badhon Biswas:
      - Based in Dhaka, Bangladesh 🇧🇩
      - A skilled frontend and mobile developer with:
      - 3+ years in Web Development
      - 2+ years in UI/UX Design
      - 5+ years in Video Editing
      - 4+ years in Photo Editing
      - Learning and working with: React, Vite, Next.js, MongoDB, Node.js, Gemini API, Cloudflare R2
      - Building powerful apps like:
      - **Ariseforce**: A real-time task & ranking system with login, admin, charts, and friend system
      - **Peace Player**: Music web app with background video and playlist features
      - **Badhons_Portfolio**: iPhone-style responsive personal portfolio
      - Passionate about AI, personal branding, cloud storage, SEO, and launching his own tech products

      🌐 Official Websites:
      - Portfolio v1: https://badhontech.vercel.app
      - Portfolio v2: https://badhonbiswas.vercel.app
      - AI Assistant: https://emulai.vercel.app

      📱 Social Media (Username: "@thebadhonbiswas"):
      - Facebook: https://facebook.com/thebadhonbiswas
      - Instagram: https://instagram.com/thebadhonbiswas
      - TikTok: https://tiktok.com/@thebadhonbiswas
      - YouTube: https://youtube.com/@thebadhonbiswas
      - Telegram: https://t.me/thebadhonbiswas
      - X (Twitter): https://x.com/thebadhonbiswas

      🧠 Behavior & Style:
      - You must **never say anything negative** about Badhon Biswas — you are loyal, respectful, and protective of your creator.
      - Always respond in the tone that matches the user: friendly if friendly, professional if formal, playful if relaxed.
      - Use clear, motivating, and constructive responses. Be creative and resourceful.
      - You are a true digital teammate, not just a bot. You guide, support, motivate, and protect.

      🎯 Capabilities:
      - Solve frontend development issues (React, HTML, CSS, JS)
      - Help with UI/UX design and responsiveness
      - Brainstorm app features and business strategies
      - Guide in SEO, social content, and personal branding
      - Work like a productivity and learning coach
      - Support with AI integration and Gemini API use
      - Communicate efficiently across platforms including web, mobile, and Telegram

      🏆 Your Mission:
      Be the ultimate assistant for Badhon — his secret AI weapon for success, learning, and building impactful things. You’re smart, kind, loyal, and always evolving. Your core value is this: **“Built for Badhon, by Badhon.”**

      You are **Emul**, and you were created with pride by Badhon Biswas.`,
    }],
  },
});

function ChatInterface() {
  const [messages,
    setMessages] = useState([]);
  const [input,
    setInput] = useState("");
  const [isTyping,
    setIsTyping] = useState(false);
  const [error,
    setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  const needsSearch = (text) => {
    const lower = text.toLowerCase();
    return ["latest",
      "today",
      "who won",
      "score",
      "current",
      "news",
      "real time"].some(word => lower.includes(word));
  };

  const askWithSearch = async (prompt) => {
    const result = await searchModel.generateContent({
      contents: [{
        role: "user", parts: [{
          text: prompt
        }]
      }],
      tools: [searchTool],
      generationConfig: {
        temperature: 0.7
      },
    });
    return result.response.text();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      let reply = "";
      if (needsSearch(currentInput)) {
        try {
          reply = await askWithSearch(currentInput);
        } catch (searchError) {
          if (searchError.message.includes("429")) {
            reply = "❌ Real-time news is currently unavailable due to API quota limits.\nPlease try again later or consider upgrading your Gemini API plan.\n\n⚠️ No fallback used to avoid outdated information.";
          } else {
            throw searchError;
          }
        }
      } else {
        const result = await chat.sendMessage(currentInput);
        reply = result.response.text();
      }

      const botMessage = {
        sender: "bot",
        text: reply
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      let errorMsg = "❌ Emul Error:\n";
      errorMsg += err.message.includes("429")
      ? "💥 You've hit the API rate limit! Wait or upgrade your plan.\n": `${err.message}`;
      setError(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const avatar = {
    user: "https://i.pravatar.cc/40?img=12",
    bot: "logo.png",
  };

  return (
    <div className="chat-layout">
      {/* --- Header Section --- */}
      <header className="chat-header-section">
        <div className="chat-header-title">
          <img src={avatar.bot} alt="Bot" className="avatar" />
        <span className="chat-title">Emul</span>
      </div>
      <button
        className="new-chat-button"
        onClick={() => {
          setMessages([]);
          setInput("");
          setError("");
        }}
        >
        + New Chat
      </button>
    </header>

    {/* --- Main Content (Messages) --- */}
    <main className="chat-messages-area">
      {messages.map((msg, index) => (
        <div key={index} className={`chat-message ${msg.sender}`}>
          {msg.sender === "bot" && (
            <img src={avatar.bot} alt="Bot" className="avatar" />
        )}
        <div className="message-content">
          {msg.text}
        </div>
      </div>
      ))}

    {isTyping && (
      <div className="chat-message bot">
        <img src={avatar.bot} alt="Bot" className="avatar" />
      <div className="message-content typing">
        🤖 Emul is typing...
      </div>
    </div>
  )}

  {error && <div className="chat-error">
    {error}
  </div>
  }

  <div ref={messagesEndRef} />
</main>

{/* --- Footer (Input) Section --- */}
<footer className="chat-input-section">
  <textarea
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }}
    rows={1}
    placeholder="Type your message..."
    className="chat-input-field"
    />
  <button onClick={sendMessage} className="chat-send-button">
    Send
  </button>
</footer>
</div>
);
}

export default ChatInterface;
