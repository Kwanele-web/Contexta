// --- SECTION 1: THE SELECTORS ---
const editorBox = document.getElementById('editor'); 
const sidebarMenu = document.getElementById('menu');
const displayTitle = document.getElementById('active-word-display');
const outputPanel = document.getElementById('results-panel');

let selectedWord = "";

// --- SECTION 2: THE EVENT LISTENER ---
editorBox.addEventListener('dblclick', function() {
    const rawText = window.getSelection().toString();
    const cleanedText = rawText.trim();

    if (cleanedText.length > 0) {
        selectedWord = cleanedText;
        displayTitle.innerText = "Target: " + selectedWord;
        sidebarMenu.style.display = "block";
        outputPanel.innerHTML = "Select an action...";
    }
});

// --- SECTION 3: THE EDITOR TYPEWRITER ENGINE (0.85s DROP) ---
/**
 * GOAL: Re-write the editor content word-by-word with forced spacing.
 * SPEED: 850ms (0.85 seconds).
 */
function dropToEditor(wordArray) {
    // 1. Clear the editor completely
    editorBox.textContent = ""; 
    
    let i = 0;

    // 2. The Heartbeat (850ms)
    const editorTimer = setInterval(() => {
        if (i < wordArray.length) {
            
            // THE FORCE-SPACE FIX: 
            // Using backticks `` ensures the space after the word is respected.
            editorBox.textContent += `${wordArray[i]} `;
            
            i++;
            
            // Keep the view at the bottom
            editorBox.scrollTop = editorBox.scrollHeight;
        } else {
            // 3. STOP: When finished
            clearInterval(editorTimer);
        }
    }, 850); 
}


// --- SECTION 4: THE API CALLS (INSTANT) ---

async function getDefinition() {
    outputPanel.innerHTML = "<em>Searching...</em>";
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`);
        const data = await response.json();
        const meaning = data[0].meanings[0].definitions[0].definition;
        outputPanel.innerHTML = `<strong>Definition:</strong><br> ${meaning}`;
    } catch (error) {
        outputPanel.innerHTML = "Not found.";
    }
}

async function getEtymology() {
    outputPanel.innerHTML = "<em>Looking up...</em>";
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`);
        const data = await response.json();
        const origin = data[0].origin || "History unknown.";
        outputPanel.innerHTML = `<strong>Origin:</strong> <p>${origin}</p>`;
    } catch (error) {
        outputPanel.innerHTML = "Error.";
    }
}

// --- SECTION 5: SMART SWAP ---

function smartSwap(synonym) {
    if (!synonym) return;

    // 1. Prepare the List
    let wordList = editorBox.textContent.split(/\s+/); // Splitting by any whitespace
    let haveFoundFirstOne = false;

    for (let i = 0; i < wordList.length; i++) {
        let currentWord = wordList[i].replace(/[.,!]/g, "");

        if (currentWord.toLowerCase() === selectedWord.toLowerCase()) {
            if (haveFoundFirstOne === false) {
                wordList[i] = `${wordList[i]}(${synonym})`;
                haveFoundFirstOne = true;
            } else {
                wordList[i] = synonym;
            }
        }
    }

    // 2. Sidebar Updates Instantly
    outputPanel.innerHTML = "Re-writing editor...";

    // 3. Editor Updates with 0.85s Spaced Typewriter
    dropToEditor(wordList); 
}


// This function talks to the MyMemory API and swaps text in the editor
async function translateAndSwap() {
    const selection = window.getSelection();
    const textToTranslate = selection.toString();
    const targetLang = document.getElementById('language-select').value;

    // 1. Validation: Make sure the user actually highlighted something
    if (!textToTranslate || textToTranslate.trim() === "") {
        document.getElementById('results-panel').innerText = "Highlight text to translate!";
        return;
    }

    document.getElementById('results-panel').innerText = "Translating...";

    try {
        // 2. The API Call: Sending text to the 'MyMemory' server
        // 'langpair=auto|en' detects the source language automatically

        // This tells the API: "Figure out what language I highlighted, and change it to the target"
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=autodetect|${targetLang}`;


        const response = await fetch(url);
        const data = await response.json();
        const translatedText = data.responseData.translatedText;

        // 3. The Instant Swap:
        // We get the 'range' (the exact location of the highlight)
        const range = selection.getRangeAt(0);
        range.deleteContents(); // Delete the old text (e.g., Afrikaans)
        range.insertNode(document.createTextNode(translatedText)); // Insert the new text (e.g., English)

        document.getElementById('results-panel').innerText = "Translation Complete!";
    } catch (error) {
        document.getElementById('results-panel').innerText = "Error: Connection failed.";
    }
}
    
