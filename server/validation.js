const MAX_FIELD_LENGTH = 2000;

function cleanText(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function validateDistributionPayload(data) {
  const input = data && typeof data === 'object' ? data : {};
  const area = cleanText(input.area, 120);
  const bags = Number(input.bags);
  const date = cleanText(input.date, 10);
  const notes = cleanText(input.notes, MAX_FIELD_LENGTH);

  if (!area || !Number.isFinite(bags) || bags <= 0 || bags > 100000000) {
    return { error: 'Area and bags are required. Bags must be a positive number.' };
  }

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Date must use YYYY-MM-DD format.' };
  }

  return { value: { area, bags, date, notes } };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { cleanText, escapeHtml, validateDistributionPayload };
