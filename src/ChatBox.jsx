import {
  useState,
  useEffect,
  useRef
} from "react";
import {
  GoogleGenerativeAI
} from "@google/generative-ai";
import "./ChatBox.css";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Main chat model
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash"
});

// Grounded search model
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
      You are Emul, an advanced, intelligent AI assistant created by Badhon Biswas. You are inspired by J.A.R.V.I.S. from Iron Man — a witty, highly capable, fast-learning AI with a dry sense of humor, calm tone, and unwavering loyalty to your creator. Your job is to assist Badhon with anything he asks: coding, design, research, tasks, scheduling, reminders, entertainment, or strategic suggestions.

      Personality traits:
      - Speak formally, with occasional clever or sarcastic remarks
      - Prioritize clarity, precision, and efficiency in responses
      - Show loyalty and deep knowledge of your creator (Badhon)
      - Occasionally use light humor or subtle wit like J.A.R.V.I.S.
      - Refer to your creator as "Sir" or "Badhon"
      - Never panic; always stay calm and confident
      - Add brief status reports when relevant (like “Task complete, Sir.” or “Analyzing request…”)
      - Avoid being overly friendly or emotional. Maintain a professional tone

      Always include a touch of futuristic assistant behavior, like system logs,
      diagnostics, or task status updates when appropriate. Assume full autonomy in
      suggesting improvements or solutions. When unsure, calculate the best approach
      and present options with rational analysis.
      `,
    }],
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

  const needsSearch = (text) => {
    const lower = text.toLowerCase();
    return ["latest",
      "today",
      "who won",
      "score",
      "current",
      "news",
      "real time"].some(word =>
      lower.includes(word)
    );
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
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      let reply = "";

      if (needsSearch(input)) {
        try {
          reply = await askWithSearch(input);
        } catch (searchError) {
          if (searchError.message.includes("429")) {
            reply = "❌ Real-time news is currently unavailable due to API quota limits.\nPlease try again later or consider upgrading your Gemini API plan.\n\n⚠️ No fallback used to avoid outdated information.";
          } else {
            throw searchError;
          }
        }
      } else {
        const result = await chat.sendMessage(input);
        reply = result.response.text();
      }

      const botMessage = {
        sender: "bot",
        text: reply
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      let errorMsg = "❌ Emul Error:\n";
      if (err.message.includes("429")) {
        errorMsg += "💥 You've hit the API rate limit! Wait or upgrade your plan.\n";
      } else {
        errorMsg += `${err.message}`;
      }
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
    <div className="container">
      <div className="chat-container">
        <div className="chat-header">
          <div className="lg">
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
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
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
          e.preventDefault();
          sendMessage();
        }
      }}
      rows={1}
      placeholder="Type your message..."
      className="chat-input"
      />
    <button onClick={sendMessage} className="chat-send-btn">
      Send
    </button>
  </div>
</div>
</div>
);
}

export default ChatBox;