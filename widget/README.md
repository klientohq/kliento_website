# Kliento AI Chat Widget

Single-file embeddable chat widget (animated mascot + chat panel). Hosted here so any client site can load it via one script tag, centrally versioned.

Live at: `https://thekliento.com/widget/kliento-widget.js`

## Embed snippet (per client)

Paste this before the closing `</body>` tag (or via WPCode Lite / Head & Footer Code on WordPress — do NOT edit theme files directly):

```html
<script>
  window.KlientoWidgetConfig = {
    webhookUrl: "https://crivascamilo.app.n8n.cloud/webhook/riverworks-chat-widget",
    clientId: "riverworks",
    greeting: "Hi! I'm the RiverWorks chat assistant — ask me about hours, activities, pricing, or events.",
    bubblePrompts: ["Ask me anything!", "Need directions or hours?", "Got a question about tonight's show?"],
    accentColor: "#0e6ba8",
    accentColor2: "#f2994a",
    landingSelectors: [".fh-button", ".gform_button"],
    avoidSelectors: [".fh-button", ".fh-cal", ".gform_wrapper", ".gform_button", ".n2-ss-slider", ".mfp-wrap"],
    poweredByFooter: true
  };
</script>
<script src="https://thekliento.com/widget/kliento-widget.js" defer></script>
```

**This is the RiverWorks config, not yet embedded on buffaloriverworks.com** — holding until the master knowledge base file is updated (see `Products/Chat Widget/CHAT_WIDGET_MASTER_REFERENCE.md` in the Kliento Brain folder for full build/status notes).

## Per-client config reference

- `webhookUrl` — the client's n8n chat-widget webhook
- `clientId` — used to namespace localStorage keys and session memory per client
- `greeting` / `bubblePrompts` — client-specific copy
- `accentColor` / `accentColor2` — brand colors for the chat header gradient and accents
- `landingSelectors` — CSS selectors the mascot prefers to drift near (e.g. a booking button)
- `avoidSelectors` — CSS selectors the mascot must never overlap (CTAs, forms, sliders)
- `poweredByFooter` — show/hide the "Powered by Kliento AI" footer line

## Updating the widget

Source of truth for widget development is `Products/Chat Widget/widget-src/kliento-widget.js` in the Kliento Brain folder. Copy changes here and push to keep the public file in sync.
