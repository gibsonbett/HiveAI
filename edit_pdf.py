import fitz  # PyMuPDF

INPUT = "NFC 00235 - INTER AGRO LTD-1.pdf"
OUTPUT = "NFC 00330 - INTER AGRO LTD.pdf"

doc = fitz.open(INPUT)
page = doc[0]

# Define replacements: (search_text, bbox, new_text, font_size, font_name, align)
# We'll redact each area and re-insert text

def redact_and_replace(page, rect, new_text, fontsize, fontname="helv", align=fitz.TEXT_ALIGN_LEFT, color=(0, 0, 0)):
    """Redact a rectangle area and insert new text."""
    page.add_redact_annot(rect, fill=(1, 1, 1))  # white fill
    page.apply_redactions()
    # Insert text at position
    # Use the baseline y from the rect
    x = rect.x0
    y = rect.y1 - 2  # approximate baseline
    page.insert_text(
        (x, y),
        new_text,
        fontsize=fontsize,
        fontname=fontname,
        color=color,
    )

# Collect all text spans for reference
blocks = page.get_text("dict")["blocks"]
spans_list = []
for b in blocks:
    if "lines" in b:
        for line in b["lines"]:
            for span in line["spans"]:
                spans_list.append(span)

# --- Build all redaction annotations first, then apply once ---
replacements = []

def find_span(text_match, y_approx=None, x_approx=None):
    """Find a span matching the text."""
    for s in spans_list:
        if s["text"].strip() == text_match:
            if y_approx and abs(s["bbox"][1] - y_approx) > 5:
                continue
            if x_approx and abs(s["bbox"][0] - x_approx) > 5:
                continue
            return s
    return None

# 1. PUR-ORD number: PUR-ORD-2026-00235 → PUR-ORD-2026-00330
span = find_span("PUR-ORD-2026-00235")
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "PUR-ORD-2026-00330", 11.5, "helv", fitz.TEXT_ALIGN_LEFT))

# 2. Date: 2026-03-11 → 2026-05-07
span = find_span("2026-03-11")
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "2026-05-07", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# 3. Quantity: 260.0 → 180.0
span = find_span("260.0", y_approx=322.9)
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "180.0", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# 4. Unit: Nos → Bags
span = find_span("Nos", y_approx=322.9)
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "Bags", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# 5. Rate: 5,800.00 → 6,100.00
span = find_span("5,800.00")
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "6,100.00", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# 6. Line amount: 1,508,000.00 → 1,098,000.00
span = find_span("1,508,000.00")
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "1,098,000.00", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# 7. Total: 1508000.0 → 1098000.0 (first occurrence ~355)
span = find_span("1508000.0", y_approx=355.2)
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "1098000.0", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# 8. Grand Total: 1508000.0 → 1098000.0 (second occurrence ~371)
span = find_span("1508000.0", y_approx=371.4)
if span:
    rect = fitz.Rect(span["bbox"])
    replacements.append((rect, "1098000.0", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# 9. Amount in words - need to redact the entire words area
# Original spans: "KES One Million, Five Hundred And" on line 1
#                 "Eight Thousand only." on line 2
# New: "KES One Million, Ninety Eight Thousand only."
# We need to redact both lines of the "In Words" value area

# Find all the word spans for the amount in words
words_line1_texts = ["KES", "One", "Million,", "Five", "Hundred", "And"]
words_line2_texts = ["Eight", "Thousand", "only."]

# Get bounding box for line 1 of words (y ~ 387.5)
words_line1_spans = []
for t in words_line1_texts:
    s = find_span(t, y_approx=387.5)
    if s:
        words_line1_spans.append(s)

# Get bounding box for line 2 of words (y ~ 400.0)
words_line2_spans = []
for t in words_line2_texts:
    s = find_span(t, y_approx=400.0)
    if s:
        words_line2_spans.append(s)

if words_line1_spans:
    x0 = min(s["bbox"][0] for s in words_line1_spans)
    y0 = min(s["bbox"][1] for s in words_line1_spans)
    x1 = max(s["bbox"][2] for s in words_line1_spans)
    y1 = max(s["bbox"][3] for s in words_line1_spans)
    rect = fitz.Rect(x0, y0, x1, y1)
    replacements.append((rect, "KES One Million, Ninety Eight", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

if words_line2_spans:
    x0 = min(s["bbox"][0] for s in words_line2_spans)
    y0 = min(s["bbox"][1] for s in words_line2_spans)
    x1 = max(s["bbox"][2] for s in words_line2_spans)
    y1 = max(s["bbox"][3] for s in words_line2_spans)
    rect = fitz.Rect(x0, y0, x1, y1)
    replacements.append((rect, "Thousand only.", 8.8, "helv", fitz.TEXT_ALIGN_LEFT))

# Apply all redactions first
for rect, new_text, fontsize, fontname, align in replacements:
    # Add extra margin to ensure full coverage
    expanded = fitz.Rect(rect.x0 - 1, rect.y0 - 1, rect.x1 + 1, rect.y1 + 1)
    page.add_redact_annot(expanded, fill=(1, 1, 1))

page.apply_redactions()

# Now insert all new text
for rect, new_text, fontsize, fontname, align in replacements:
    # baseline ~ bottom of rect minus descent
    x = rect.x0
    y = rect.y1 - 2.0  # approximate baseline offset
    page.insert_text(
        (x, y),
        new_text,
        fontsize=fontsize,
        fontname=fontname,
        color=(0, 0, 0),
    )

doc.save(OUTPUT)
doc.close()
print(f"Saved edited PDF to: {OUTPUT}")
