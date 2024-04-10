// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log(
  "This prints to the console of the page (injected only if the page url matched)"
);
console.log("this should work");

// Function to parse URLs from a given text
function parseURLs(maybe_text) {
  // Use a regular expression to match URLs in the text
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  let urls = maybe_text ? maybe_text.match(urlRegex) : [];

  // Return the array of URLs
  return urls;
}

// Function to read the content of a URL and return the cleaned text
async function getCleanedURLContent(url) {
  try {
    // Use the Fetch API to get the content of the URL
    console.log('makeing the request')
    const response = await fetch(`https://indexer.felvin.com/getUrlContent?url=${encodeURIComponent(url)}`);
    const data = await response.text();

    // Return the cleaned text content
    return data;
  } catch (error) {
    console.log("Error:", error);
  }
}

// Function to get the inner text of a fieldset tag from the current page
function getClaudeText() {
  const fieldsetElement = document.querySelector("div[contenteditable=true]");

  // Check if the fieldset element exists
  if (fieldsetElement) {
    // Get the inner text of the fieldset element
    let fieldsetText = fieldsetElement.innerText;

    // Return the fieldset text
    return fieldsetText;
  } else {
    console.error("Error: No fieldset element found on the page.");
  }
}

function getGeminiText() {
  let fieldsetElement = document.querySelector("input-area-v2");

  // Check if the fieldset element exists
  if (fieldsetElement) {
    // Get the inner text of the fieldset element
    let fieldsetText = fieldsetElement.innerText;

    // Return the fieldset text
    return fieldsetText;
  } else {
    console.log("Error: No fieldset element found on the page.");
  }
}

async function getContentFromIndexerAndInsert(content) {
  console.log("getContentFromIndexerAndInsert ----")
  if (content) {
    const urls = parseURLs(content);
    if (urls && urls.length > 0) {
      console.log(urls);
      urls.forEach(async (url) => {
        if (!window.urlContentMap) {
          window.urlContentMap = new Map();
        }

        if (!window.urlContentMap.has(url)) {
          const url_text = await getCleanedURLContent(url);
          console.log(url_text, "url_text");
          window.urlContentMap.set(url, url_text);
          createCopyButton(url, url_text);
        } else {
        if (window.urlContentMap.has(url)) {
          const url_text = window.urlContentMap.get(url);
          createCopyButton(url, url_text);
        }
        }
      });
    }
  } else {
    console.log("no content found");
  }
}

function getKeyboardCursorScreenPosition(element) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top
    };
  } else {
    return null;
  }
}

function createCopyButton(url, content) {
  console.log('Creating copy button');
  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy";
  // copyButton.style.width = "40px";
  copyButton.style.height = "12px";
  copyButton.style.backgroundColor = "lightblue";
  copyButton.style.position = "fixed";
  copyButton.style.fontStyle = "italic";
  copyButton.style.fontSize = "9px";

  // Get the keyboard cursor screen position
  const cursorPosition = getKeyboardCursorScreenPosition();
  console.log(`keyboard position ${cursorPosition}`)
  if (cursorPosition) {
    copyButton.style.left = cursorPosition.x + "px";
    copyButton.style.top = cursorPosition.y + "px";
  } else {
    // If the cursor position is not available, use the event.clientX and event.clientY
    copyButton.style.left = event.clientX + "px";
    copyButton.style.top = event.clientY + "px";
  }

  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(content);
    console.log("Copied to clipboard:", content);
  });
  document.body.appendChild(copyButton);
}

async function runCodeEvery3Seconds() {
  try {
    let currentURL = window.location.href;
    console.log("code is running ----");

    if (currentURL.includes("https://gemini.google.com")) {
      console.log("gemini path")
      const content = getGeminiText();
      console.log(content);
      await getContentFromIndexerAndInsert(content)

    } else if (currentURL.includes("https://claude.ai")) {
      const content = getClaudeText();
      console.log(content);
      await getContentFromIndexerAndInsert(content)
    }
  } catch (error) {
    console.log("error: runCodeEvery3Seconds", error);
  }
}

setInterval(runCodeEvery3Seconds, 3000);
