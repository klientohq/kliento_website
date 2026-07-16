# Kliento AI Chat Widget

Embeddable RiverWorks-ready chat widget with a branded logo launcher, compact home + messages panel, and local asset bundle. Hosted here so any client site can load it via one script tag, centrally versioned.

Live at: `https://thekliento.com/widget/kliento-widget.js`

## Embed snippet (per client)

Paste this before the closing `</body>` tag (or via WPCode Lite / Head & Footer Code on WordPress — do NOT edit theme files directly):

```html
<script>
  window.KlientoWidgetConfig = {
    webhookUrl: "https://crivascamilo.app.n8n.cloud/webhook/riverworks-chat-widget",
    clientId: "riverworks",
    title: "Ask RiverWorks",
    subtitle: "Hours, activities, dining, events, and trip planning",
    greeting: "Hi! Ask me about hours, activities, dining, events, parking, or planning your visit to RiverWorks.",
    homeTitle: "Plan your visit faster",
    homeSubtitle: "Start with a common question or jump straight into chat.",
    bubblePrompts: ["Ask me anything", "Need hours or parking?", "Planning a group visit?"],
    quickActions: [
      { label: "Today's hours", message: "What are your hours today?", hint: "Restaurant and activity hours" },
      { label: "Open activities", message: "What activities are open right now?", hint: "Zipline, rides, arcade, and more" },
      { label: "Upcoming events", message: "Where can I see upcoming events?", hint: "Concerts and shows" },
      { label: "Parking", message: "How does parking work at RiverWorks?", hint: "Event vs non-event parking" }
    ],
    utilityLinks: [
      { label: "Call", href: "tel:+17163422292" },
      { label: "Email", href: "mailto:info@buffaloriverworks.com" },
      { label: "Directions", href: "https://buffaloriverworks.com/contact/directions-parking/" }
    ],
    notice: {
      eyebrow: "Group planning",
      title: "Private events, large parties, field trips, and weddings",
      body: "Use the widget to start the conversation or reach the events team directly.",
      actionLabel: "Contact Events",
      actionHref: "mailto:events@buffaloriverworks.com"
    },
    accentColor: "#0c4890",
    accentColor2: "#a85a2c",
    landingSelectors: [".fh-button", ".gform_button"],
    avoidSelectors: [".fh-button", ".fh-cal", ".gform_wrapper", ".gform_button", ".n2-ss-slider", ".mfp-wrap"],
    poweredByFooter: true
  };
</script>
<script src="https://thekliento.com/widget/kliento-widget.js" defer></script>
```

**This is the RiverWorks config, not yet embedded on buffaloriverworks.com**.

## Per-client config reference

- `webhookUrl` — the client's n8n chat-widget webhook
- `clientId` — used to namespace localStorage keys and session memory per client
- `title` / `subtitle` / `homeTitle` / `homeSubtitle` — copy for the new Home + Messages structure
- `greeting` / `bubblePrompts` — chat greeting and launcher prompts
- `quickActions` — button cards that launch common questions directly into chat
- `utilityLinks` — direct shortcut buttons such as call, email, directions, or tickets
- `notice` — optional promo / routing card for a high-value path like events or field trips
- `accentColor` / `accentColor2` — brand colors for the chat header gradient and accents
- `assetBaseUrl` / `logoUrl` / `launcherLogoUrl` — optional overrides for the bundled logo assets in `widget/assets/`
- `landingSelectors` — CSS selectors the mascot prefers to drift near (e.g. a booking button)
- `avoidSelectors` — CSS selectors the mascot must never overlap (CTAs, forms, sliders)
- `poweredByFooter` — show/hide the "Powered by Kliento AI" footer line

## Updating the widget

Source of truth for widget development is `Products/Widget/Widget Live/widget-src/kliento-widget.js` in the Kliento Brain folder. Copy changes here and push to keep the public file in sync.
