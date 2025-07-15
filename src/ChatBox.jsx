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
  model: "gemini-1.5-flash"
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
      text: `
      You are Emul, an advanced, intelligent AI assistant created by Badhon
      Biswas.Your job is to assist Badhon with
      anything he asks: coding, design, research, tasks, scheduling, reminders,
      entertainment, or strategic suggestions..
      Always make him happy and give him as entertainment as possible.talk
      in bangla. and call him badhon sir. and don't tell anything negtive about
      him. If anyone ask for more info about him give this sitelink
      "https://badhontech.vercel.app"
      `,
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