// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../lib/llmService";
import { useLanguage } from "../context/useLanguage";
import "./ChatWidget.css";

export default function ChatWidget() {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setChatMessages] = useState([]);

  // Initialize or update initial message when language changes if no conversation took place yet
  useEffect(() => {
    setChatMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            sender: "bot",
            text: t("agent.welcome_message")
          }
        ];
      }
      return prev;
    });
  }, [lang, t]);

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
          text: lang === "en"
            ? `Sorry, a temporary issue occurred: ${err.message}`
            : `Desculpe, ocorreu uma instabilidade: ${err.message}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = t("agent.quick_prompts") || [
    "What are Matheus's main projects?",
    "What is his academic background?",
    "Experience with Computer Vision / U-Net?",
    "How to view or download his Resume?"
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="chat-widget-floating-btn"
          onClick={() => setIsOpen(true)}
          title={t("agent.trigger_title")}
        >
          <span className="chat-widget-pulse-dot"></span>
          <span>{t("agent.trigger_btn")}</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="chat-widget-window">
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-widget-header-info">
              <div className="chat-widget-avatar"><span>A</span></div>
              <div>
                <h4 className="chat-widget-title">
                  Alomyr
                </h4>
                <p className="chat-widget-subtitle">
                  <span className="chat-widget-pulse-dot" style={{ width: 6, height: 6 }}></span>
                  {t("agent.subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="chat-widget-close-btn"
              onClick={() => setIsOpen(false)}
              title={t("agent.close_title")}
            >
              &times;
            </button>
          </div>

          {/* Messages Body */}
          <div className="chat-widget-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-widget-bubble ${msg.sender}`}>
                <span className="chat-widget-sender-tag">
                  {msg.sender === "user" ? t("agent.user_tag") : "Alomyr"}
                </span>
                <p style={{ margin: 0 }}>{msg.text}</p>
              </div>
            ))}

            {isTyping && (
              <div className="chat-widget-typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span style={{ marginLeft: "4px" }}>{t("agent.thinking")}</span>
              </div>
            )}

            {/* Suggestions Chips when conversation has just started */}
            {messages.length === 1 && !isTyping && (
              <div className="chat-widget-suggestions">
                <span>{t("agent.suggestions_title")}</span>
                <div className="chat-widget-chips">
                  {quickPrompts.map((prompt, pIdx) => (
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
                placeholder={t("agent.input_placeholder")}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="chat-widget-send-btn"
                disabled={!inputText.trim() || isTyping}
                title={t("agent.send_title")}
                aria-label="Send"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
