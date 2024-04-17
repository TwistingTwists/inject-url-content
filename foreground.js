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


const BUTTON_ID = window.location.href.includes('claude.ai') ? 'claude-url-inject' : (window.location.href.includes('chat.openai.com') ? 'openai-url-inject' : 'gemini-url-inject');

function showToast(message) {
  // Create a new div element for the toast
  const toast = document.createElement('div');
  toast.id = 'toast';
  console.log("Showing toast")

  // Add the message to the toast
  toast.textContent = message;

  // Get the button container element
  const buttonContainer = document.getElementById('buttonContainer');

  // Check if the button container exists
  if (buttonContainer) {
    // Append the toast to the button container
    buttonContainer.appendChild(toast);
  } else {
    // If the button container doesn't exist, append the toast to the body
    document.body.appendChild(toast);
  }

  // Remove the toast after 3 seconds (3000 milliseconds)
  setTimeout(() => {
    toast.remove();
  }, 3000);
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

function getOpenAIText() {
  let fieldsetElement = document.querySelector("textarea#prompt-textarea");
  // Check if the fieldset element exists
  if (fieldsetElement) {
    // Get the inner text of the fieldset element
    let fieldsetText = fieldsetElement.value;

    // Return the fieldset text
    return fieldsetText;
  } else {
    console.log("Error: No textarea element found on the page.");
  }
}

async function getContentFromIndexerAndInsert(content) {
  console.log("getContentFromIndexerAndInsert ----");
  if (content) {
    const urls = parseURLs(content);
    if (urls && urls.length > 0) {
      console.log(urls);
      for (const url of urls) {
        if (!window.urlContentMap) {
          window.urlContentMap = new Map();
        }

        if (!window.urlButtonCreatedSet) {
          window.urlButtonCreatedSet = new Set();
        }

        if (!window.urlContentMap.has(url)) {
          const url_text = await getCleanedURLContent(url);
          console.log(url_text, "url_text");
          window.urlContentMap.set(url, url_text);
        }

        if (window.urlContentMap.has(url) && !window.urlButtonCreatedSet.has(url)) {
          const url_text = window.urlContentMap.get(url);
          createInsertContentButton(url, url_text);
          window.urlButtonCreatedSet.add(url);
        }
      }
    } else {
        const existingButton = document.getElementById(BUTTON_ID);
        window.urlButtonCreatedSet = new Set();
        if (existingButton) {
          existingButton.remove();
        }
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

function createInsertContentButton(url, content) {
  console.log('Creating copy button');

  const buttonElement = document.createElement('button');
  buttonElement.id = BUTTON_ID;
  buttonElement.innerHTML = `<img src="${chrome.runtime.getURL('button.png')}">`;

  buttonElement.addEventListener("click", () => {
    navigator.clipboard.writeText(content);
    console.log("Copied to clipboard:", content);
    showToast("URL content Copied, Ctrl-V to paste")
  });

  let buttonContainer = document.getElementById('buttonContainer');
  if (!buttonContainer) {
    buttonContainer = document.createElement('div');
    buttonContainer.id = 'buttonContainer';
    document.body.appendChild(buttonContainer);
  }
  buttonContainer.appendChild(buttonElement);
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

    } else if (currentURL.includes("https://chat.openai.com")) {
      const content = getOpenAIText();
      console.log(content);
      await getContentFromIndexerAndInsert(content)
    }
  } catch (error) {
    console.log("error: runCodeEvery3Seconds", error);
  }
}

setInterval(runCodeEvery3Seconds, 800);
