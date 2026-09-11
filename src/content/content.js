(function () {
  if (window.__SUPPORT_PACK_CONTENT_SCRIPT_LOADED__) return;
  window.__SUPPORT_PACK_CONTENT_SCRIPT_LOADED__ = true;

  function collectMetadata() {
    const userAgent = navigator.userAgent;
    const platformStr = navigator.platform || (navigator.userAgentData ? navigator.userAgentData.platform : '');

    let browser = 'Chrome';
    let platform = 'Unknown OS';

    if (window.SupportPackBrowserInfo) {
      browser = window.SupportPackBrowserInfo.getBrowserInfo(userAgent).version;
      platform = window.SupportPackBrowserInfo.getPlatformInfo(platformStr, userAgent);
    }

    let rawUrl = window.location.href;
    if (window.SupportPackRedact) {
      rawUrl = window.SupportPackRedact.redactUrl(rawUrl);
    }

    return {
      url: rawUrl,
      title: document.title || 'Untitled Page',
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      language: document.documentElement.lang || navigator.language || 'en-US',
      browser: browser,
      platform: platform
    };
  }

  function getDiagnosticsFromMainWorld() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ consoleErrors: [], failedRequests: [] });
      }, 300);

      function handleResponse(e) {
        clearTimeout(timeout);
        document.removeEventListener('__SUPPORT_PACK_RESPONSE_DIAGNOSTICS__', handleResponse);
        resolve(e.detail || { consoleErrors: [], failedRequests: [] });
      }

      document.addEventListener('__SUPPORT_PACK_RESPONSE_DIAGNOSTICS__', handleResponse);
      document.dispatchEvent(new CustomEvent('__SUPPORT_PACK_REQUEST_DIAGNOSTICS__'));
    });
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CAPTURE_DEBUG_INFO') {
      (async () => {
        try {
          const metadata = collectMetadata();
          const diagnostics = await getDiagnosticsFromMainWorld();

          sendResponse({
            success: true,
            data: {
              ...metadata,
              consoleErrors: diagnostics.consoleErrors || [],
              failedRequests: diagnostics.failedRequests || []
            }
          });
        } catch (error) {
          sendResponse({
            success: false,
            error: error.message || 'Failed to collect diagnostics from page.'
          });
        }
      })();
      return true; // Keep response channel open for async response
    }
  });
})();
