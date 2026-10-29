const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanText, escapeHtml, validateDistributionPayload } = require('./validation');

test('validates and normalizes distribution payloads', () => {
  const result = validateDistributionPayload({ area: '  Nakasero ', bags: '45', date: '2026-10-29', notes: '  delivered  ' });
  assert.deepEqual(result.value, { area: 'Nakasero', bags: 45, date: '2026-10-29', notes: 'delivered' });
});

test('rejects invalid distribution payloads', () => {
  assert.match(validateDistributionPayload({ area: '', bags: 0 }).error, /positive number/);
  assert.match(validateDistributionPayload({ area: 'Kampala', bags: 2, date: '29-10-2026' }).error, /YYYY-MM-DD/);
});

test('limits and escapes untrusted text', () => {
  assert.equal(cleanText('  hello  '), 'hello');
  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
});
