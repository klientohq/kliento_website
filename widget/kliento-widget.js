/*!
 * Kliento AI Chat Widget — embeddable website chatbot
 * Product: Kliento LLC — Website AI Chat Widget (white-label)
 * v3 — fully brandable: every color is derived from cfg.accentColor / accentColor2.
 * Example client baked in as defaults: Buffalo RiverWorks. Swap the config block to rebrand.
 * Docs + per-client config: Products/Widget/Widget Live/client-kit/
 */
(function () {
  "use strict";

  if (window.__klientoWidgetLoaded) return;
  window.__klientoWidgetLoaded = true;

  if (!document.body) {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }
  init();

  function currentScriptBase() {
    var script = document.currentScript;
    if (!script) {
      var scripts = document.getElementsByTagName("script");
      script = scripts[scripts.length - 1];
    }
    var src = script && script.src ? script.src : "";
    if (!src) return "";
    return src.slice(0, src.lastIndexOf("/") + 1);
  }

  function normalizeBase(base) {
    if (!base) return "";
    return /\/$/.test(base) ? base : base + "/";
  }

  function joinAssetUrl(base, path) {
    if (!path) return "";
    if (/^(https?:)?\/\//i.test(path) || /^data:/i.test(path) || path.charAt(0) === "/") return path;
    return normalizeBase(base) + path.replace(/^\//, "");
  }

  // ---- Theming: turn one brand color into the whole widget palette ----
  function hexToRgb(hex) {
    var h = String(hex || "").trim().replace(/^#/, "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgba(c, a) {
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
  }

  function scaleRgb(c, f) {
    return {
      r: Math.max(0, Math.min(255, Math.round(c.r * f))),
      g: Math.max(0, Math.min(255, Math.round(c.g * f))),
      b: Math.max(0, Math.min(255, Math.round(c.b * f)))
    };
  }

  function rgbCss(c) {
    return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
  }

  function buildThemeVars(accent, accent2) {
    var A = hexToRgb(accent) || { r: 211, g: 17, b: 69 };
    var B = hexToRgb(accent2) || { r: 239, g: 107, b: 131 };
    var ink = scaleRgb(A, 0.8); // darker accent for text on light tints (contrast)
    var map = {
      "--klw-accent": accent,
      "--klw-accent-2": accent2,
      "--klw-accent-ink": rgbCss(ink),
      "--klw-a05": rgba(A, 0.05),
      "--klw-a06": rgba(A, 0.06),
      "--klw-a09": rgba(A, 0.09),
      "--klw-a10": rgba(A, 0.1),
      "--klw-a12": rgba(A, 0.12),
      "--klw-a13": rgba(A, 0.13),
      "--klw-a14": rgba(A, 0.14),
      "--klw-a16": rgba(A, 0.16),
      "--klw-a18": rgba(A, 0.18),
      "--klw-a22": rgba(A, 0.22),
      "--klw-a24": rgba(A, 0.24),
      "--klw-a26": rgba(A, 0.26),
      "--klw-a90": rgba(A, 0.9),
      "--klw-b96": rgba(B, 0.96),
      "--klw-answer-bg": rgba(A, 0.05)
    };
    var out = "";
    for (var k in map) {
      if (Object.prototype.hasOwnProperty.call(map, k)) out += k + ":" + map[k] + ";";
    }
    return ".klw-root,.klw-panel{" + out + "}";
  }

  function init() {
    var inferredAssetBase = normalizeBase(joinAssetUrl(currentScriptBase(), "assets/"));
    var rawCfg = (window.KlientoWidgetConfig && typeof window.KlientoWidgetConfig === "object") ? window.KlientoWidgetConfig : {};
    var cfg = Object.assign(
      {
        // --- Connection ---
        webhookUrl: "",
        clientId: "riverworks",
        // --- Copy / brand text ---
        title: "Buffalo RiverWorks",
        introTitle: "",            // defaults to title
        introSubtitle: "Ask about hours, activities, events, dining, and trip planning",
        placeholder: "How can I help you?",
        launcherLabel: "Ask RiverWorks",
        quickPromptsLabel: "Quick prompts:",
        // --- Logo / assets ---
        assetBaseUrl: inferredAssetBase,
        logoUrl: "",               // defaults to riverworks-chat-icon.png in assets/
        launcherLogoUrl: "",       // defaults to logoUrl
        // --- Brand color (drives the whole theme) ---
        accentColor: "#d31145",
        accentColor2: "#ef6b83",
        // --- Placement ---
        position: "left",          // "left" | "right"
        // --- Quick prompt cards (max 4) ---
        quickActions: [
          { label: "What are your hours today?", message: "What are your hours today?" },
          { label: "What activities are open right now?", message: "What activities are open right now?" },
          { label: "How does parking work?", message: "How does parking work at RiverWorks?" },
          { label: "I want to plan a group visit.", message: "I want to plan a group visit." }
        ],
        // --- Footer ---
        poweredByFooter: true,
        footerText: "Powered by Kliento AI",
        // --- Storage ---
        storagePrefix: "klientoWidget_"
      },
      rawCfg
    );

    cfg.assetBaseUrl = normalizeBase(cfg.assetBaseUrl || inferredAssetBase);
    cfg.logoUrl = joinAssetUrl(cfg.assetBaseUrl, cfg.logoUrl || "riverworks-chat-icon.png");
    cfg.launcherLogoUrl = joinAssetUrl(cfg.assetBaseUrl, cfg.launcherLogoUrl || cfg.logoUrl || "riverworks-chat-icon.png");
    cfg.quickActions = normalizeQuickActions(cfg.quickActions).slice(0, 4);
    cfg.introTitle = cfg.introTitle || cfg.title;
    var positionRight = String(cfg.position || "left").toLowerCase() === "right";

    var STORAGE = {
      sessionId: cfg.storagePrefix + cfg.clientId + "_sessionId",
      openedOnce: cfg.storagePrefix + cfg.clientId + "_openedOnce"
    };

    function ls(key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }

    function lsSet(key, val) {
      try { window.localStorage.setItem(key, val); } catch (e) {}
    }

    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var css = [
      buildThemeVars(cfg.accentColor, cfg.accentColor2),
      ".klw-root{position:fixed;left:20px;bottom:20px;z-index:2147480000;font-family:'Avenir Next','Segoe UI Variable','Trebuchet MS',sans-serif;color:#23181b;}",
      ".klw-root.klw-right{left:auto;right:20px;}",
      ".klw-root *{box-sizing:border-box;}",
      ".klw-launcher-hint{position:absolute;left:4px;bottom:74px;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.98);border:1px solid var(--klw-a12);box-shadow:0 10px 24px rgba(28,26,36,.10);font-size:13px;font-weight:700;color:#5d4750;white-space:nowrap;opacity:1;transform:translateY(0);transition:opacity .26s ease,transform .26s ease;animation:klw-hint-breathe 12s ease-in-out infinite;}",
      ".klw-root.klw-right .klw-launcher-hint{left:auto;right:4px;}",
      ".klw-root.klw-hint-hidden .klw-launcher-hint{opacity:0;transform:translateY(8px);pointer-events:none;animation:none;}",
      "@keyframes klw-hint-breathe{0%,65%,100%{opacity:.96;transform:translateY(0);}72%{opacity:.78;transform:translateY(-2px);}84%{opacity:1;transform:translateY(0);}}",
      ".klw-launcher{position:relative;width:60px;height:60px;border-radius:999px;border:1px solid var(--klw-a16);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 28px rgba(28,26,36,.18);transition:transform .2s ease,box-shadow .2s ease;animation:klw-launcher-pulse 3.6s ease-in-out infinite;}",
      ".klw-launcher:hover{transform:translateY(-1px);}",
      ".klw-launcher:focus-visible,.klw-prompt:focus-visible,.klw-close:focus-visible,.klw-send:focus-visible,.klw-input:focus-visible{outline:3px solid var(--klw-a22);outline-offset:2px;}",
      ".klw-launcher img{width:30px;height:30px;display:block;object-fit:contain;}",
      "@keyframes klw-launcher-pulse{0%,100%{transform:scale(1);box-shadow:0 10px 28px rgba(28,26,36,.18),0 0 0 0 var(--klw-a06);}20%{transform:scale(1.03);box-shadow:0 12px 32px rgba(28,26,36,.20),0 0 0 8px var(--klw-a10);}45%{transform:scale(1.035);box-shadow:0 14px 38px rgba(28,26,36,.22),0 0 0 14px var(--klw-a13);}70%{transform:scale(1.01);box-shadow:0 11px 30px rgba(28,26,36,.18),0 0 0 4px var(--klw-a05);}}",
      ".klw-panel{position:fixed;left:20px;bottom:92px;width:332px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 120px);background:linear-gradient(180deg,#ffffff 0%,#fbfafc 100%);border:1px solid var(--klw-a14);border-radius:24px;box-shadow:0 18px 48px rgba(28,26,36,.14),0 4px 14px rgba(28,26,36,.08);overflow:hidden;display:flex;flex-direction:column;opacity:0;transform:translateY(14px) scale(.98);pointer-events:none;transition:opacity .24s ease,transform .24s ease;z-index:2147480001;backdrop-filter:blur(14px);}",
      ".klw-panel.klw-right{left:auto;right:20px;}",
      ".klw-panel.klw-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}",
      ".klw-header{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:rgba(255,255,255,.92);border-bottom:1px solid var(--klw-a12);}",
      ".klw-header-main{display:flex;align-items:center;gap:10px;min-width:0;}",
      ".klw-header-icon{width:19px;height:19px;display:block;object-fit:contain;}",
      ".klw-header-title{font-size:17px;font-weight:700;color:#23181b;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".klw-close{width:28px;height:28px;border-radius:999px;border:1px solid rgba(0,0,0,.08);background:transparent;color:#79686d;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex:none;}",
      ".klw-stage{flex:1;min-height:0;display:flex;flex-direction:column;padding:0 14px;}",
      ".klw-intro{flex:1;display:flex;flex-direction:column;align-items:center;padding:34px 0 0;min-height:0;overflow:auto;}",
      ".klw-hero-glow{width:80px;height:80px;border-radius:999px;background:radial-gradient(circle at center,var(--klw-b96) 0%,var(--klw-a90) 54%,var(--klw-a24) 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 34px var(--klw-a26);}",
      ".klw-hero-glow img{width:32px;height:32px;object-fit:contain;}",
      ".klw-intro-title{margin:18px 0 0;font-size:28px;font-weight:700;letter-spacing:-.02em;color:var(--klw-accent);text-align:center;}",
      ".klw-intro-sub{margin:10px 0 0;max-width:250px;font-size:14px;line-height:1.5;color:#6f5b61;text-align:center;}",
      ".klw-prompts-wrap{width:100%;margin-top:28px;padding-bottom:10px;}",
      ".klw-prompts-label{margin:0 0 12px;font-size:14px;font-weight:700;color:#5d4750;}",
      ".klw-prompts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}",
      ".klw-prompt{min-height:96px;padding:12px;border-radius:14px;border:1px solid var(--klw-a12);background:#fff;cursor:pointer;display:flex;flex-direction:column;gap:12px;justify-content:flex-start;text-align:left;color:#23181b;box-shadow:0 4px 12px rgba(28,26,36,.05);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;}",
      ".klw-prompt:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(28,26,36,.08);border-color:var(--klw-a18);}",
      ".klw-prompt-icon{width:18px;height:18px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:var(--klw-a09);color:var(--klw-accent);flex:none;}",
      ".klw-prompt-icon svg{width:12px;height:12px;display:block;}",
      ".klw-prompt-text{font-size:14px;line-height:1.42;font-weight:500;}",
      ".klw-chat{display:none;flex:1;min-height:0;flex-direction:column;padding:14px 0 0;}",
      ".klw-chat.klw-active{display:flex;}",
      ".klw-messages{flex:1;min-height:0;overflow:auto;padding:0 2px 6px;display:flex;flex-direction:column;gap:12px;}",
      ".klw-bubble-user{align-self:flex-end;max-width:86%;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid rgba(0,0,0,.08);box-shadow:0 4px 12px rgba(28,26,36,.06);font-size:14px;line-height:1.48;color:#23181b;white-space:pre-wrap;}",
      ".klw-answer{border-radius:14px;background:var(--klw-answer-bg);border:1px solid var(--klw-a16);padding:14px;box-shadow:0 6px 16px rgba(28,26,36,.05);}",
      ".klw-answer-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;color:var(--klw-accent-ink);font-size:13px;font-weight:700;}",
      ".klw-answer-head img{width:15px;height:15px;display:block;object-fit:contain;}",
      ".klw-answer-body{font-size:14px;line-height:1.52;color:#281c1f;white-space:pre-wrap;word-wrap:break-word;}",
      ".klw-answer-body p{margin:0 0 8px;}",
      ".klw-answer-body p:last-child{margin-bottom:0;}",
      ".klw-answer-body a{color:var(--klw-accent-ink);text-decoration:underline;word-break:break-word;}",
      ".klw-typing{display:inline-flex;gap:4px;align-items:center;}",
      ".klw-typing span{width:6px;height:6px;border-radius:999px;background:var(--klw-accent);animation:klw-typing 1s ease-in-out infinite;}",
      ".klw-typing span:nth-child(2){animation-delay:.14s;}",
      ".klw-typing span:nth-child(3){animation-delay:.28s;}",
      "@keyframes klw-typing{0%,60%,100%{opacity:.35;transform:translateY(0);}30%{opacity:1;transform:translateY(-2px);}}",
      ".klw-compose-wrap{padding:10px 0 12px;}",
      ".klw-compose{display:flex;align-items:center;gap:8px;height:48px;padding:0 8px 0 14px;border-radius:999px;background:#fff;border:1px solid var(--klw-a12);box-shadow:0 8px 18px rgba(28,26,36,.05);}",
      ".klw-input{flex:1;border:none;background:transparent;font:inherit;font-size:15px;color:#35262a;outline:none;resize:none;min-height:20px;max-height:92px;line-height:1.4;padding:0;margin:0;}",
      ".klw-input::placeholder{color:#8c7780;}",
      ".klw-send{width:32px;height:32px;border:none;border-radius:999px;background:linear-gradient(135deg,var(--klw-accent) 0%,var(--klw-accent-2) 100%);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;box-shadow:0 8px 18px var(--klw-a22);transition:transform .18s ease,opacity .18s ease,box-shadow .18s ease;flex:none;}",
      ".klw-send:hover{transform:translateY(-1px);}",
      ".klw-send:disabled{opacity:.48;cursor:not-allowed;box-shadow:none;transform:none;}",
      ".klw-send svg{width:14px;height:14px;display:block;}",
      ".klw-footer{padding-top:8px;text-align:center;font-size:10px;color:#9b8990;letter-spacing:.01em;}",
      "@media (max-width:760px){.klw-root{left:16px;bottom:16px;}.klw-root.klw-right{left:auto;right:16px;}.klw-panel,.klw-panel.klw-right{left:12px;right:12px;bottom:88px;width:auto;max-width:none;height:min(620px,calc(100vh - 116px));}.klw-launcher-hint{display:none;}.klw-prompts{grid-template-columns:1fr;}.klw-intro-title{font-size:26px;}}",
      "@media (prefers-reduced-motion: reduce){.klw-launcher,.klw-launcher-hint,.klw-typing span{animation:none !important;}}"
    ].join("\n");

    var styleEl = document.createElement("style");
    styleEl.setAttribute("data-kliento-widget", "1");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var root = document.createElement("div");
    root.className = "klw-root" + (positionRight ? " klw-right" : "") + (ls(STORAGE.openedOnce) === "1" ? " klw-hint-hidden" : "");

    var hint = document.createElement("div");
    hint.className = "klw-launcher-hint";
    hint.textContent = cfg.launcherLabel;

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "klw-launcher";
    launcher.setAttribute("aria-label", "Open " + cfg.title + " chat");
    launcher.innerHTML = '<img alt="" />';
    launcher.querySelector("img").src = cfg.launcherLogoUrl;

    root.appendChild(hint);
    root.appendChild(launcher);
    document.body.appendChild(root);

    var panel = document.createElement("div");
    panel.className = "klw-panel" + (positionRight ? " klw-right" : "");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", cfg.title);

    var header = document.createElement("div");
    header.className = "klw-header";
    header.innerHTML =
      '<div class="klw-header-main">' +
      '<img class="klw-header-icon" alt="" />' +
      '<div class="klw-header-title"></div>' +
      "</div>";
    header.querySelector(".klw-header-icon").src = cfg.logoUrl;
    header.querySelector(".klw-header-title").textContent = cfg.title;

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "klw-close";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.textContent = "×";
    header.appendChild(closeBtn);
    panel.appendChild(header);

    var stage = document.createElement("div");
    stage.className = "klw-stage";

    var introView = document.createElement("div");
    introView.className = "klw-intro";
    introView.innerHTML =
      '<div class="klw-hero-glow"><img alt="" /></div>' +
      '<h2 class="klw-intro-title"></h2>' +
      '<p class="klw-intro-sub"></p>' +
      '<div class="klw-prompts-wrap">' +
      '<p class="klw-prompts-label"></p>' +
      '<div class="klw-prompts"></div>' +
      "</div>";
    introView.querySelector(".klw-hero-glow img").src = cfg.logoUrl;
    introView.querySelector(".klw-intro-title").textContent = cfg.introTitle;
    introView.querySelector(".klw-intro-sub").textContent = cfg.introSubtitle;
    introView.querySelector(".klw-prompts-label").textContent = cfg.quickPromptsLabel;
    stage.appendChild(introView);

    var chatView = document.createElement("div");
    chatView.className = "klw-chat";
    var messagesEl = document.createElement("div");
    messagesEl.className = "klw-messages";
    messagesEl.setAttribute("role", "log");
    messagesEl.setAttribute("aria-live", "polite");
    chatView.appendChild(messagesEl);
    stage.appendChild(chatView);

    var composeWrap = document.createElement("div");
    composeWrap.className = "klw-compose-wrap";
    composeWrap.innerHTML =
      '<div class="klw-compose">' +
      '<textarea class="klw-input" rows="1"></textarea>' +
      '<button class="klw-send" type="button" aria-label="Send">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M5 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>' +
      '<path d="m12 5 7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>' +
      "</svg></button></div>";

    var inputEl = composeWrap.querySelector(".klw-input");
    var sendBtn = composeWrap.querySelector(".klw-send");
    inputEl.placeholder = cfg.placeholder;
    inputEl.setAttribute("aria-label", "Message " + cfg.title);
    stage.appendChild(composeWrap);

    if (cfg.poweredByFooter) {
      var footer = document.createElement("div");
      footer.className = "klw-footer";
      footer.textContent = cfg.footerText;
      stage.appendChild(footer);
    }

    panel.appendChild(stage);
    document.body.appendChild(panel);

    renderPromptCards();

    var state = {
      conversation: [],
      loading: false,
      panelOpen: false,
      sessionId: null,
      lastFocused: null
    };

    function normalizeQuickActions(actions) {
      if (!Array.isArray(actions)) return [];
      var normalized = [];
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (!action || typeof action !== "object") continue;
        if (typeof action.label !== "string" || typeof action.message !== "string") continue;
        normalized.push({
          label: action.label.trim(),
          message: action.message.trim()
        });
      }
      return normalized;
    }

    function sessionId() {
      if (state.sessionId) return state.sessionId;
      var id = ls(STORAGE.sessionId);
      if (!id) {
        id = "klw_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
        lsSet(STORAGE.sessionId, id);
      }
      state.sessionId = id;
      return id;
    }

    function promptIcon() {
      return (
        '<span class="klw-prompt-icon">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.9 6.9l2.8 2.8M14.3 14.3l2.8 2.8M17.1 6.9l-2.8 2.8M9.7 14.3l-2.8 2.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>' +
        "</svg></span>"
      );
    }

    function renderPromptCards() {
      var promptsEl = introView.querySelector(".klw-prompts");
      promptsEl.innerHTML = "";
      for (var i = 0; i < cfg.quickActions.length; i++) {
        (function (action) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "klw-prompt";
          btn.innerHTML = promptIcon() + '<div class="klw-prompt-text"></div>';
          btn.querySelector(".klw-prompt-text").textContent = action.label;
          btn.addEventListener("click", function () {
            openPanel();
            sendMessageText(action.message);
          });
          promptsEl.appendChild(btn);
        })(cfg.quickActions[i]);
      }
    }

    function pageContext() {
      var headingEl = document.querySelector("h1");
      var heading = headingEl ? headingEl.textContent || "" : "";
      return {
        url: window.location.href,
        title: document.title || "",
        path: window.location.pathname || "/",
        heading: heading.trim().slice(0, 160)
      };
    }

    function updateComposerState() {
      sendBtn.disabled = state.loading || !inputEl.value.trim();
    }

    function autoResizeInput() {
      inputEl.style.height = "auto";
      inputEl.style.height = Math.min(inputEl.scrollHeight, 92) + "px";
    }

    function setView() {
      var showChat = state.conversation.length > 0 || state.loading;
      introView.style.display = showChat ? "none" : "flex";
      chatView.classList.toggle("klw-active", showChat);
      if (showChat) {
        setTimeout(function () {
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }, 0);
      }
    }

    function renderFormattedText(container, text) {
      var lines = String(text || "").split(/\n/);
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var p = document.createElement("p");
        appendInlineContent(p, line);
        container.appendChild(p);
      }
    }

    function appendInlineContent(parent, text) {
      var pattern = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+)\)|(https?:\/\/[^\s<]+|mailto:[^\s<]+|tel:[^\s<]+)/g;
      var lastIndex = 0;
      var match;
      while ((match = pattern.exec(text))) {
        if (match.index > lastIndex) {
          parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        var label = match[1] || match[3];
        var href = match[2] || match[3];
        var link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        if (/^https?:/i.test(href)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        parent.appendChild(link);
        lastIndex = pattern.lastIndex;
      }
      if (lastIndex < text.length) {
        parent.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
    }

    function renderMessages() {
      messagesEl.innerHTML = "";

      for (var i = 0; i < state.conversation.length; i++) {
        var entry = state.conversation[i];
        if (entry.role === "user") {
          var userBubble = document.createElement("div");
          userBubble.className = "klw-bubble-user";
          userBubble.textContent = entry.text;
          messagesEl.appendChild(userBubble);
        } else {
          var answer = document.createElement("div");
          answer.className = "klw-answer";
          answer.innerHTML =
            '<div class="klw-answer-head"><img alt="" /><span></span></div>' +
            '<div class="klw-answer-body"></div>';
          answer.querySelector(".klw-answer-head img").src = cfg.logoUrl;
          answer.querySelector(".klw-answer-head span").textContent = cfg.title;
          renderFormattedText(answer.querySelector(".klw-answer-body"), entry.text);
          messagesEl.appendChild(answer);
        }
      }

      if (state.loading) {
        var typing = document.createElement("div");
        typing.className = "klw-answer";
        typing.innerHTML =
          '<div class="klw-answer-head"><img alt="" /><span></span></div>' +
          '<div class="klw-answer-body"><div class="klw-typing"><span></span><span></span><span></span></div></div>';
        typing.querySelector(".klw-answer-head img").src = cfg.logoUrl;
        typing.querySelector(".klw-answer-head span").textContent = cfg.title;
        messagesEl.appendChild(typing);
      }

      setView();
    }

    function openPanel() {
      state.lastFocused = document.activeElement;
      state.panelOpen = true;
      panel.classList.add("klw-open");
      root.classList.add("klw-hint-hidden");
      lsSet(STORAGE.openedOnce, "1");
      setView();
      setTimeout(function () {
        autoResizeInput();
        inputEl.focus();
      }, 50);
    }

    function closePanel() {
      state.panelOpen = false;
      panel.classList.remove("klw-open");
      if (state.lastFocused && typeof state.lastFocused.focus === "function") {
        state.lastFocused.focus();
      } else {
        launcher.focus();
      }
    }

    function replyTextFromPayload(data) {
      if (!data || typeof data !== "object") return "";
      return data.reply || data.message || data.answer || data.text || "";
    }

    function sendMessageText(text) {
      var trimmed = String(text || "").trim();
      if (!trimmed || state.loading) return;
      state.conversation.push({ role: "user", text: trimmed });
      state.loading = true;
      inputEl.value = "";
      autoResizeInput();
      updateComposerState();
      renderMessages();

      if (!cfg.webhookUrl || typeof fetch !== "function") {
        setTimeout(function () {
          state.loading = false;
          state.conversation.push({
            role: "assistant",
            text: "The chat backend is not connected yet."
          });
          updateComposerState();
          renderMessages();
        }, 250);
        return;
      }

      fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId(),
          message: trimmed,
          clientId: cfg.clientId,
          page: pageContext()
        })
      })
        .then(function (response) {
          return response.text().then(function (bodyText) {
            return { ok: response.ok, bodyText: bodyText || "" };
          });
        })
        .then(function (result) {
          var payload = {};
          try {
            payload = result.bodyText ? JSON.parse(result.bodyText) : {};
          } catch (e) {
            payload = { reply: result.bodyText };
          }
          state.loading = false;
          state.conversation.push({
            role: "assistant",
            text: replyTextFromPayload(payload) || "Sorry, I didn’t catch that. Could you rephrase?"
          });
          updateComposerState();
          renderMessages();
        })
        .catch(function () {
          state.loading = false;
          state.conversation.push({
            role: "assistant",
            text: "Sorry, I’m having trouble connecting right now. Please try again in a moment."
          });
          updateComposerState();
          renderMessages();
        });
    }

    launcher.addEventListener("click", openPanel);
    closeBtn.addEventListener("click", closePanel);
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });
    sendBtn.addEventListener("click", function () {
      sendMessageText(inputEl.value);
    });
    inputEl.addEventListener("input", function () {
      autoResizeInput();
      updateComposerState();
    });
    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendMessageText(inputEl.value);
      }
    });

    autoResizeInput();
    updateComposerState();
    renderMessages();
  }
})();
