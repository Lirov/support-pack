# Support Pack — Chrome Extension (MV3)

> **Capture useful browser troubleshooting information in one click.**

Support Pack is a lightweight, privacy-focused Chrome Extension (Manifest V3) designed for Technical Support, Help Desk, Tier 2/3 Support, QA engineers, and developers. It collects diagnostic data from the active tab and generates a clean, standardized report ready to paste into tickets or communication tools like Zendesk, Jira, ServiceNow, Slack, Microsoft Teams, Email, or GitHub Issues.

---

## 🔒 Privacy Architecture

Support Pack is **100% local-first**:

- **No Remote Servers or APIs**: Zero backend, zero analytics, zero telemetry.
- **No User Accounts**: Does not require signup or authentication.
- **In-Memory Processing**: Diagnostic reports are generated in memory and never sent to external services.
- **Automatic Redaction**: Sensitive URL parameters (e.g., `token`, `access_token`, `api_key`, `password`, `session`, `auth`, `jwt`, `secret`, `sig`) are automatically scrubbed and replaced with `[REDACTED]`.
- **Zero Ingestion of Secrets**: Never collects cookies, authorization headers, passwords, form fields, `localStorage`, or `sessionStorage`.

---

## 🛠️ Installation for Development

Follow these steps to load Support Pack into Google Chrome:

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left corner.
4. Select the project directory:
   `/Users/mymac/.gemini/antigravity/scratch/support-pack`
5. Pin **Support Pack** to your Chrome toolbar.
6. Open the local test page: `file:///Users/mymac/.gemini/antigravity/scratch/support-pack/tests/test-page.html`
7. Click the Support Pack toolbar icon and click **Capture Debug Info**.

---

## 🏗️ Architecture & Project Structure

```text
support-pack/
├── manifest.json                 # Chrome Manifest V3 configuration
├── src/
│   ├── popup/
│   │   ├── popup.html            # Extension popup user interface
│   │   ├── popup.css             # Developer-tool dark theme styling
│   │   └── popup.js              # UI controller, tab query, & copy handlers
│   ├── content/
│   │   ├── main-world.js         # Intercepts console & fetch/XHR in main page context
│   │   └── content.js            # Isolated content script DOM bridge
│   ├── background/
│   │   └── service-worker.js     # Background service worker
│   └── utils/
│       ├── redact.js             # Defensive URL & text redaction engine
│       ├── browser-info.js       # Browser & OS parser
│       └── report.js             # Text report generator
├── icons/                        # Extension icons (16px, 32px, 48px, 128px)
├── tests/
│   ├── test-page.html            # Interactive manual test fixture
│   ├── redact.test.js            # Node test suite
│   └── jsc-test.js               # macOS JavaScriptCore test suite
├── README.md                     # Technical documentation & guide
├── PRIVACY.md                    # Formal privacy policy
├── STORE_LISTING.md              # Chrome Web Store copy & draft listing
└── .gitignore                    # Git ignore configuration
```

### Component Details

- **`main-world.js`**: Runs at `document_start` in `world: "MAIN"`. Intercepts `console.error`, uncaught JS exceptions, unhandled promise rejections, and failed `fetch`/`XHR` requests (HTTP 4xx/5xx). Buffers up to 25 items each in memory.
- **`content.js`**: Runs in the isolated content script world. Reads page metadata (URL, Title, Viewport, DPR, Language) and communicates with `main-world.js` via custom DOM events to retrieve diagnostics.
- **`popup.js`**: Coordinates tab capture, handles fallback dynamic script injection for unmonitored tabs, renders report preview, manages copy-to-clipboard, and handles restricted pages gracefully.

---

## 🔑 Permissions Breakdown

Support Pack adheres strictly to the principle of least privilege:

| Permission | Why It Is Required |
| :--- | :--- |
| `activeTab` | Grants temporary access to the active tab's metadata (URL, Title) when the user explicitly opens the extension popup. |
| `scripting` | Enables dynamic injection of diagnostic scripts when capturing pages loaded prior to extension install. |
| `storage` | Reserved for saving non-diagnostic user preferences locally on the device if needed. |

**No broad host permissions (such as `<all_urls>`) or invasive debugging permissions (such as `debugger`) are requested.**

---

## ⚠️ Known Limitations

1. **Pre-installation Console Errors**: Console errors occurring on tabs loaded *before* the extension was installed/enabled cannot be retroactively retrieved without invasive debugger APIs. Reloading the tab will activate error capture.
2. **Restricted Browser Pages**: Chrome security policies prohibit script execution on `chrome://` internal pages, Chrome Web Store pages, and browser settings. Support Pack detects these pages and displays a clear message.
3. **Pre-monitoring Network Requests**: Network requests completed before `main-world.js` initializes cannot be retroactively read.

---

## 🧪 Testing Instructions

### Automated Unit Testing
Run the automated unit test suite using macOS built-in JavaScriptCore:
```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc tests/jsc-test.js
```

### Manual Verification
1. Open `tests/test-page.html` in Chrome.
2. Click **Trigger console.error()** and **Fetch HTTP 404**.
3. Click **Add ?token=secret_abc123 to URL**.
4. Open the Support Pack popup and click **Capture Debug Info**.
5. Verify that:
   - The URL search param `token` is shown as `[REDACTED]`.
   - The captured console error appears under `CONSOLE ERRORS`.
   - The 404 fetch request appears under `FAILED REQUESTS`.
6. Click **Copy Report** and paste into a text editor to confirm output format.
7. Open `chrome://settings` and open Support Pack to verify the graceful error message.
