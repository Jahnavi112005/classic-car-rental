from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from pathlib import Path

p = Path('uploads/test-aadhaar.pdf')
p.parent.mkdir(exist_ok=True)

c = canvas.Canvas(str(p), pagesize=letter)
c.setFont('Helvetica-Bold', 16)
c.drawString(80, 760, 'AADHAAR CARD')
c.setFont('Helvetica', 12)
c.drawString(80, 730, 'Name: K S Jahnavi')
c.drawString(80, 710, 'Aadhaar No: 2419 8335 6143')
c.drawString(80, 690, 'DOB: 01/01/1990')
c.save()
print(p)
