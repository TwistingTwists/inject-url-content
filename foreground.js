// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("This prints to the console of the page (injected only if the page url matched)")
console.log("this shoudl work")

// Function to parse URLs from a given text
function parseURLs(maybe_text) {
    // Use a regular expression to match URLs in the text
    let urlRegex = /(https?:\/\/[^\s]+)/g;
    // let urls = text.match(urlRegex);
    let urls = maybe_text ? maybe_text.match(urlRegex) : [];
    
    // Return the array of URLs
    return urls;
}


// Function to read the content of a URL and return the cleaned text
 function getCleanedURLContent(url) {
    // Use the Fetch API to get the content of the URL
    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Use a DOMParser to parse the HTML content
            let parser = new DOMParser();
            let doc = parser.parseFromString(data, 'text/html');
            
            // Get the text content of the body element, which should contain the main content of the page
            let textContent = doc.body.textContent;
            console.log(doc.body.textContent, "doc.body.textContent");

            // Clean the text content by removing any extra whitespace
            // let cleanedTextContent = textContent.replace(/\s+/g, ' ').trim();
            
            // Return the cleaned text content
            // return cleanedTextContent;
            return textContent;
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

// Function to get the inner text of a fieldset tag from the current page
function getClaudeText() {
    // Get the fieldset element from the current page
    // let fieldsetElement = document.querySelector('fieldset');
    const fieldsetElement = document.querySelector('div[contenteditable=true]');
    
    // Check if the fieldset element exists
    if (fieldsetElement) {
        // Get the inner text of the fieldset element
        let fieldsetText = fieldsetElement.innerText;
        
        // Return the fieldset text
        return fieldsetText;
    } else {
        console.error('Error: No fieldset element found on the page.');
    }
}

function getGeminiText() {
    // Get the fieldset element from the current page
    let fieldsetElement = document.querySelector('input-area-v2');
    
    // Check if the fieldset element exists
    if (fieldsetElement) {
        // Get the inner text of the fieldset element
        let fieldsetText = fieldsetElement.innerText;
        
        // Return the fieldset text
        return fieldsetText;
    } else {
        console.log('Error: No fieldset element found on the page.');
    }
}

function runCodeEvery3Seconds() {
    let currentURL = window.location.href;
    // console.log(`${currentURL}`);
    console.log('code is running ----')
  
    if (currentURL.includes("https://gemini.google.com")) {
      console.log(getGeminiText());
    } else if (currentURL.includes("https://claude.ai")) {
        const content = getClaudeText();
        console.log(content)
        if(content) {
            const urls =  parseURLs(content);
            if(urls && urls.length > 0) {
                console.log(urls);
                urls.forEach(url => {
                    const url_text = getCleanedURLContent(url);
                    console.log(url_text, "url_text");
                    insertTextAtCursor(url_text);
                });
            }
        } else {
            console.log('no content found')
        }
    }
  }

  function insertTextAtCursor(text) {
    console.log('inside insertTextAtCursor')
    console.log(text)
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        // range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Move caret to the end of the newly inserted text node
        range.setStart(textNode, textNode.length);
        range.setEnd(textNode, textNode.length);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        runCodeEvery3Seconds();
    }
});


