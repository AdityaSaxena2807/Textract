import pytesseract
from PIL import Image
import pyautogui
import camelot
import pyperclip  # Import pyperclip for clipboard functionality

# Path to Tesseract OCR executable (update this based on your system)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


# --- Case 1: Extract Text from Image ---
def extract_text_from_image(image_path=None, region=None):
    """
    Extract text from an image file or a selected region on the screen.
    :param image_path: Path to the image file (optional).
    :param region: Tuple (x, y, width, height) for a screen region (optional).
    :return: Extracted text as a string.
    """
    if image_path:
        # Load image from file
        img = Image.open(image_path)
    elif region:
        # Capture specific region on the screen
        screenshot = pyautogui.screenshot(region=region)
        screenshot.save("selected_region.png")
        img = Image.open("selected_region.png")
    else:
        raise ValueError("Either image_path or region must be provided.")

    # Extract text using Tesseract
    extracted_text = pytesseract.image_to_string(img)
    return extracted_text


# --- Case 2: Extract Tables from PDF ---
def extract_tables_from_pdf(pdf_path, page_number=None):
    """
    Extract tables from a PDF file and save them to CSV.
    :param pdf_path: Path to the PDF file.
    :param page_number: Specific page number to extract tables from (optional).
    :return: List of table data (or CSV files saved).
    """
    if page_number:
        tables = camelot.read_pdf(pdf_path, pages=str(page_number))
    else:
        tables = camelot.read_pdf(pdf_path, pages='all')

    if not tables:
        return "No tables found in the specified PDF."

    # Save each table to a CSV file
    for i, table in enumerate(tables):
        table.to_csv(f"table_{i + 1}.csv")

    return f"Extracted {len(tables)} table(s) and saved to CSV."


# --- Case 3: Copy Text to Clipboard ---
def copy_text_to_clipboard(text):
    """
    Copy the extracted text to the clipboard.
    :param text: Text to be copied to the clipboard.
    """
    pyperclip.copy(text)
    print("\nText has been copied to the clipboard.")


# --- Main Program ---
if __name__ == "__main__":
    print("Choose an option:")
    print("1. Extract Text from Image")
    print("2. Extract Tabular Data")

    choice = input("Enter your choice (1 or 2): ")

    if choice == "1":
        # Case 1: Extract Text from Image
        image_path = input("Upload an image file (enter the file path): ")
        print("\nChoose an option:")
        print("1. Extract text from the entire image")
        print("2. Select a specific region")

        sub_choice = input("Enter your choice (1 or 2): ")

        if sub_choice == "1":
            # Extract text from the entire image
            text = extract_text_from_image(image_path=image_path)
            print("\nExtracted Text:\n", text)
            copy_option = input("\nDo you want to copy this text to the clipboard? (yes/no): ")
            if copy_option.lower() == "yes":
                copy_text_to_clipboard(text)
        elif sub_choice == "2":
            # Select a specific region
            print("Drag and select an area on the screen (example region: x=100, y=100, width=500, height=300).")
            x, y, width, height = map(int, input("Enter x, y, width, height: ").split())
            text = extract_text_from_image(region=(x, y, width, height))
            print("\nExtracted Text from Selected Region:\n", text)
            copy_option = input("\nDo you want to copy this text to the clipboard? (yes/no): ")
            if copy_option.lower() == "yes":
                copy_text_to_clipboard(text)
        else:
            print("Invalid choice.")

    elif choice == "2":
        # Case 2: Extract Tabular Data
        pdf_path = input("Upload a PDF file (enter the file path): ")
        print("\nChoose an option:")
        print("1. Extract all tables")
        print("2. Extract tables from a specific page")

        sub_choice = input("Enter your choice (1 or 2): ")

        if sub_choice == "1":
            # Extract all tables
            result = extract_tables_from_pdf(pdf_path)
            print(result)
        elif sub_choice == "2":
            # Extract tables from a specific page
            page_number = int(input("Enter the page number: "))
            result = extract_tables_from_pdf(pdf_path, page_number=page_number)
            print(result)
        else:
            print("Invalid choice.")
    else:
        print("Invalid choice. Please restart the program.")
