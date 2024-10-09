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

let selectedElement = null;
let history = [];
let redoStack = [];

let slides = [
    {
        src: "uploads/Image2.jpeg",
        text: "Hello World",
        left: "10px",
        top: "10px",
        textBoxes: []
    },
    {
        src: "uploads/Image3.jpeg",
        text: "Celebrare",
        left: "10px",
        top: "10px",
        textBoxes: []
    },
    {
        src: "uploads/Image1.jpg",
        text: "Internship",
        left: "10px",
        top: "10px",
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
    predefinedTextDiv.innerText = slides[currentImageIndex].text;
    predefinedTextDiv.style.position = "absolute";
    predefinedTextDiv.style.left = slides[currentImageIndex].left;
    predefinedTextDiv.style.top = slides[currentImageIndex].top;
    imageContainer.appendChild(predefinedTextDiv);

    makeElementDraggable(predefinedTextDiv, true);

    predefinedTextDiv.addEventListener("input", () => {
        slides[currentImageIndex].text = predefinedTextDiv.innerText;
        saveState();
    });

    slides[currentImageIndex].textBoxes.forEach(textBox => {
        let newTextBox = document.createElement("div");
        newTextBox.contentEditable = true;
        newTextBox.className = "text-box";
        newTextBox.innerText = textBox.innerText;
        newTextBox.style.fontFamily = textBox.fontFamily;
        newTextBox.style.fontSize = textBox.fontSize;
        newTextBox.style.position = "absolute";
        newTextBox.style.left = textBox.left; 
        newTextBox.style.top = textBox.top; 
        imageContainer.appendChild(newTextBox);
        makeElementDraggable(newTextBox);

        newTextBox.addEventListener("input", () => {
            saveState();
            textBox.innerText = newTextBox.innerText;
            textBox.left = newTextBox.style.left;
            textBox.top = newTextBox.style.top;
        });
    });

    predefinedTextDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        selectElement(predefinedTextDiv);
    });
}

function saveCurrentTextBoxes() {
    const textBoxes = document.querySelectorAll('.text-box');
    textBoxes.forEach(tb => {
        const index = slides[currentImageIndex].textBoxes.findIndex(textBox => textBox.innerText === tb.innerText);
        if (index !== -1) {
            slides[currentImageIndex].textBoxes[index].innerText = tb.innerText;
            slides[currentImageIndex].textBoxes[index].left = tb.style.left;
            slides[currentImageIndex].textBoxes[index].top = tb.style.top;
            slides[currentImageIndex].textBoxes[index].fontFamily = tb.style.fontFamily;
            slides[currentImageIndex].textBoxes[index].fontSize = tb.style.fontSize;
        }
    });

    const predefinedTextBox = document.querySelector('.text-box.predefined');
    if (predefinedTextBox) {
        slides[currentImageIndex].left = predefinedTextBox.style.left;
        slides[currentImageIndex].top = predefinedTextBox.style.top;
    }
}

document.getElementById("nextSlide").addEventListener("click", () => {
    saveCurrentTextBoxes();
    currentImageIndex = (currentImageIndex + 1) % slides.length;
    updateSlide();
});

document.getElementById("prevSlide").addEventListener("click", () => {
    saveCurrentTextBoxes();
    currentImageIndex = (currentImageIndex - 1 + slides.length) % slides.length;
    updateSlide();
});

updateSlide();

function saveState() {
    const currentState = {
        slideIndex: currentImageIndex,
        textBoxes: slides[currentImageIndex].textBoxes.map(textBox => ({
            innerText: textBox.innerText,
            left: textBox.left,
            top: textBox.top,
            fontFamily: textBox.fontFamily,
            fontSize: textBox.fontSize
        })),
        predefinedText: slides[currentImageIndex].text
    };
    history.push(currentState);
    if (history.length > 100) history.shift();
    redoStack = [];
}

addTextButton.addEventListener("click", () => {
    let textBox = {
        innerText: "New Text",
        fontFamily: fontFamilySelect.value,
        fontSize: fontSizeInput.value + "px",
        left: "10px",
        top: "10px"
    };
    
    let newTextBoxElement = document.createElement("div");
    newTextBoxElement.contentEditable = true;
    newTextBoxElement.className = "text-box";
    newTextBoxElement.innerText = textBox.innerText;
    newTextBoxElement.style.fontFamily = textBox.fontFamily;
    newTextBoxElement.style.fontSize = textBox.fontSize;
    newTextBoxElement.style.position = "absolute";
    newTextBoxElement.style.left = textBox.left; 
    newTextBoxElement.style.top = textBox.top; 
    imageContainer.appendChild(newTextBoxElement);
    
    slides[currentImageIndex].textBoxes.push({
        innerText: textBox.innerText,
        fontFamily: textBox.fontFamily,
        fontSize: textBox.fontSize,
        left: textBox.left,
        top: textBox.top
    });
    
    makeElementDraggable(newTextBoxElement);

    newTextBoxElement.addEventListener("click", (e) => {
        e.stopPropagation();
        selectElement(newTextBoxElement);
    });

    newTextBoxElement.addEventListener("input", () => {
        saveState();
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

        if (!isPredefined) {
            saveState();
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
    } else {
        fontFamilySelect.value = "Arial";
        fontSizeInput.value = 16;
        boldButton.classList.remove("active");
        italicButton.classList.remove("active");
        underlineButton.classList.remove("active");
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

undoButton.addEventListener("click", () => {
    if (history.length > 0) {
        redoStack.push(history.pop());
        const lastState = history[history.length - 1];
        if (lastState) {
            currentImageIndex = lastState.slideIndex;
            slides[currentImageIndex].textBoxes = lastState.textBoxes.map(textBox => ({
                innerText: textBox.innerText,
                left: textBox.left,
                top: textBox.top,
                fontFamily: textBox.fontFamily,
                fontSize: textBox.fontSize
            }));
            updateSlide();
        }
    }
});

redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        history.push(redoState);
        currentImageIndex = redoState.slideIndex;
        slides[currentImageIndex].textBoxes = redoState.textBoxes.map(textBox => ({
            innerText: textBox.innerText,
            left: textBox.left,
            top: textBox.top,
            fontFamily: textBox.fontFamily,
            fontSize: textBox.fontSize
        }));
        updateSlide();
    }
});
