const assert = require('assert');

const { redactUrl, redactText } = require('../src/utils/redact.js');
const { getBrowserInfo, getPlatformInfo } = require('../src/utils/browser-info.js');
const { generateReport } = require('../src/utils/report.js');

console.log('Running Support Pack Unit Tests...\n');

// 1. Redaction Tests
console.log('1. Testing URL Redaction...');
const testUrl = 'https://example.com/reset?token=secret123&user=test&api_key=key99&auth=bearer_abc';
const redacted = redactUrl(testUrl);
console.log('Original:', testUrl);
console.log('Redacted:', redacted);

assert.strictEqual(redacted.includes('secret123'), false, 'Token value should be redacted');
assert.strictEqual(redacted.includes('key99'), false, 'API key value should be redacted');
assert.strictEqual(redacted.includes('bearer_abc'), false, 'Auth value should be redacted');
assert.strictEqual(redacted.includes('user=test'), true, 'Non-sensitive param should remain untouched');
assert.strictEqual(redacted.includes('token=[REDACTED]'), true, 'Token replaced with [REDACTED]');
console.log('✓ URL Redaction Test Passed!\n');

// 2. Text Redaction Tests
console.log('2. Testing Text Bearer Redaction...');
const sampleText = 'Error authorization: Bearer eyJhbGciOiJIUzI1NiJ9.secret';
const redactedText = redactText(sampleText);
assert.strictEqual(redactedText.includes('eyJhbGciOiJIUzI1NiJ9'), false);
assert.strictEqual(redactedText.includes('Bearer [REDACTED]'), true);
console.log('✓ Text Redaction Test Passed!\n');

// 3. Browser Info Tests
console.log('3. Testing Browser & Platform Parser...');
const sampleUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const browserInfo = getBrowserInfo(sampleUA);
const platformInfo = getPlatformInfo('MacIntel', sampleUA);

assert.strictEqual(browserInfo.name, 'Chrome');
assert.strictEqual(browserInfo.version, 'Chrome 128');
assert.strictEqual(platformInfo, 'macOS');
console.log('✓ Browser Info Test Passed!\n');

// 4. Report Format Tests
console.log('4. Testing Report Generator Output...');
const report = generateReport({
  url: 'https://example.com/account?token=[REDACTED]',
  title: 'Account Settings',
  timestamp: '2026-09-11 08:42:15',
  browser: 'Chrome 151',
  platform: 'macOS',
  viewportWidth: 1512,
  viewportHeight: 982,
  devicePixelRatio: 2,
  language: 'en-US',
  consoleErrors: [
    'TypeError: Cannot read properties of undefined',
    'Failed to initialize account component'
  ],
  failedRequests: [
    'GET /api/user -> 500',
    'POST /api/settings -> 403'
  ]
});

console.log(report);
assert.strictEqual(report.includes('SUPPORT PACK'), true);
assert.strictEqual(report.includes('URL: https://example.com/account?token=[REDACTED]'), true);
assert.strictEqual(report.includes('1. TypeError: Cannot read properties of undefined'), true);
assert.strictEqual(report.includes('1. GET /api/user -> 500'), true);
assert.strictEqual(report.includes('Generated locally by Support Pack'), true);
console.log('✓ Report Generator Test Passed!\n');

console.log('ALL UNIT TESTS PASSED SUCCESSFULLY! 🎉');
