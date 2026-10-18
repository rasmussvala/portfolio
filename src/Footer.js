import { useState } from "react";

const EMAIL = "rasmus.svala@hotmail.com";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <footer className="content-container">
      <h2 className="footer__cta">
        Let's talk<span className="ast">.</span>
      </h2>

      <div>
        <button type="button" className="footer__email" onClick={copyEmail}>
          {EMAIL}
          <span aria-hidden="true">⧉</span>
        </button>
        {copied && <span className="footer__toast">Copied</span>}
      </div>

      <div className="footer__bottom">
        <span>2026 Rasmus Svala</span>
        <span>
          <a
            href="https://github.com/rasmussvala/portfolio"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source on GitHub ↗
          </a>
        </span>
      </div>
    </footer>
  );
}
