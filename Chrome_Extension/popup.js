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

  // Capture screenshots when an F key is pressed
  document.addEventListener("keydown", function (event) {
    const fKeyNumber = parseInt(event.key.substring(1));
    if (event.key.startsWith("F") && fKeyNumber >= 1 && fKeyNumber <= 24) {
      event.preventDefault(); // Prevent default behavior of F keys
      if (!isCaptureEnabled) {
        // Start capture only if not already capturing
        isCaptureEnabled = true;
        captureScreenshot("F" + fKeyNumber); // Pass the F key source as "F1", "F2", etc.
      }
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

  refreshScreenshotsUI(); // Refresh UI on popup load
});

function captureScreenshot(source) {
  chrome.runtime.sendMessage({ action: "startCapture", source: source }, function (response) {
    if (response.success) {
      saveScreenshot(response.dataUrl, source); // Pass the source to saveScreenshot
      isCaptureEnabled = false; // Reset the flag after capturing
    }
  });
}

function saveScreenshot(dataUrl, source) { // Receive the source parameter
  chrome.storage.local.get("screenshots", function (result) {
    const screenshots = result.screenshots || [];
    screenshots.push({ dataUrl: dataUrl, source: source }); // Save the source with the screenshot
    chrome.storage.local.set({ screenshots: screenshots }, function () {
      // Refresh the UI after saving the screenshot
      refreshScreenshotsUI();
    });
  });
}

function createScreenshotContainer(index, screenshotUrl, source) {
  const screenshotContainer = document.createElement("div");
  screenshotContainer.className = "screenshot-container";
  screenshotContainer.dataset.index = index;

  const screenshotElement = createScreenshotElement(screenshotUrl);
  screenshotContainer.appendChild(screenshotElement);

  const fKeyLabel = createFKeyLabel(source);
  screenshotContainer.appendChild(fKeyLabel);

  const deleteButton = createDeleteButton();
  screenshotContainer.appendChild(deleteButton); // Add the delete button to the container

  return screenshotContainer;
}

function createFKeyLabel(source) {
  const fKeyLabel = document.createElement("div");
  fKeyLabel.className = "fkey-label";
  fKeyLabel.textContent = source ? source.toUpperCase() : "Unknown"; // Show the F key source text or "Unknown" if source is not provided
  return fKeyLabel;
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
  deleteButton.innerHTML = "&#10060;"; // This is the HTML entity for the "x" symbol
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
      const screenshotContainer = createScreenshotContainer(index, screenshot.dataUrl, screenshot.source); // Pass the source to createScreenshotContainer
      screenshotsList.appendChild(screenshotContainer);
    });
  });
}
