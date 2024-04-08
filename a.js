function readInputSectionContents(inputSection) {
    const urlRegex = /https?:\/\/[^\s]+/g;
   
    let maybe_text = readContentEditableDiv();
    const generatedUrls = maybe_text ? maybe_text.match(urlRegex) : null;
    console.log(generatedUrls)
}


function readContentEditableDiv() {
    const contentEditableDiv = document.querySelector('div[contenteditable=true]');
    if (contentEditableDiv) {
        return contentEditableDiv.innerText;
    } else {
        console.error('Error: No contenteditable=true div found in the DOM.');
        return null;
    }
}


"doc.body.textContent"