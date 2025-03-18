document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("textForm").addEventListener("submit", function (event) {
        event.preventDefault();
        uploadFile("/extract_text", "textForm", "textResult");
    });

    document.getElementById("tableForm").addEventListener("submit", function (event) {
        event.preventDefault();
        uploadFile("/extract_table", "tableForm", "tableResult");
    });
});

function uploadFile(endpoint, formId, resultId) {
    let formData = new FormData(document.getElementById(formId));

    fetch(endpoint, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById(resultId).innerText = data.text || data.message || "Error!";
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById(resultId).innerText = "Something went wrong!";
    });
}
