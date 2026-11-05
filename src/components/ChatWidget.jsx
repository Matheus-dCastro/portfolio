// src/components/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../lib/llmService";
import { useLanguage } from "../context/useLanguage";
import "./ChatWidget.css";

function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split("\n");

  const formatInline = (str) => {
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    // Pattern matching [label](url), raw urls, **bold**, and `code`
    const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s)]+)|(\*\*([^*]+)\*\*)|(`([^`]+)`)/g;
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }

      if (match[1]) {
        parts.push(
          <a
            key={`link-${keyIdx++}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-bubble-link"
          >
            {match[2]} ↗
          </a>
        );
      } else if (match[4]) {
        const rawUrl = match[4];
        const displayLabel = rawUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
        parts.push(
          <a
            key={`url-${keyIdx++}`}
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-bubble-link"
          >
            {displayLabel} ↗
          </a>
        );
      } else if (match[5]) {
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="chat-bubble-strong">
            {match[6]}
          </strong>
        );
      } else if (match[7]) {
        parts.push(
          <code key={`code-${keyIdx++}`} className="chat-bubble-code">
            {match[8]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts;
  };

  const renderedBlocks = [];
  let currentListItems = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      renderedBlocks.push(
        <ul key={`list-${renderedBlocks.length}`} className="chat-bubble-list">
          {currentListItems.map((item, iIdx) => (
            <li key={iIdx}>{item}</li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (bulletMatch || numMatch) {
      const content = bulletMatch ? bulletMatch[1] : numMatch[1];
      currentListItems.push(formatInline(content));
    } else {
      flushList();
      renderedBlocks.push(
        <p key={`p-${lineIdx}`} className="chat-bubble-paragraph">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="formatted-chat-content">{renderedBlocks}</div>;
}

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
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const isTypingRef = useRef(isTyping);
  isTypingRef.current = isTyping;

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
    if (!query || isTypingRef.current) return;

    setInputText("");
    const currentMsgs = messagesRef.current.length > 0
      ? messagesRef.current
      : [{ sender: "bot", text: t("agent.welcome_message") }];

    const newHistory = [...currentMsgs, { sender: "user", text: query }];
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

  const handleSendMessageRef = useRef(handleSendMessage);
  handleSendMessageRef.current = handleSendMessage;

  useEffect(() => {
    const handleExternalOpen = (e) => {
      setIsOpen(true);
      const prompt = e.detail?.prompt;
      if (prompt) {
        setTimeout(() => {
          if (handleSendMessageRef.current) {
            handleSendMessageRef.current(prompt);
          }
        }, 150);
      }
    };
    window.addEventListener("open-alomyr-chat", handleExternalOpen);
    return () => window.removeEventListener("open-alomyr-chat", handleExternalOpen);
  }, []);

  const quickPrompts = t("agent.quick_prompts") || [
    "What are Matheus's main projects?",
    "What is his academic background?",
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
                {msg.sender === "bot" ? (
                  <FormattedMessage text={msg.text} />
                ) : (
                  <p style={{ margin: 0 }}>{msg.text}</p>
                )}
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
