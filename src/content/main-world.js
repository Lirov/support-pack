(function () {
  if (window.__SUPPORT_PACK_INITIALIZED__) return;
  window.__SUPPORT_PACK_INITIALIZED__ = true;

  const MAX_ERRORS = 25;
  const diagnostics = {
    consoleErrors: [],
    failedRequests: []
  };
  window.__SUPPORT_PACK_ERRORS__ = diagnostics;

  function redactUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return urlStr;
    try {
      const dummyBase = 'http://relative-placeholder.local';
      const isRelative = !urlStr.includes('://') && !urlStr.startsWith('file:/');
      const parsed = new URL(urlStr, isRelative ? dummyBase : undefined);
      const sensitiveKeys = [/token/i, /access_token/i, /api_key/i, /apikey/i, /password/i, /auth/i, /authorization/i, /session/i, /secret/i, /jwt/i, /sig/i];
      for (const [key] of Array.from(parsed.searchParams.entries())) {
        if (sensitiveKeys.some(p => p.test(key))) {
          parsed.searchParams.set(key, '[REDACTED]');
        }
      }
      return isRelative ? parsed.pathname + parsed.search + parsed.hash : parsed.href;
    } catch (e) {
      return urlStr.replace(/([?&](?:token|access_token|api_key|password|auth|session|secret|sig)=)[^&]+/gi, '$1[REDACTED]');
    }
  }

  function addConsoleError(msg) {
    if (!msg) return;
    if (diagnostics.consoleErrors.length >= MAX_ERRORS) {
      diagnostics.consoleErrors.shift();
    }
    diagnostics.consoleErrors.push(String(msg));
  }

  function addFailedRequest(reqStr) {
    if (!reqStr) return;
    if (diagnostics.failedRequests.length >= MAX_ERRORS) {
      diagnostics.failedRequests.shift();
    }
    diagnostics.failedRequests.push(String(reqStr));
  }

  // 1. Hook console.error
  const originalConsoleError = console.error;
  console.error = function (...args) {
    try {
      const formatted = args.map(arg => {
        if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg); } catch (e) { return String(arg); }
        }
        return String(arg);
      }).join(' ');
      addConsoleError(formatted);
    } catch (e) {}
    originalConsoleError.apply(console, args);
  };

  // 2. Listen for window errors and unhandled promise rejections
  window.addEventListener('error', function (event) {
    if (event.error) {
      addConsoleError(`${event.error.name || 'Error'}: ${event.error.message || event.message}`);
    } else if (event.message) {
      addConsoleError(event.message);
    }
  }, true);

  window.addEventListener('unhandledrejection', function (event) {
    const reason = event.reason;
    if (reason instanceof Error) {
      addConsoleError(`UnhandledRejection: ${reason.name}: ${reason.message}`);
    } else {
      addConsoleError(`UnhandledRejection: ${String(reason)}`);
    }
  }, true);

  // 3. Intercept Fetch API
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = async function (input, init) {
      let method = (init && init.method) ? init.method.toUpperCase() : 'GET';
      let url = typeof input === 'string' ? input : (input && input.url ? input.url : 'unknown');
      url = redactUrl(url);

      try {
        const response = await originalFetch.apply(this, arguments);
        if (!response.ok && response.status >= 400) {
          addFailedRequest(`${method} ${url} -> ${response.status}`);
        }
        return response;
      } catch (err) {
        addFailedRequest(`${method} ${url} -> ERR_FAILED (${err.message || 'Network Error'})`);
        throw err;
      }
    };
  }

  // 4. Intercept XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  if (originalXHR) {
    const originalOpen = originalXHR.prototype.open;
    const originalSend = originalXHR.prototype.send;

    originalXHR.prototype.open = function (method, url, ...rest) {
      this._sp_method = (method || 'GET').toUpperCase();
      this._sp_url = redactUrl(url || '');
      return originalOpen.apply(this, [method, url, ...rest]);
    };

    originalXHR.prototype.send = function (...args) {
      this.addEventListener('loadend', function () {
        try {
          if (this.status >= 400 || this.status === 0) {
            const statusText = this.status === 0 ? 'ERR_NETWORK_FAILED' : this.status;
            addFailedRequest(`${this._sp_method || 'GET'} ${this._sp_url || 'unknown'} -> ${statusText}`);
          }
        } catch (e) {}
      });
      return originalSend.apply(this, args);
    };
  }

  // 5. Setup DOM event listener to respond to isolated world content script
  document.addEventListener('__SUPPORT_PACK_REQUEST_DIAGNOSTICS__', function () {
    document.dispatchEvent(new CustomEvent('__SUPPORT_PACK_RESPONSE_DIAGNOSTICS__', {
      detail: {
        consoleErrors: diagnostics.consoleErrors,
        failedRequests: diagnostics.failedRequests
      }
    }));
  });
})();
