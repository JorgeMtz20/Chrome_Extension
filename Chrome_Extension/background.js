let isCaptureEnabled = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startCapture") {
    isCaptureEnabled = true;
    captureVisibleTab(sendResponse);
    return true;
  } else if (request.action === "stopCapture") {
    isCaptureEnabled = false;
    sendResponse({ success: true });
  }
});

function captureVisibleTab(sendResponse) {
  chrome.tabs.captureVisibleTab(function (dataUrl) {
    sendResponse({ success: true, dataUrl: dataUrl });
  });
}
