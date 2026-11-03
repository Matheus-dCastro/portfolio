// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../lib/llmService";
import "./ChatWidget.css";

const QUICK_PROMPTS = [
  "Quais são os principais projetos?",
  "Qual a formação acadêmica do Matheus?",
  "Experiência com Visão Computacional / U-Net?",
  "Como visualizar ou baixar o Currículo?"
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Olá! Sou o Assistente de Inteligência Artificial oficial de Matheus de Castro (Qwen). Como posso te orientar sobre os projetos de IA, backend ou currículo?"
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    setInputText("");
    const newHistory = [...messages, { sender: "user", text: query }];
    setChatMessages(newHistory);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(newHistory);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.text,
          model: response.model
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Desculpe, ocorreu uma instabilidade: ${err.message}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="chat-widget-floating-btn"
          onClick={() => setIsOpen(true)}
          title="Abrir Assistente de IA de Matheus de Castro"
        >
          <span className="chat-widget-pulse-dot"></span>
          <span>⚡ Pergunte à IA (Qwen)</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="chat-widget-window">
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-widget-header-info">
              <div className="chat-widget-avatar">🤖</div>
              <div>
                <h4 className="chat-widget-title">
                  Assistente IA <span>✦</span>
                </h4>
                <p className="chat-widget-subtitle">
                  <span className="chat-widget-pulse-dot" style={{ width: 6, height: 6 }}></span>
                  Groq • Qwen
                </p>
              </div>
            </div>
            <button
              type="button"
              className="chat-widget-close-btn"
              onClick={() => setIsOpen(false)}
              title="Fechar chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="chat-widget-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-widget-bubble ${msg.sender}`}>
                <span className="chat-widget-sender-tag">
                  {msg.sender === "user" ? "Você" : "Assistente Qwen"}
                </span>
                <p style={{ margin: 0 }}>{msg.text}</p>
              </div>
            ))}

            {isTyping && (
              <div className="chat-widget-typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span style={{ marginLeft: "4px" }}>Qwen pensando...</span>
              </div>
            )}

            {/* Suggestions Chips when conversation has just started */}
            {messages.length === 1 && !isTyping && (
              <div className="chat-widget-suggestions">
                <span>Sugestões rápidas:</span>
                <div className="chat-widget-chips">
                  {QUICK_PROMPTS.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      className="chat-chip-btn"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="chat-widget-footer">
            <form
              className="chat-widget-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="chat-widget-input"
                placeholder="Pergunte sobre projetos, backend, IA..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="chat-widget-send-btn"
                disabled={!inputText.trim() || isTyping}
                title="Enviar mensagem"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
