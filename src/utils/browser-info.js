(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.SupportPackBrowserInfo = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function getBrowserInfo(userAgent) {
    const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
    let name = 'Browser';
    let version = '';

    if (/edg\/([0-9.]+)/i.test(ua)) {
      name = 'Edge';
      version = ua.match(/edg\/([0-9.]+)/i)[1];
    } else if (/chrome\/([0-9.]+)/i.test(ua)) {
      name = 'Chrome';
      version = ua.match(/chrome\/([0-9.]+)/i)[1];
    } else if (/safari\/([0-9.]+)/i.test(ua) && !/chrome/i.test(ua)) {
      name = 'Safari';
      version = ua.match(/version\/([0-9.]+)/i)?.[1] || '';
    } else if (/firefox\/([0-9.]+)/i.test(ua)) {
      name = 'Firefox';
      version = ua.match(/firefox\/([0-9.]+)/i)[1];
    }

    const majorVersion = version.split('.')[0] || version;
    return {
      name,
      version: majorVersion ? `${name} ${majorVersion}` : name,
      fullVersion: version
    };
  }

  function getPlatformInfo(platformStr, userAgent) {
    const plat = platformStr || (typeof navigator !== 'undefined' ? navigator.platform : '');
    const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

    if (/mac/i.test(plat) || /macintosh/i.test(ua)) return 'macOS';
    if (/win/i.test(plat) || /windows/i.test(ua)) return 'Windows';
    if (/linux/i.test(plat) || /linux/i.test(ua)) return 'Linux';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    if (/android/i.test(ua)) return 'Android';

    return plat || 'Unknown OS';
  }

  return {
    getBrowserInfo,
    getPlatformInfo
  };
});
