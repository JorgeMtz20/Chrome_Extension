let isCaptureEnabled = false;

document.addEventListener("DOMContentLoaded", function () {
  // Capture screenshots when the extension button is clicked
  document.getElementById("captureButton").addEventListener("click", function () {
    if (!isCaptureEnabled) {
      // Start capture only if not already capturing
      isCaptureEnabled = true;
      captureScreenshot();
    }
  });

  // Delete a screenshot when the delete button is clicked
  document.getElementById("screenshotsList").addEventListener("click", function (event) {
    const target = event.target;
    if (target.classList.contains("delete-button")) {
      const screenshotContainer = target.closest(".screenshot-container");
      const index = parseInt(screenshotContainer.dataset.index);
      deleteScreenshot(index);
    }
  });
});

function captureScreenshot() {
  chrome.runtime.sendMessage({ action: "startCapture" }, function (response) {
    if (response.success) {
      saveScreenshot(response.dataUrl);
    }
  });
}

function saveScreenshot(dataUrl) {
  chrome.storage.local.get("screenshots", function (result) {
    const screenshots = result.screenshots || [];
    screenshots.push({ dataUrl: dataUrl });
    chrome.storage.local.set({ screenshots: screenshots }, function () {
      // Refresh the UI after saving the screenshot
      refreshScreenshotsUI();
    });
  });
}

function createScreenshotContainer(index, screenshotUrl) {
  const screenshotContainer = document.createElement("div");
  screenshotContainer.className = "screenshot-container";
  screenshotContainer.dataset.index = index;

  const screenshotElement = createScreenshotElement(screenshotUrl);
  screenshotContainer.appendChild(screenshotElement);

  const deleteButton = createDeleteButton();
  screenshotContainer.appendChild(deleteButton);
  return screenshotContainer;
}

function createScreenshotElement(src) {
  const screenshotElement = document.createElement("img");
  screenshotElement.src = src;
  screenshotElement.className = "screenshot";
  return screenshotElement;
}

function createDeleteButton() {
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.textContent = "Delete";
  return deleteButton;
}

function deleteScreenshot(index) {
  chrome.storage.local.get("screenshots", function (result) {
    const screenshots = result.screenshots || [];
    if (index >= 0 && index < screenshots.length) {
      screenshots.splice(index, 1);
      chrome.storage.local.set({ screenshots: screenshots }, function () {
        // Refresh the UI after deleting the screenshot
        refreshScreenshotsUI();
      });
    }
  });
}

function refreshScreenshotsUI() {
  const screenshotsList = document.getElementById("screenshotsList");
  screenshotsList.innerHTML = ""; // Clear the existing screenshots
  chrome.storage.local.get("screenshots", function (result) {
    const screenshots = result.screenshots || [];
    screenshots.forEach(function (screenshot, index) {
      const screenshotContainer = createScreenshotContainer(index, screenshot.dataUrl);
      screenshotsList.appendChild(screenshotContainer);
    });
  });
}
