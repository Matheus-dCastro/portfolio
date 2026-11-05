// src/components/ShareButton.jsx
import { useState } from "react";
import { useLanguage } from "../context/useLanguage";

export default function ShareButton({
  title = "Matheus de Castro | Portfolio",
  text = "",
  url = "",
  className = "",
  label = null,
  showIcon = true
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (!url) {
      return typeof window !== "undefined" ? window.location.href : "";
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = getFullUrl();
    const shareData = {
      title,
      text: text || title,
      url: fullUrl
    };

    // Try native Web Share API first if supported and on mobile/secure context
    if (navigator.share && typeof navigator.canShare === "function" && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return; // User closed share dialog
      }
    }

    // Fallback: Clipboard writeText
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Legacy fallback using textarea
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch (legacyErr) {
        console.warn("Clipboard fallback failed:", legacyErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const buttonText = copied
    ? t("common.copied") || "Copiado!"
    : label !== null
    ? label
    : t("common.share") || "Compartilhar";

  return (
    <button
      type="button"
      className={`portfolio-share-btn ${copied ? "copied" : ""} ${className}`}
      onClick={handleShare}
      title={copied ? t("common.copied") : t("common.share")}
      aria-label={copied ? t("common.copied") : t("common.share")}
    >
      {showIcon && (
        <span className="share-btn-icon">
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          )}
        </span>
      )}
      {buttonText && <span className="share-btn-label">{buttonText}</span>}
    </button>
  );
}
