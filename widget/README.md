# Kliento AI Chat Widget

Embeddable, **white-label** website chat widget. One shared script serves every client; a single brand color re-skins the entire widget. RiverWorks is the built-in example.

Live at: `https://thekliento.com/widget/kliento-widget.js`

## Embed snippet (per client)

Paste before the closing `</body>` tag (WordPress: WPCode Lite / Head & Footer Code — do NOT edit theme files):

```html
<script>
  window.KlientoWidgetConfig = {
    webhookUrl: "https://crivascamilo.app.n8n.cloud/webhook/CLIENT-chat-widget",
    clientId: "CLIENT",
    title: "CLIENT NAME",
    introSubtitle: "Ask about hours, services, and getting in touch",
    placeholder: "How can I help you?",
    launcherLabel: "Chat with us",
    logoUrl: "https://thekliento.com/widget/assets/CLIENT-logo.png",
    accentColor: "#0ea5a5",
    accentColor2: "#5ecece",
    position: "right",
    quickActions: [
      { label: "What are your hours?", message: "What are your hours today?" },
      { label: "Where are you located?", message: "Where are you located?" },
      { label: "How do I get in touch?", message: "How do I contact you?" },
      { label: "Book / request a visit", message: "I want to book or request an appointment." }
    ],
    poweredByFooter: true
  };
</script>
<script src="https://thekliento.com/widget/kliento-widget.js"></script>
```

## Config reference

| Key | Default (RiverWorks) | Notes |
|---|---|---|
| `webhookUrl` | — | Per-client n8n webhook. **Required.** |
| `clientId` | `riverworks` | Namespaces localStorage; sent to the backend. |
| `title` | `Buffalo RiverWorks` | Header + intro + answer name + aria labels. |
| `introTitle` | = `title` | Big hero headline (optional override). |
| `introSubtitle` | Ask about hours… | One line under the hero. |
| `placeholder` | How can I help you? | Composer placeholder. |
| `launcherLabel` | Ask RiverWorks | Launcher hint bubble text. |
| `quickPromptsLabel` | Quick prompts: | Label above the prompt cards. |
| `logoUrl` | `riverworks-chat-icon.png` | Header/hero/answer icon. URL, relative to `assets/`, or data-URI. Use a **colored/dark** mark (sits on a white circle). |
| `launcherLogoUrl` | = `logoUrl` | Launcher-only icon override. |
| `accentColor` | `#d31145` | **Primary brand color — drives the whole theme.** |
| `accentColor2` | `#ef6b83` | Lighter accent for gradients. |
| `position` | `left` | `left` or `right`. |
| `quickActions` | 4 RiverWorks prompts | `{label, message}`, max 4. |
| `poweredByFooter` | `true` | Show the footer line. |
| `footerText` | `Powered by Kliento AI` | Footer text. |

## Deploy a new client (6 steps)

See the full kit in the Kliento Brain repo: `Products/Widget/Widget Live/client-kit/EMBED.md`.
1. Build the client KB (template: `backend/prepare-chat-input.template.js`).
2. Clone the n8n workflow `oikD6xGpA62H7w77`; set a unique webhook `path`.
3. Add a colored logo to `widget/assets/`.
4. Pick `accentColor` / `accentColor2`.
5. Embed + smoke-test on the real page.
6. Activate the workflow + go live.

## Updating the widget

Source of truth: `Products/Widget/Widget Live/widget-src/kliento-widget.js` (Kliento Brain repo). Copy here and push to keep the public file in sync. Current: **v3 (theme-from-config, white-label)**.
