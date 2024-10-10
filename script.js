let imageContainer = document.querySelector(".image-container");
let backgroundImage = document.getElementById("backgroundImage");
let addTextButton = document.getElementById("addText");
let fontFamilySelect = document.getElementById("fontFamily");
let fontSizeInput = document.getElementById("fontSize");
let boldButton = document.getElementById("bold");
let italicButton = document.getElementById("italic");
let underlineButton = document.getElementById("underline");
let undoButton = document.getElementById("undo");
let redoButton = document.getElementById("redo");
let textColorInput = document.getElementById("textColor");
let shuffleButton = document.getElementById("shuffleButton");

let selectedElement = null;
let history = [];
let redoStack = [];

let slides = [
    {
        src: "uploads/Image2.jpeg",
        predefinedText: {
            text: "Hello World",
            left: "10px",
            top: "10px",
            color: "#000000",
            fontFamily: "Arial",
            fontSize: "16px",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none"
        },
        textBoxes: []
    },
    {
        src: "uploads/Image3.jpeg",
        predefinedText: {
            text: "Celebrare",
            left: "10px",
            top: "10px",
            color: "#000000",
            fontFamily: "Arial",
            fontSize: "16px",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none"
        },
        textBoxes: []
    },
    {
        src: "uploads/Image1.jpg",
        predefinedText: {
            text: "Internship",
            left: "10px",
            top: "10px",
            color: "#000000",
            fontFamily: "Arial",
            fontSize: "16px",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none"
        },
        textBoxes: []
    }
];

let currentImageIndex = 0;

function updateSlide() {
    backgroundImage.src = slides[currentImageIndex].src;

    imageContainer.innerHTML = '';
    imageContainer.appendChild(backgroundImage);

    let predefinedTextDiv = document.createElement("div");
    predefinedTextDiv.className = "text-box predefined";
    predefinedTextDiv.contentEditable = true;
    Object.assign(predefinedTextDiv.style, slides[currentImageIndex].predefinedText);
    predefinedTextDiv.innerText = slides[currentImageIndex].predefinedText.text;
    predefinedTextDiv.style.position = "absolute";
    imageContainer.appendChild(predefinedTextDiv);

    makeElementDraggable(predefinedTextDiv, true);

    predefinedTextDiv.addEventListener("input", () => {
        slides[currentImageIndex].predefinedText.text = predefinedTextDiv.innerText;
        saveState();
    });

    slides[currentImageIndex].textBoxes.forEach(textBox => {
        let newTextBox = document.createElement("div");
        newTextBox.contentEditable = true;
        newTextBox.className = "text-box";
        Object.assign(newTextBox.style, textBox);
        newTextBox.innerText = textBox.text;
        newTextBox.style.position = "absolute";
        imageContainer.appendChild(newTextBox);
        makeElementDraggable(newTextBox);

        newTextBox.addEventListener("input", () => {
            saveState();
            updateTextBoxData(newTextBox, textBox);
        });

        newTextBox.addEventListener("click", (e) => {
            e.stopPropagation();
            selectElement(newTextBox);
        });
    });

    predefinedTextDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        selectElement(predefinedTextDiv);
    });

    updateControls();
}

function updateTextBoxData(element, data) {
    data.text = element.innerText;
    data.left = element.style.left;
    data.top = element.style.top;
    data.fontFamily = element.style.fontFamily;
    data.fontSize = element.style.fontSize;
    data.color = element.style.color;
    data.fontWeight = element.style.fontWeight;
    data.fontStyle = element.style.fontStyle;
    data.textDecoration = element.style.textDecoration;
}

function saveCurrentTextBoxes() {
    const textBoxes = document.querySelectorAll('.text-box:not(.predefined)');
    slides[currentImageIndex].textBoxes = Array.from(textBoxes).map(tb => ({
        text: tb.innerText,
        left: tb.style.left,
        top: tb.style.top,
        fontFamily: tb.style.fontFamily,
        fontSize: tb.style.fontSize,
        color: tb.style.color,
        fontWeight: tb.style.fontWeight,
        fontStyle: tb.style.fontStyle,
        textDecoration: tb.style.textDecoration
    }));

    const predefinedTextBox = document.querySelector('.text-box.predefined');
    if (predefinedTextBox) {
        updateTextBoxData(predefinedTextBox, slides[currentImageIndex].predefinedText);
    }
}

document.getElementById("nextSlide").addEventListener("click", () => {
    saveCurrentTextBoxes();
    currentImageIndex = (currentImageIndex + 1) % slides.length;
    updateSlide();
    saveState();
});

document.getElementById("prevSlide").addEventListener("click", () => {
    saveCurrentTextBoxes();
    currentImageIndex = (currentImageIndex - 1 + slides.length) % slides.length;
    updateSlide();
    saveState();
});

function saveState() {
    const currentState = JSON.parse(JSON.stringify({
        slideIndex: currentImageIndex,
        slides: slides
    }));
    history.push(currentState);
    if (history.length > 100) history.shift();
    redoStack = [];
    updateUndoRedoButtons();
}

function applyState(state) {
    currentImageIndex = state.slideIndex;
    slides = state.slides;
    updateSlide();
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    undoButton.disabled = history.length <= 1;
    redoButton.disabled = redoStack.length === 0;
}

addTextButton.addEventListener("click", () => {
    let textBox = {
        text: "New Text",
        fontFamily: fontFamilySelect.value,
        fontSize: fontSizeInput.value + "px",
        color: textColorInput.value,
        left: "10px",
        top: "10px",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none"
    };
    
    let newTextBoxElement = document.createElement("div");
    newTextBoxElement.contentEditable = true;
    newTextBoxElement.className = "text-box";
    Object.assign(newTextBoxElement.style, textBox);
    newTextBoxElement.innerText = textBox.text;
    newTextBoxElement.style.position = "absolute";
    imageContainer.appendChild(newTextBoxElement);
    
    slides[currentImageIndex].textBoxes.push(textBox);
    
    makeElementDraggable(newTextBoxElement);

    newTextBoxElement.addEventListener("click", (e) => {
        e.stopPropagation();
        selectElement(newTextBoxElement);
    });

    newTextBoxElement.addEventListener("input", () => {
        saveState();
        updateTextBoxData(newTextBoxElement, textBox);
    });

    saveState();
});

imageContainer.addEventListener("click", (e) => {
    if (e.target === imageContainer || e.target === backgroundImage) {
        if (selectedElement) {
            selectedElement.classList.remove("selected");
            selectedElement = null;
            updateControls();
        }
    }
});

function makeElementDraggable(element, isPredefined = false) {
    let isDragging = false;
    let startX, startY;

    element.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);

    function startDragging(e) {
        isDragging = true;
        startX = e.clientX - element.offsetLeft;
        startY = e.clientY - element.offsetTop;
        element.style.cursor = "grabbing";
    }

    function drag(e) {
        if (!isDragging) return;

        const containerRect = imageContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        let newX = e.clientX - startX;
        let newY = e.clientY - startY;

        newX = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));

        element.style.left = newX + "px";
        element.style.top = newY + "px";

        if (isPredefined) {
            slides[currentImageIndex].predefinedText.left = newX + "px";
            slides[currentImageIndex].predefinedText.top = newY + "px";
        }
    }

    function stopDragging() {
        isDragging = false;
        element.style.cursor = "grab";
        saveState();
    }
}

function selectElement(element) {
    if (selectedElement) {
        selectedElement.classList.remove("selected");
    }

    selectedElement = element;
    selectedElement.classList.add("selected");
    updateControls();
}

function updateControls() {
    if (selectedElement) {
        fontFamilySelect.value = selectedElement.style.fontFamily || "Arial";
        fontSizeInput.value = selectedElement.style.fontSize ? parseInt(selectedElement.style.fontSize) : 16;
        boldButton.classList.toggle("active", selectedElement.style.fontWeight === "bold");
        italicButton.classList.toggle("active", selectedElement.style.fontStyle === "italic");
        underlineButton.classList.toggle("active", selectedElement.style.textDecoration === "underline");
        textColorInput.value = selectedElement.style.color || "#000000";
    } else {
        fontFamilySelect.value = "Arial";
        fontSizeInput.value = 16;
        boldButton.classList.remove("active");
        italicButton.classList.remove("active");
        underlineButton.classList.remove("active");
        textColorInput.value = "#000000";
    }
}

fontFamilySelect.addEventListener("change", () => {
    if (selectedElement) {
        selectedElement.style.fontFamily = fontFamilySelect.value;
        saveState();
    }
});

fontSizeInput.addEventListener("input", () => {
    if (selectedElement) {
        selectedElement.style.fontSize = fontSizeInput.value + "px";
        saveState();
    }
});

boldButton.addEventListener("click", () => {
    if (selectedElement) {
        const isBold = selectedElement.style.fontWeight === "bold";
        selectedElement.style.fontWeight = isBold ? "normal" : "bold";
        boldButton.classList.toggle("active", !isBold);
        saveState();
    }
});

italicButton.addEventListener("click", () => {
    if (selectedElement) {
        const isItalic = selectedElement.style.fontStyle === "italic";
        selectedElement.style.fontStyle = isItalic ? "normal" : "italic";
        italicButton.classList.toggle("active", !isItalic);
        saveState();
    }
});

underlineButton.addEventListener("click", () => {
    if (selectedElement) {
        const isUnderlined = selectedElement.style.textDecoration === "underline";
        selectedElement.style.textDecoration = isUnderlined ? "none" : "underline";
        underlineButton.classList.toggle("active", !isUnderlined);
        saveState();
    }
});

textColorInput.addEventListener("input", () => {
    if (selectedElement) {
        selectedElement.style.color = textColorInput.value;
        saveState();
    }
});

undoButton.addEventListener("click", () => {
    if (history.length > 1) {
        redoStack.push(history.pop());
        const lastState = history[history.length - 1];
        applyState(lastState);
    }
});

redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        history.push(redoState);
        applyState(redoState);
    }
});

shuffleButton.addEventListener("click", () => {
    showReorderModal();
});

function showReorderModal() {
    const modal = document.createElement("div");
    modal.className = "reorder-modal";
    
    const modalContent = document.createElement("div");
    modalContent.className = "reorder-modal-content";
    
    const title = document.createElement("h2");
    title.textContent = "Reorder Images";
    modalContent.appendChild(title);
    
    const imageContainer = document.createElement("div");
    imageContainer.className = "reorder-image-container";
    
    slides.forEach((slide, index) => {
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "reorder-image-wrapper";
        
        const img = document.createElement("img");
        img.src = slide.src;
        img.alt = `Slide ${index + 1}`;
        
        const textOverlay = document.createElement("div");
        textOverlay.className = "reorder-text-overlay";
        textOverlay.textContent = slide.predefinedText.text;
        
        imageWrapper.appendChild(img);
        imageWrapper.appendChild(textOverlay);
        imageWrapper.draggable = true;
        
        imageWrapper.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", index);
        });
        
        imageWrapper.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
        
        imageWrapper.addEventListener("drop", (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
            const toIndex = index;
            if (fromIndex !== toIndex) {
                const [movedSlide] = slides.splice(fromIndex, 1);
                slides.splice(toIndex, 0, movedSlide);
                imageContainer.innerHTML = "";
                showReorderModal();
            }
        });
        
        imageContainer.appendChild(imageWrapper);
    });
    
    modalContent.appendChild(imageContainer);
    
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => {
        document.body.removeChild(modal);
        currentImageIndex = 0;
        saveState();
        updateSlide();
    });
    
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Initialize the first state
saveState();
updateSlide();
updateUndoRedoButtons();