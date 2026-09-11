(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.SupportPackReport = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function generateReport(data) {
    const timestamp = data.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19);

    let consoleSection = 'No captured console errors.';
    if (data.consoleErrors && data.consoleErrors.length > 0) {
      consoleSection = data.consoleErrors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
    }

    let failedReqSection = 'No captured failed requests.';
    if (data.failedRequests && data.failedRequests.length > 0) {
      failedReqSection = data.failedRequests.map((req, idx) => `${idx + 1}. ${req}`).join('\n');
    }

    const report = [
      '==================================================',
      'SUPPORT PACK',
      '==================================================',
      '',
      'PAGE',
      `URL: ${data.url || 'Unknown'}`,
      `Title: ${data.title || 'Untitled Page'}`,
      `Captured: ${timestamp}`,
      '',
      'ENVIRONMENT',
      `Browser: ${data.browser || 'Unknown Browser'}`,
      `Platform: ${data.platform || 'Unknown OS'}`,
      `Viewport: ${data.viewportWidth || '?'} x ${data.viewportHeight || '?'}`,
      `Device Pixel Ratio: ${data.devicePixelRatio || 1}`,
      `Language: ${data.language || 'en-US'}`,
      '',
      'CONSOLE ERRORS',
      consoleSection,
      '',
      'FAILED REQUESTS',
      failedReqSection,
      '',
      '==================================================',
      'Generated locally by Support Pack',
      'No diagnostic data was uploaded.',
      '=================================================='
    ].join('\n');

    return report;
  }

  return {
    generateReport
  };
});
