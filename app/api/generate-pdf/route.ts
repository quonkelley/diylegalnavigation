import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

interface FormData {
  county?: string;
  court?: string;
  caseNumber?: string;
  plaintiff?: string;
  defendant?: string;
  agreeToNotify?: boolean;
  mailingAddress?: string;
  phone?: string;
  email?: string;
}

function drawFormLayout(doc: InstanceType<typeof PDFDocument>) {
  const pageWidth = 612; // Letter size width in points
  const margin = 72;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = 72;
  
  // Header - Court Name Area
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('STATE OF INDIANA', margin, yPosition, { align: 'center' });
  yPosition += 20;
  
  doc.fontSize(12);
  doc.text('IN THE _________________ COURT OF _________________ COUNTY', margin, yPosition, { align: 'center' });
  yPosition += 40;
  
  // Case Caption Box
  doc.rect(margin, yPosition, contentWidth, 100).stroke();
  yPosition += 10;
  
  // Plaintiff line
  doc.fontSize(11).font('Helvetica');
  doc.text('____________________________________,', margin + 10, yPosition);
  yPosition += 20;
  doc.text('Plaintiff,', margin + 10, yPosition);
  yPosition += 30;
  
  doc.text('v.', margin + 10, yPosition);
  yPosition += 20;
  
  // Defendant line
  doc.text('____________________________________,', margin + 10, yPosition);
  yPosition += 20;
  doc.text('Defendant.', margin + 10, yPosition);
  
  // Case Number (right side of box)
  doc.text('Cause No. _______________', margin + contentWidth - 150, yPosition - 70);
  
  yPosition += 40;
  
  // Title
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('APPEARANCE', margin, yPosition, { align: 'center' });
  yPosition += 30;
  
  // Main content
  doc.fontSize(11).font('Helvetica');
  doc.text('I hereby enter my appearance in the above-entitled cause and acknowledge', margin, yPosition);
  yPosition += 15;
  doc.text('service of process. I agree to accept service of pleadings and other papers', margin, yPosition);
  yPosition += 15;
  doc.text('by delivery to me or by leaving them at my address shown below.', margin, yPosition);
  yPosition += 30;
  
  // Address section
  doc.text('Address: _______________________________________________________________', margin, yPosition);
  yPosition += 20;
  doc.text('_______________________________________________________________________', margin, yPosition);
  yPosition += 30;
  
  doc.text('Telephone: _____________________________________________________________', margin, yPosition);
  yPosition += 30;
  
  doc.text('Email: _________________________________________________________________', margin, yPosition);
  yPosition += 40;
  
  // Agreement checkbox section
  doc.rect(margin, yPosition, 10, 10).stroke();
  doc.text('I agree to notify the Court of any change in my address or', margin + 20, yPosition + 2);
  yPosition += 15;
  doc.text('telephone number.', margin + 20, yPosition);
  yPosition += 40;
  
  // Signature section
  doc.text('_________________________________________________', margin, yPosition);
  yPosition += 15;
  doc.text('Signature', margin, yPosition);
  
  // Date (right side)
  doc.text('Date: ________________', margin + contentWidth - 150, yPosition - 15);
  yPosition += 30;
  
  doc.text('_________________________________________________', margin, yPosition);
  yPosition += 15;
  doc.text('Print Name', margin, yPosition);
}

function fillUserData(doc: InstanceType<typeof PDFDocument>, formData: FormData) {
  const margin = 72;
  const pageWidth = 612;
  const contentWidth = pageWidth - (margin * 2);
  
  // Set font for form data
  doc.fontSize(11).font('Helvetica');
  
  // Fill in court information (header area)
  if (formData.court && formData.county) {
    // Replace the blanks in the court header
    doc.text(formData.court?.toUpperCase() || '', margin + 130, 112, { width: 100 });
    doc.text(formData.county?.toUpperCase() || '', margin + 320, 112, { width: 100 });
  }
  
  // Fill in case caption box (starting around y = 152)
  let yPosition = 162;
  
  // Plaintiff name
  if (formData.plaintiff) {
    doc.text(formData.plaintiff, margin + 10, yPosition, { width: 300 });
  }
  
  // Case number (right side of caption box)
  if (formData.caseNumber) {
    doc.text(formData.caseNumber, margin + contentWidth - 100, yPosition + 10, { width: 90 });
  }
  
  // Defendant name
  yPosition += 50;
  if (formData.defendant) {
    doc.text(formData.defendant, margin + 10, yPosition, { width: 300 });
  }
  
  // Address section (around y = 310)
  yPosition = 310;
  if (formData.mailingAddress) {
    // Split address into lines if it's long
    const addressLines = formData.mailingAddress.split('\n');
    if (addressLines.length === 1 && formData.mailingAddress.length > 60) {
      // Try to split at comma for long single-line addresses
      const parts = formData.mailingAddress.split(',');
      if (parts.length >= 2) {
        doc.text(parts[0].trim(), margin + 70, yPosition, { width: 400 });
        doc.text(parts.slice(1).join(',').trim(), margin, yPosition + 20, { width: 468 });
      } else {
        doc.text(formData.mailingAddress, margin + 70, yPosition, { width: 400 });
      }
    } else {
      // Use as-is for multi-line or short addresses
      doc.text(addressLines[0] || formData.mailingAddress, margin + 70, yPosition, { width: 400 });
      if (addressLines[1]) {
        doc.text(addressLines[1], margin, yPosition + 20, { width: 468 });
      }
    }
  }
  
  // Phone number (around y = 370)
  yPosition = 370;
  if (formData.phone) {
    doc.text(formData.phone, margin + 90, yPosition, { width: 300 });
  }
  
  // Email (around y = 400)
  yPosition = 400;
  if (formData.email) {
    doc.text(formData.email, margin + 55, yPosition, { width: 400 });
  }
  
  // Agreement checkbox (around y = 440)
  if (formData.agreeToNotify === true) {
    // Draw an X in the checkbox
    doc.fontSize(10).text('✓', margin + 2, 442);
  }
  
  // Defendant name in signature area (around y = 520)
  yPosition = 535;
  if (formData.defendant) {
    doc.text(formData.defendant, margin, yPosition, { width: 300 });
  }
  
  // Current date
  const currentDate = new Date().toLocaleDateString('en-US');
  doc.text(currentDate, margin + contentWidth - 100, yPosition - 15, { width: 90 });
}

export async function POST(request: NextRequest) {
  try {
    const { formData }: { formData: FormData } = await request.json();

    // Validate required form data
    if (!formData) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }

    // Initialize PDF document
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72
      }
    });

    // Collect PDF data in memory
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      // PDF generation complete
    });

    // Draw static form elements - Indiana Appearance Form layout
    drawFormLayout(doc);
    
    // Place user data onto the form
    fillUserData(doc, formData);

    // Finalize the PDF
    doc.end();

    // Wait for PDF to be generated
    await new Promise<void>((resolve) => {
      doc.on('end', resolve);
    });

    // Combine all chunks into final PDF buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Appearance_Form.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}