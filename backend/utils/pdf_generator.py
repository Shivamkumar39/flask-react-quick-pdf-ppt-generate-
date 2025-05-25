from flask import Flask, request, send_file
from fpdf import FPDF
import io
import re
import os
from datetime import datetime

app = Flask(__name__)

# Path to the DejaVuSans.ttf font (ensure this file exists)
FONT_PATH = "fonts/DejaVuSans.ttf"

def safe_filename(name: str) -> str:
    return re.sub(r'[^a-zA-Z0-9_\-]', '_', name)

def create_pdf_bytes(name, topic, description, slide_count):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Add Unicode font (required for special characters)
    pdf.add_font("DejaVu", "", FONT_PATH, uni=True)
    pdf.set_font("DejaVu", 'B', 20)

    # Title page
    pdf.add_page()
    pdf.cell(0, 20, topic or "Presentation", ln=True, align='C')
    pdf.set_font("DejaVu", size=14)
    if name:
        pdf.cell(0, 10, f"Presented by: {name}", ln=True, align='C')
    pdf.ln(10)

    # Split description into bullet points
    points = []
    if description:
        if '.' in description:
            points = [p.strip() for p in description.split('.') if p.strip()]
        elif ',' in description:
            points = [p.strip() for p in description.split(',') if p.strip()]
        else:
            points = [description.strip()]

    points_per_slide = 5
    total_slides = max(slide_count, 1)

    for i in range(total_slides):
        pdf.add_page()
        pdf.set_font("DejaVu", 'B', 16)
        pdf.cell(0, 10, f"Slide {i+1}", ln=True)
        pdf.ln(5)
        pdf.set_font("DejaVu", size=12)

        start_idx = i * points_per_slide
        end_idx = start_idx + points_per_slide
        slide_points = points[start_idx:end_idx] or [f"(No content for slide {i+1})"]

        for point in slide_points:
            pdf.multi_cell(0, 8, f"• {point}")
            pdf.ln(1)

    pdf_output = pdf.output(dest='S').encode('latin1')
    pdf_io = io.BytesIO(pdf_output)
    pdf_io.seek(0)
    return pdf_io

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    data = request.json
    name = data.get('name', 'Anonymous')
    topic = data.get('topic', 'Untitled Topic')
    description = data.get('description', 'No description provided.')
    slide_count = int(data.get('slide_count', 1))

    try:
        pdf_io = create_pdf_bytes(name, topic, description, slide_count)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_topic = safe_filename(topic) or "presentation"
        filename = f"{safe_topic}_{timestamp}.pdf"

        return send_file(
            pdf_io,
            download_name=filename,
            as_attachment=True,
            mimetype="application/pdf"
        )
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
