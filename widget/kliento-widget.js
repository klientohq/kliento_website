/*!
 * Kliento AI Chat Widget — animated mascot chat launcher
 * Product: Kliento LLC — Website AI Chat Widget
 * Pilot client: Buffalo RiverWorks
 *
 * Single-file embed. Drop this one script tag on any page:
 *   <script src="https://.../kliento-widget.js" defer></script>
 *
 * Optional per-site config (set BEFORE loading this script):
 *   window.KlientoWidgetConfig = {
 *     webhookUrl: "https://crivascamilo.app.n8n.cloud/webhook/riverworks-chat-widget",
 *     clientId: "riverworks",
 *     greeting: "Hi! I'm Sarah's chat twin — ask me anything about RiverWorks.",
 *     bubblePrompts: ["Ask me anything!", "Got a question about tonight's show?", "Need directions or hours?"],
 *     accentColor: "#0e6ba8",
 *     accentColor2: "#f2994a",
 *     landingSelectors: [".fh-button", ".gform_button", "#menu-item-events"],
 *     avoidSelectors: [".fh-button", ".fh-cal", ".gform_wrapper", ".gform_button", ".n2-ss-slider"],
 *     poweredByFooter: true
 *   };
 */
(function () {
  "use strict";

  // ---- Guard against double-injection (WPCode + manual footer script, theme + plugin, etc.) ----
  if (window.__klientoWidgetLoaded) return;
  window.__klientoWidgetLoaded = true;

  // Don't run until <body> exists, even if the script is placed in <head> without defer.
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }
  init();

  function init() {

  var rawCfg = (window.KlientoWidgetConfig && typeof window.KlientoWidgetConfig === "object") ? window.KlientoWidgetConfig : {};
  var cfg = Object.assign(
    {
      webhookUrl: "",
      clientId: "default",
      greeting: "Hi! Ask me anything about this place.",
      bubblePrompts: ["Ask me anything!", "Have a question?", "Need help finding something?"],
      accentColor: "#0e6ba8",
      accentColor2: "#f2994a",
      landingSelectors: [],
      avoidSelectors: [".fh-button", ".fh-cal", ".gform_wrapper", ".gform_button", ".n2-ss-slider", ".mfp-wrap"],
      poweredByFooter: true,
      storagePrefix: "klientoWidget_"
    },
    rawCfg
  );
  // Defensive coercion — a malformed config (e.g. a string instead of an array) must never crash the widget.
  if (!Array.isArray(cfg.bubblePrompts) || !cfg.bubblePrompts.length) cfg.bubblePrompts = ["Ask me anything!"];
  if (!Array.isArray(cfg.landingSelectors)) cfg.landingSelectors = [];
  if (!Array.isArray(cfg.avoidSelectors)) cfg.avoidSelectors = [];

  var STORAGE = {
    dismissed: cfg.storagePrefix + cfg.clientId + "_dismissed",
    bubbleShownAt: cfg.storagePrefix + cfg.clientId + "_bubbleShownAt",
    sessionId: cfg.storagePrefix + cfg.clientId + "_sessionId"
  };

  function ls(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) {}
  }

  // Permanently dismissed by the user in a previous visit — don't render at all.
  if (ls(STORAGE.dismissed) === "1") return;

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;

  // ---------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------
  var css = "\n" +
    ".klw-root{position:fixed;z-index:2147480000;right:24px;bottom:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;transition:right .6s ease,bottom .6s ease,opacity .3s ease;}\n" +
    ".klw-root.klw-hidden{opacity:0;pointer-events:none;}\n" +
    ".klw-root.klw-yielding .klw-avatar-btn{transform:scale(.55);opacity:.35;}\n" +
    ".klw-avatar-wrap{position:relative;width:76px;height:76px;}\n" +
    ".klw-avatar-btn{width:76px;height:76px;border-radius:50%;border:none;padding:0;cursor:pointer;background:radial-gradient(circle at 30% 25%, #ffffff, #eaf4fb 60%);box-shadow:0 6px 18px rgba(14,107,168,.35);display:flex;align-items:center;justify-content:center;transition:transform .35s ease, opacity .35s ease;}\n" +
    ".klw-avatar-btn:hover{transform:scale(1.06);}\n" +
    ".klw-avatar-btn svg{width:58px;height:58px;display:block;}\n" +
    ".klw-bob{animation:klw-bob 3.2s ease-in-out infinite;}\n" +
    ".klw-bob-calm{animation-duration:5.5s;}\n" +
    "@keyframes klw-bob{0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-7px) rotate(-2deg);}}\n" +
    ".klw-arm{transform-origin:70% 65%;animation:klw-wave 2.6s ease-in-out infinite;}\n" +
    "@keyframes klw-wave{0%,100%{transform:rotate(0deg);}25%{transform:rotate(-18deg);}50%{transform:rotate(4deg);}75%{transform:rotate(-10deg);}}\n" +
    ".klw-blink{animation:klw-blink 4.5s ease-in-out infinite;}\n" +
    "@keyframes klw-blink{0%,92%,100%{transform:scaleY(1);}94%{transform:scaleY(.1);}96%{transform:scaleY(1);}}\n" +
    ".klw-bubble{position:absolute;right:88px;bottom:6px;max-width:200px;background:#fff;color:#1c2b36;padding:10px 14px;border-radius:16px 16px 4px 16px;font-size:13.5px;line-height:1.35;box-shadow:0 6px 18px rgba(0,0,0,.15);opacity:0;transform:translateY(6px) scale(.96);pointer-events:none;transition:opacity .35s ease, transform .35s ease;}\n" +
    ".klw-bubble.klw-show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;cursor:pointer;}\n" +
    ".klw-dismiss{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#e3e8ec;border:none;color:#5b6b76;font-size:12px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}\n" +
    ".klw-panel{position:fixed;z-index:2147480001;right:24px;bottom:112px;width:340px;max-width:calc(100vw - 32px);height:460px;max-height:calc(100vh - 140px);background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;transition:opacity .28s ease, transform .28s ease;}\n" +
    ".klw-panel.klw-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}\n" +
    ".klw-header{background:linear-gradient(135deg, var(--klw-accent), var(--klw-accent2));color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;}\n" +
    ".klw-header svg{width:30px;height:30px;flex:none;}\n" +
    ".klw-header-title{font-weight:600;font-size:14.5px;}\n" +
    ".klw-header-sub{font-size:11.5px;opacity:.85;}\n" +
    ".klw-close{margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:14px;}\n" +
    ".klw-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f6f9fb;}\n" +
    ".klw-msg{max-width:82%;padding:9px 12px;border-radius:14px;font-size:13.5px;line-height:1.4;white-space:pre-wrap;}\n" +
    ".klw-msg-bot{background:#fff;color:#1c2b36;align-self:flex-start;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.08);}\n" +
    ".klw-msg-user{background:var(--klw-accent);color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}\n" +
    ".klw-typing{display:flex;gap:4px;padding:10px 12px;}\n" +
    ".klw-typing span{width:6px;height:6px;border-radius:50%;background:#9fb0ba;animation:klw-typing 1.1s ease-in-out infinite;}\n" +
    ".klw-typing span:nth-child(2){animation-delay:.15s;}.klw-typing span:nth-child(3){animation-delay:.3s;}\n" +
    "@keyframes klw-typing{0%,60%,100%{opacity:.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-3px);}}\n" +
    ".klw-inputrow{display:flex;gap:8px;padding:10px;border-top:1px solid #e7edf1;background:#fff;}\n" +
    ".klw-input{flex:1;border:1px solid #d9e2e7;border-radius:20px;padding:9px 14px;font-size:13.5px;outline:none;}\n" +
    ".klw-input:focus{border-color:var(--klw-accent);}\n" +
    ".klw-send{background:var(--klw-accent);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;flex:none;}\n" +
    ".klw-footer{text-align:center;font-size:10.5px;color:#9fb0ba;padding:4px 0 8px;}\n" +
    "@media (max-width:760px){.klw-root{right:14px;bottom:14px;}.klw-panel{right:8px;left:8px;bottom:8px;width:auto;max-width:none;height:70vh;max-height:70vh;}.klw-bubble{display:none;}}\n" +
    "@media (prefers-reduced-motion: reduce){.klw-bob,.klw-arm,.klw-blink{animation:none !important;}}\n";

  try {
    var styleEl = document.createElement("style");
    styleEl.setAttribute("data-kliento-widget", "1");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  } catch (e) { /* strict CSP blocking inline styles — widget degrades to unstyled rather than crashing the page */ }

  // ---------------------------------------------------------------------
  // Mascot SVG — simple friendly river-otter character, built to animate
  // in parts (ear/eye/arm/tail groups keyed by class for CSS animation).
  // ---------------------------------------------------------------------
  var mascotSVG =
    '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<ellipse cx="60" cy="100" rx="30" ry="8" fill="rgba(14,30,40,.08)"/>' +
    '<g class="klw-tail"><path d="M88 78 Q108 70 104 92 Q98 84 88 86Z" fill="#8a5a34"/></g>' +
    '<path d="M34 60 Q30 100 60 108 Q90 100 86 60 Q86 34 60 30 Q34 34 34 60Z" fill="#a2703f"/>' +
    '<path d="M42 66 Q40 96 60 102 Q80 96 78 66 Q78 50 60 48 Q42 50 42 66Z" fill="#d8b384"/>' +
    '<path d="M40 62 Q35 76 46 84 L46 60Z" fill="#f2994a"/>' +
    '<path d="M80 62 Q85 76 74 84 L74 60Z" fill="#f2994a"/>' +
    '<rect x="44" y="60" width="32" height="22" rx="8" fill="#f2994a"/>' +
    '<g class="klw-arm"><ellipse cx="30" cy="66" rx="8" ry="14" fill="#a2703f" transform="rotate(-10 30 66)"/></g>' +
    '<ellipse cx="90" cy="70" rx="8" ry="14" fill="#a2703f" transform="rotate(12 90 70)"/>' +
    '<circle cx="60" cy="34" r="26" fill="#a2703f"/>' +
    '<circle cx="60" cy="36" r="19" fill="#d8b384"/>' +
    '<circle cx="40" cy="18" r="8" fill="#a2703f"/>' +
    '<circle cx="80" cy="18" r="8" fill="#a2703f"/>' +
    '<circle cx="40" cy="19" r="4" fill="#d8b384"/>' +
    '<circle cx="80" cy="19" r="4" fill="#d8b384"/>' +
    '<g class="klw-blink">' +
    '<ellipse cx="51" cy="33" rx="4.2" ry="5" fill="#1c2b36"/>' +
    '<ellipse cx="69" cy="33" rx="4.2" ry="5" fill="#1c2b36"/>' +
    '<circle cx="52.3" cy="31.3" r="1.2" fill="#fff"/>' +
    '<circle cx="70.3" cy="31.3" r="1.2" fill="#fff"/>' +
    "</g>" +
    '<ellipse cx="60" cy="42" rx="4" ry="3" fill="#1c2b36"/>' +
    '<path d="M52 47 Q60 52 68 47" stroke="#1c2b36" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    "</svg>";

  var mascotSVGHeader = mascotSVG.replace('viewBox="0 0 120 120"', 'viewBox="0 0 120 120" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,.15))"');

  // ---------------------------------------------------------------------
  // DOM scaffold
  // ---------------------------------------------------------------------
  var root = document.createElement("div");
  root.className = "klw-root";
  root.style.setProperty("--klw-accent", cfg.accentColor);
  root.style.setProperty("--klw-accent2", cfg.accentColor2);

  var avatarWrap = document.createElement("div");
  avatarWrap.className = "klw-avatar-wrap";

  var avatarBtn = document.createElement("button");
  avatarBtn.className = "klw-avatar-btn" + (prefersReducedMotion ? "" : " klw-bob");
  avatarBtn.setAttribute("aria-label", "Open chat");
  avatarBtn.innerHTML = mascotSVG;

  var bubble = document.createElement("div");
  bubble.className = "klw-bubble";
  var bubbleText = document.createElement("span");
  bubbleText.textContent = cfg.bubblePrompts[0] || "Ask me anything!";
  var bubbleDismiss = document.createElement("button");
  bubbleDismiss.className = "klw-dismiss";
  bubbleDismiss.setAttribute("aria-label", "Don't show this again");
  bubbleDismiss.textContent = "✕";
  bubble.appendChild(bubbleText);
  bubble.appendChild(bubbleDismiss);

  avatarWrap.appendChild(bubble);
  avatarWrap.appendChild(avatarBtn);
  root.appendChild(avatarWrap);
  document.body.appendChild(root);

  // ---- Chat panel ----
  var panel = document.createElement("div");
  panel.className = "klw-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Chat with RiverWorks");
  panel.style.setProperty("--klw-accent", cfg.accentColor);
  panel.style.setProperty("--klw-accent2", cfg.accentColor2);
  panel.innerHTML =
    '<div class="klw-header">' + mascotSVGHeader +
    '<div><div class="klw-header-title">Ask RiverWorks</div><div class="klw-header-sub">Usually replies instantly</div></div>' +
    '<button class="klw-close" aria-label="Close chat">✕</button>' +
    "</div>" +
    '<div class="klw-messages" id="klw-messages" role="log" aria-live="polite"></div>' +
    '<div class="klw-inputrow">' +
    '<input class="klw-input" id="klw-input" type="text" placeholder="Type a question…" autocomplete="off" />' +
    '<button class="klw-send" id="klw-send" aria-label="Send">➤</button>' +
    "</div>" +
    (cfg.poweredByFooter ? '<div class="klw-footer">Powered by Kliento AI</div>' : "");
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector("#klw-messages");
  var inputEl = panel.querySelector("#klw-input");
  var sendBtn = panel.querySelector("#klw-send");
  var closeBtn = panel.querySelector(".klw-close");

  function addMessage(text, who) {
    var m = document.createElement("div");
    m.className = "klw-msg " + (who === "user" ? "klw-msg-user" : "klw-msg-bot");
    m.textContent = text;
    messagesEl.appendChild(m);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var t = document.createElement("div");
    t.className = "klw-typing";
    t.id = "klw-typing-indicator";
    t.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(t);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    var t = document.getElementById("klw-typing-indicator");
    if (t) t.remove();
  }

  var sessionIdMemo = null;
  function sessionId() {
    if (sessionIdMemo) return sessionIdMemo;
    var id = ls(STORAGE.sessionId);
    if (!id) {
      id = "klw_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      lsSet(STORAGE.sessionId, id);
    }
    sessionIdMemo = id; // survives even if localStorage is unavailable (private browsing)
    return id;
  }

  var panelOpened = false;
  var widgetDismissed = false;
  function openPanel() {
    panel.classList.add("klw-open");
    bubble.classList.remove("klw-show");
    if (!panelOpened) {
      panelOpened = true;
      addMessage(cfg.greeting, "bot");
    }
    setTimeout(function () { inputEl.focus(); }, 250);
  }
  function closePanel() {
    panel.classList.remove("klw-open");
    avatarBtn.focus();
  }

  avatarBtn.addEventListener("click", openPanel);
  bubble.addEventListener("click", function (e) {
    if (e.target === bubbleDismiss) return;
    openPanel();
  });
  closeBtn.addEventListener("click", closePanel);
  panel.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePanel();
  });
  bubbleDismiss.addEventListener("click", function (e) {
    e.stopPropagation();
    widgetDismissed = true;
    lsSet(STORAGE.dismissed, "1");
    root.classList.add("klw-hidden");
    mo.disconnect();
    setTimeout(function () { root.remove(); panel.remove(); }, 350);
  });

  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text) return;
    addMessage(text, "user");
    inputEl.value = "";
    showTyping();

    if (!cfg.webhookUrl) {
      setTimeout(function () {
        hideTyping();
        addMessage("(Widget not connected to a backend yet — set webhookUrl in KlientoWidgetConfig.)", "bot");
      }, 500);
      return;
    }

    if (typeof fetch !== "function") {
      hideTyping();
      addMessage("Sorry, this browser can't connect to chat right now.", "bot");
      return;
    }

    try {
      fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId(), message: text, clientId: cfg.clientId, page: window.location.href })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          hideTyping();
          addMessage((data && (data.reply || data.message)) || "Sorry, I didn't catch that — could you rephrase?", "bot");
        })
        .catch(function () {
          hideTyping();
          addMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.", "bot");
        });
    } catch (e) {
      hideTyping();
      addMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.", "bot");
    }
  }
  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.isComposing) sendMessage();
  });

  // ---------------------------------------------------------------------
  // Speech-bubble frequency cap: show once per session, back off after
  // dismissal/interaction, never loop forever.
  // ---------------------------------------------------------------------
  var lastShown = parseInt(ls(STORAGE.bubbleShownAt) || "0", 10);
  var hoursSinceShown = (Date.now() - lastShown) / 36e5;
  if (!panelOpened && hoursSinceShown > 20) {
    setTimeout(function () {
      if (!panelOpened && !widgetDismissed) {
        bubble.classList.add("klw-show");
        lsSet(STORAGE.bubbleShownAt, String(Date.now()));
        setTimeout(function () { bubble.classList.remove("klw-show"); }, 9000);
      }
    }, 3200);
  }

  // ---------------------------------------------------------------------
  // Idle "alive" drift: desktop only. Roams to a small set of intentional
  // landing spots (real DOM anchors when available, corner fallbacks
  // otherwise), avoiding known CTA/booking elements. Mobile stays docked.
  // Energy decays from lively -> calm after ~15s if untouched.
  // ---------------------------------------------------------------------
  if (!isMobile && !prefersReducedMotion) {
    var energetic = true;
    setTimeout(function () {
      energetic = false;
      avatarBtn.classList.add("klw-bob-calm");
    }, 15000);

    function getCorners() {
      // Computed fresh each call so resizing the viewport doesn't leave stale/off-screen spots.
      return [
        { right: 24, bottom: 24 },
        { right: 24, bottom: window.innerHeight * 0.4 },
        { right: window.innerWidth * 0.3, bottom: 24 }
      ];
    }

    function elementOverlapsAvoidZone(rect) {
      for (var i = 0; i < cfg.avoidSelectors.length; i++) {
        var els = document.querySelectorAll(cfg.avoidSelectors[i]);
        for (var j = 0; j < els.length; j++) {
          var r = els[j].getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          var overlap = !(rect.right < r.left - 20 || rect.left > r.right + 20 || rect.bottom < r.top - 20 || rect.top > r.bottom + 20);
          if (overlap) return true;
        }
      }
      return false;
    }

    function pickLandingSpot() {
      // Try a configured real DOM anchor first.
      for (var i = 0; i < cfg.landingSelectors.length; i++) {
        var el = document.querySelector(cfg.landingSelectors[i]);
        if (el) {
          var r = el.getBoundingClientRect();
          if (r.width > 0 && r.top > 80 && r.top < window.innerHeight - 140) {
            var right = Math.max(16, window.innerWidth - r.right + 20);
            var bottom = Math.max(16, window.innerHeight - r.bottom + 30);
            var candidateRect = { left: window.innerWidth - right - 76, right: window.innerWidth - right, top: window.innerHeight - bottom - 76, bottom: window.innerHeight - bottom };
            if (!elementOverlapsAvoidZone(candidateRect)) return { right: right, bottom: bottom };
          }
        }
      }
      // Fallback corner, skipped if it overlaps a known avoid-zone element.
      var corners = getCorners();
      for (var c = 0; c < corners.length; c++) {
        var spot = corners[c];
        var rect2 = { left: window.innerWidth - spot.right - 76, right: window.innerWidth - spot.right, top: window.innerHeight - spot.bottom - 76, bottom: window.innerHeight - spot.bottom };
        if (!elementOverlapsAvoidZone(rect2)) return spot;
      }
      return { right: 24, bottom: 24 };
    }

    function drift() {
      if (widgetDismissed) return;
      if (panel.classList.contains("klw-open")) return scheduleDrift();
      var spot = pickLandingSpot();
      root.style.right = spot.right + "px";
      root.style.bottom = spot.bottom + "px";
      scheduleDrift();
    }
    function scheduleDrift() {
      if (widgetDismissed) return;
      setTimeout(drift, energetic ? 7000 : 16000);
    }
    scheduleDrift();
  }

  // ---------------------------------------------------------------------
  // Yield to modals/overlays: FareHarbor Lightframe, Enfold Magnific
  // Popup, Depicter popups. Shrink out of the way rather than compete
  // for z-index, then restore once the overlay closes.
  // ---------------------------------------------------------------------
  var overlaySelectors = ".mfp-wrap, .mfp-ready, [class*='depicter-popup'], [id*='fareharbor'], .fh-lightframe, .fh-cal-wrap";
  function checkOverlays() {
    var found = false;
    try { found = !!document.querySelector(overlaySelectors); } catch (e) {}
    root.classList.toggle("klw-yielding", found);
  }
  var mo = new MutationObserver(function () { checkOverlays(); });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
  checkOverlays();

  // Pause rAF-driven CSS animations when tab is hidden (battery/perf).
  document.addEventListener("visibilitychange", function () {
    root.style.animationPlayState = document.hidden ? "paused" : "running";
  });
  } // end init()
})();
