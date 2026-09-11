document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('capture-btn');
  const recaptureBtn = document.getElementById('recapture-btn');
  const copyBtn = document.getElementById('copy-btn');
  const reportText = document.getElementById('report-text');
  const reportSection = document.getElementById('report-section');
  const actionSection = document.getElementById('action-section');
  const errorBox = document.getElementById('error-box');
  const errorMessage = document.getElementById('error-message');
  const copyToast = document.getElementById('copy-toast');
  const privacyToggle = document.getElementById('privacy-toggle');
  const privacyDetails = document.getElementById('privacy-details');

  privacyToggle.addEventListener('click', () => {
    privacyDetails.classList.toggle('hidden');
  });

  async function captureInfo() {
    hideError();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        showError('No active tab found.');
        return;
      }

      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('https://chrome.google.com/webstore')) {
        showError('Support Pack cannot capture information from this Chrome internal or restricted page.');
        return;
      }

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/main-world.js'],
          world: 'MAIN'
        });

        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [
            'src/utils/redact.js',
            'src/utils/browser-info.js',
            'src/content/content.js'
          ]
        });

        const response = await chrome.tabs.sendMessage(tab.id, { action: 'CAPTURE_DEBUG_INFO' });

        if (response && response.success) {
          renderReport(response.data);
        } else {
          showError(response ? response.error : 'Failed to retrieve diagnostic data.');
        }
      } catch (injectErr) {
        showError(`Cannot capture diagnostics from this tab: ${injectErr.message || injectErr}`);
      }
    } catch (e) {
      showError(`Error capturing debug info: ${e.message || e}`);
    }
  }

  function renderReport(data) {
    let reportString = '';
    if (window.SupportPackReport) {
      reportString = window.SupportPackReport.generateReport(data);
    } else {
      reportString = JSON.stringify(data, null, 2);
    }

    reportText.value = reportString;
    reportSection.classList.remove('hidden');
    actionSection.classList.add('hidden');
  }

  async function copyReport() {
    const text = reportText.value;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast();
    } catch (err) {
      reportText.select();
      document.execCommand('copy');
      showToast();
    }
  }

  function showToast() {
    copyToast.classList.remove('hidden');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyToast.classList.add('hidden');
      copyBtn.textContent = 'Copy Report';
    }, 2000);
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBox.classList.remove('hidden');
  }

  function hideError() {
    errorBox.classList.add('hidden');
    errorMessage.textContent = '';
  }

  captureBtn.addEventListener('click', captureInfo);
  recaptureBtn.addEventListener('click', captureInfo);
  copyBtn.addEventListener('click', copyReport);
});
