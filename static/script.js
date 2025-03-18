document.addEventListener("DOMContentLoaded", function () {
    // Theme toggling
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "light") {
        document.body.classList.remove("dark-mode");
    }
    
    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("theme", currentTheme);
    });
    
    // Tab switching
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab");
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));
            
            // Add active class to clicked button and corresponding content
            button.classList.add("active");
            document.getElementById(tabId).classList.add("active");
        });
    });
    
    // File input handling
    const textFileInput = document.getElementById("textFile");
    const tableFileInput = document.getElementById("tableFile");
    const textFileName = document.getElementById("textFileName");
    const tableFileName = document.getElementById("tableFileName");
    
    textFileInput.addEventListener("change", function() {
        if (this.files.length > 0) {
            textFileName.textContent = this.files[0].name;
        } else {
            textFileName.textContent = "No file chosen";
        }
    });
    
    tableFileInput.addEventListener("change", function() {
        if (this.files.length > 0) {
            tableFileName.textContent = this.files[0].name;
        } else {
            tableFileName.textContent = "No file chosen";
        }
    });
    
    // Copy buttons
    const copyTextBtn = document.getElementById("copyTextBtn");
    const copyTableBtn = document.getElementById("copyTableBtn");
    const textResult = document.getElementById("textResult");
    const tableResult = document.getElementById("tableResult");
    
    copyTextBtn.addEventListener("click", function() {
        copyToClipboard(textResult);
        showCopyFeedback(this);
    });
    
    copyTableBtn.addEventListener("click", function() {
        copyToClipboard(tableResult);
        showCopyFeedback(this);
    });
    
    // Enable/disable copy buttons based on content
    const enableCopyButtonIfContent = (resultElement, buttonElement) => {
        buttonElement.disabled = !resultElement.value.trim();
    };
    
    // Set up observers for result fields
    const textResultObserver = new MutationObserver(() => {
        enableCopyButtonIfContent(textResult, copyTextBtn);
    });
    
    const tableResultObserver = new MutationObserver(() => {
        enableCopyButtonIfContent(tableResult, copyTableBtn);
    });
    
    textResultObserver.observe(textResult, { childList: true, subtree: true, characterData: true });
    tableResultObserver.observe(tableResult, { childList: true, subtree: true, characterData: true });
    
    // Form submission events
    document.getElementById("textForm").addEventListener("submit", function (event) {
        event.preventDefault();
        uploadFile("/extract_text", "textForm", "textResult");
    });
    
    document.getElementById("tableForm").addEventListener("submit", function (event) {
        event.preventDefault();
        uploadFile("/extract_table", "tableForm", "tableResult");
    });
});

// Function to copy text to clipboard
function copyToClipboard(element) {
    element.select();
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
}

// Show feedback when copying
function showCopyFeedback(button) {
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    
    setTimeout(() => {
        button.innerHTML = originalIcon;
    }, 2000);
}

// File upload function
function uploadFile(endpoint, formId, resultId) {
    const form = document.getElementById(formId);
    const resultArea = document.getElementById(resultId);
    const loaderId = `${resultId}Loader`;
    const loader = document.getElementById(loaderId);
    const copyBtn = document.getElementById(`copy${formId === "textForm" ? "Text" : "Table"}Btn`);
    
    // Validate file selection
    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput?.files.length) {
        resultArea.value = "Please select a file first.";
        return;
    }
    
    // Show loader
    loader.classList.remove("hidden");
    resultArea.classList.add("hidden");
    
    // Prepare form data
    let formData = new FormData(form);
    
    // Send request
    fetch(endpoint, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide loader
        loader.classList.add("hidden");
        resultArea.classList.remove("hidden");
        
        // Set result text
        resultArea.value = data.text || data.message || "";
        
        // Enable/disable copy button
        copyBtn.disabled = !resultArea.value.trim();
    })
    .catch(error => {
        console.error("Error:", error);
        
        // Hide loader
        loader.classList.add("hidden");
        resultArea.classList.remove("hidden");
        
        // Show error message
        resultArea.value = "An error occurred while processing your request. Please try again.";
        
        // Enable copy button for error message
        copyBtn.disabled = false;
    });
}