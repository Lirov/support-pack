(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.SupportPackRedact = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const SENSITIVE_PARAM_PATTERNS = [
    /token/i,
    /access_token/i,
    /api_key/i,
    /apikey/i,
    /password/i,
    /passwd/i,
    /pass/i,
    /auth/i,
    /authorization/i,
    /session/i,
    /sid/i,
    /secret/i,
    /jwt/i,
    /bearer/i,
    /credential/i,
    /private_key/i,
    /signature/i,
    /sig/i
  ];

  function redactUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return urlStr;
    try {
      const dummyBase = 'http://relative-placeholder.local';
      const isRelative = !urlStr.includes('://') && !urlStr.startsWith('file:/');
      const parsed = new URL(urlStr, isRelative ? dummyBase : undefined);

      const params = parsed.searchParams;
      for (const [key] of Array.from(params.entries())) {
        if (SENSITIVE_PARAM_PATTERNS.some((pattern) => pattern.test(key))) {
          params.set(key, '[REDACTED]');
        }
      }

      let result = isRelative
        ? parsed.pathname + parsed.search + parsed.hash
        : parsed.href;

      result = result.replace(/([?&](?:token|access_token|api_key|password|auth|session|secret|sig)=)[^&]+/gi, '$1[REDACTED]');
      return result;
    } catch (e) {
      return urlStr.replace(/([?&](?:token|access_token|api_key|password|auth|session|secret|sig)=)[^&]+/gi, '$1[REDACTED]');
    }
  }

  function redactText(text) {
    if (!text || typeof text !== 'string') return text;
    let cleaned = text.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/g, 'Bearer [REDACTED]');
    cleaned = cleaned.replace(/Basic\s+[A-Za-z0-9\+\/]+=*/g, 'Basic [REDACTED]');
    return cleaned;
  }

  return {
    redactUrl,
    redactText
  };
});
