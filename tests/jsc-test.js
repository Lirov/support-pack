load("src/utils/redact.js");
load("src/utils/browser-info.js");
load("src/utils/report.js");

print("=========================================");
print("Running Support Pack JavaScriptCore Tests");
print("=========================================\n");

function assert(condition, message) {
  if (!condition) {
    throw new Error("Assertion Failed: " + message);
  }
}

// 1. Redaction Tests
print("1. Testing URL Redaction...");
var testUrl = "https://example.com/reset?token=secret123&user=test&api_key=key99&auth=bearer_abc";
var redacted = SupportPackRedact.redactUrl(testUrl);
print("Original: " + testUrl);
print("Redacted: " + redacted);

assert(redacted.indexOf("secret123") === -1, "Token value should be redacted");
assert(redacted.indexOf("key99") === -1, "API key value should be redacted");
assert(redacted.indexOf("bearer_abc") === -1, "Auth value should be redacted");
assert(redacted.indexOf("user=test") !== -1, "Non-sensitive param should remain untouched");
assert(redacted.indexOf("token=[REDACTED]") !== -1, "Token replaced with [REDACTED]");
print("✓ URL Redaction Test Passed!\n");

// 2. Text Redaction Tests
print("2. Testing Text Bearer Redaction...");
var sampleText = "Error authorization: Bearer eyJhbGciOiJIUzI1NiJ9.secret";
var redactedText = SupportPackRedact.redactText(sampleText);
assert(redactedText.indexOf("eyJhbGciOiJIUzI1NiJ9") === -1, "Bearer token should be redacted");
assert(redactedText.indexOf("Bearer [REDACTED]") !== -1, "Bearer replaced with [REDACTED]");
print("✓ Text Redaction Test Passed!\n");

// 3. Browser Info Tests
print("3. Testing Browser & Platform Parser...");
var sampleUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
var browserInfo = SupportPackBrowserInfo.getBrowserInfo(sampleUA);
var platformInfo = SupportPackBrowserInfo.getPlatformInfo("MacIntel", sampleUA);

assert(browserInfo.name === "Chrome", "Browser name should be Chrome");
assert(browserInfo.version === "Chrome 128", "Browser version should be Chrome 128");
assert(platformInfo === "macOS", "Platform should be macOS");
print("✓ Browser Info Test Passed!\n");

// 4. Report Generator Tests
print("4. Testing Report Generator Output...");
var report = SupportPackReport.generateReport({
  url: "https://example.com/account?token=[REDACTED]",
  title: "Account Settings",
  timestamp: "2026-09-11 08:42:15",
  browser: "Chrome 151",
  platform: "macOS",
  viewportWidth: 1512,
  viewportHeight: 982,
  devicePixelRatio: 2,
  language: "en-US",
  consoleErrors: [
    "TypeError: Cannot read properties of undefined",
    "Failed to initialize account component"
  ],
  failedRequests: [
    "GET /api/user -> 500",
    "POST /api/settings -> 403"
  ]
});

print("--- Generated Report Sample ---");
print(report);
print("-------------------------------\n");

assert(report.indexOf("SUPPORT PACK") !== -1, "Header present");
assert(report.indexOf("URL: https://example.com/account?token=[REDACTED]") !== -1, "Redacted URL present");
assert(report.indexOf("1. TypeError: Cannot read properties of undefined") !== -1, "Console error listed");
assert(report.indexOf("1. GET /api/user -> 500") !== -1, "Failed request listed");
assert(report.indexOf("Generated locally by Support Pack") !== -1, "Privacy footer present");
print("✓ Report Generator Test Passed!\n");

print("ALL TESTS PASSED SUCCESSFULLY! 🎉");
