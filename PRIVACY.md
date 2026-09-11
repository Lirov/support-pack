# Privacy Policy — Support Pack

**Effective Date:** September 11, 2026

Support Pack ("we", "our", or "the extension") is designed from the ground up to respect user privacy. This Privacy Policy details how data is handled by the Support Pack Chrome Extension.

---

## 1. Core Privacy Commitment

**Support Pack collects zero personal data and uploads zero diagnostic data to any external server.**

All diagnostic collection, processing, redaction, and report generation happen 100% locally on your personal device within your Google Chrome browser memory.

---

## 2. Information Handled Locally

When you explicitly click **"Capture Debug Info"**, Support Pack temporarily reads the following information from your active tab:

- Page URL and Title
- Capture Timestamp
- Browser Name, Version, Platform/OS, Viewport Dimensions, Device Pixel Ratio, and Language
- Recent JavaScript console errors (`console.error`, uncaught exceptions, unhandled rejections)
- Recent failed HTTP network requests (status codes 4xx/5xx, HTTP method, redacted path)

### What We NEVER Collect or Touch
- User accounts or identity information
- Cookies or session data
- Form inputs, passwords, or text fields
- Request/Response headers (Authorization, Bearer tokens, etc.)
- Request/Response bodies
- `localStorage` or `sessionStorage` contents
- Browsing history outside the active tab click

---

## 3. Data Redaction & Sanitization

Support Pack contains an automatic defensive redaction filter. Prior to rendering a report:
- URL query parameters containing sensitive keys (`token`, `access_token`, `api_key`, `password`, `auth`, `authorization`, `session`, `jwt`, `secret`, `sig`, etc.) are automatically scrubbed and replaced with `[REDACTED]`.
- Authentication tokens detected in error messages are scrubbed.

---

## 4. Third-Party Sharing & Storage

- **No Remote Servers**: Support Pack has no backend servers, database, cloud sync, or remote APIs.
- **No Analytics/Telemetry**: Support Pack contains no tracking scripts, analytics tools, or error reporting beacons.
- **No Data Sale**: We do not sell, rent, or trade diagnostic data to third parties under any circumstances.

---

## 5. Chrome Extension Permissions

Support Pack requests only minimal, necessary permissions:

- **`activeTab`**: Used strictly to access current page metadata when you open the popup.
- **`scripting`**: Used to execute diagnostic monitoring scripts in the active tab.
- **`storage`**: Used solely for local, on-device user settings storage if configured.

---

## 6. Contact & Open Source

Support Pack operates completely transparently. You can audit the full codebase locally in your browser extension installation directory.
