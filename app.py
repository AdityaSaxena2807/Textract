from flask import Flask, render_template, request, jsonify
import os
from text_extracter import extract_text_from_image, extract_tables_from_pdf

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/extract_text", methods=["POST"])
def extract_text():
    file = request.files["file"]
    if file:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        extracted_text = extract_text_from_image(image_path=filepath)
        return jsonify({"text": extracted_text})
    return jsonify({"error": "No file uploaded"}), 400

@app.route("/extract_table", methods=["POST"])
def extract_table():
    file = request.files["file"]
    page_number = request.form.get("page", None)
    if file:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        result = extract_tables_from_pdf(filepath, page_number)
        return jsonify({"message": result})
    return jsonify({"error": "No file uploaded"}), 400

if __name__ == "__main__":
    app.run(debug=True)
