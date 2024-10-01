let whiteboard = document.getElementById("whiteboard");
let addTextButton = document.getElementById("addText");
let fontFamilySelect = document.getElementById("fontFamily");
let fontSizeInput = document.getElementById("fontSize");
let boldButton = document.getElementById("bold");
let italicButton = document.getElementById("italic");
let underlineButton = document.getElementById("underline");
let undoButton = document.getElementById("undo");
let redoButton = document.getElementById("redo");

let selectedElement = null;
let history = [];
let redoStack = [];

// Add the current state to the history stack
function saveState() {
    if (selectedElement) {
        const currentState = {
            content: selectedElement.innerText,
            style: selectedElement.style.cssText,
        };
        history.push(currentState);
        if (history.length > 100) history.shift(); // Limit history size for performance
        redoStack = [];
    }
}

// Add text box to the whiteboard
addTextButton.addEventListener("click", () => {
    let textBox = document.createElement("div");
    textBox.contentEditable = true;
    textBox.className = "text-box";
    textBox.innerText = "New Text";
    textBox.style.fontFamily = fontFamilySelect.value;
    textBox.style.fontSize = fontSizeInput.value + "px";
    textBox.style.position = "absolute";
    whiteboard.appendChild(textBox);

    // Select the new text box
    selectElement(textBox);

    // Make it draggable
    makeElementDraggable(textBox);

    // Add click event to select the element
    textBox.addEventListener("click", (e) => {
        e.stopPropagation();
        selectElement(textBox);
    });

    // Listen for input events to save state
    textBox.addEventListener("input", () => {
        saveState();
    });

    saveState();
});

// Update whiteboard click event to deselect elements
whiteboard.addEventListener("click", (e) => {
    if (e.target === whiteboard) {
        if (selectedElement) {
            selectedElement.classList.remove("selected");
            selectedElement = null;
            updateControls();
        }
    }
});

// Make text boxes draggable with boundary checks


// Select an element and apply styles accordingly
function selectElement(element) {
    if (selectedElement) {
        selectedElement.classList.remove("selected");
    }
    selectedElement = element;
    selectedElement.classList.add("selected");
    updateControls();
}

function makeElementDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    element.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
        if (e.target === element) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            const whiteboardRect = whiteboard.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Boundary checks
            if (currentX < 0) currentX = 0;
            if (currentY < 0) currentY = 0;
            if (currentX + elementRect.width > whiteboardRect.width) {
                currentX = whiteboardRect.width - elementRect.width;
            }
            if (currentY + elementRect.height > whiteboardRect.height) {
                currentY = whiteboardRect.height - elementRect.height;
            }

            setTranslate(currentX, currentY, element);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function dragEnd(e) {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            saveState();
        }
    }
}

// Update control values to reflect the selected element's styles
function updateControls() {
    if (selectedElement) {
        fontFamilySelect.value = selectedElement.style.fontFamily || "Arial";
        fontSizeInput.value = parseInt(selectedElement.style.fontSize) || 16;
        boldButton.classList.toggle("active", selectedElement.style.fontWeight === "bold");
        italicButton.classList.toggle("active", selectedElement.style.fontStyle === "italic");
        underlineButton.classList.toggle("active", selectedElement.style.textDecoration === "underline");
    }
}

// Change font family
fontFamilySelect.addEventListener("change", () => {
    if (selectedElement) {
        selectedElement.style.fontFamily = fontFamilySelect.value;
        saveState();
    }
});

// Change font size
fontSizeInput.addEventListener("input", () => {
    if (selectedElement) {
        selectedElement.style.fontSize = fontSizeInput.value + "px";
        saveState();
    }
});

// Toggle bold
boldButton.addEventListener("click", () => {
    if (selectedElement) {
        selectedElement.style.fontWeight = selectedElement.style.fontWeight === "bold" ? "normal" : "bold";
        boldButton.classList.toggle("active");
        saveState();
    }
});

// Toggle italic
italicButton.addEventListener("click", () => {
    if (selectedElement) {
        selectedElement.style.fontStyle = selectedElement.style.fontStyle === "italic" ? "normal" : "italic";
        italicButton.classList.toggle("active");
        saveState();
    }
});

// Toggle underline
underlineButton.addEventListener("click", () => {
    if (selectedElement) {
        selectedElement.style.textDecoration = selectedElement.style.textDecoration === "underline" ? "none" : "underline";
        underlineButton.classList.toggle("active");
        saveState();
    }
});

// Undo and Redo functionality
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);

function undo() {
    if (history.length > 1) {
        redoStack.push(history.pop());
        const lastState = history[history.length - 1];
        restoreState(lastState);
    }
}

function redo() {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        history.push(redoState);
        restoreState(redoState);
    }
}

// Restore the state of the selected element
function restoreState(state) {
    if (selectedElement) {
        selectedElement.innerText = state.content;
        selectedElement.style.cssText = state.style;
    }
}

// Keyboard shortcuts for undo and redo
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
    } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
    }
});
