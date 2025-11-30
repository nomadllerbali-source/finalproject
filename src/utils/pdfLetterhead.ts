import { jsPDF } from 'jspdf';

export interface LetterheadConfig {
  doc: jsPDF;
  pageNumber?: number;
  totalPages?: number;
}

export const COLORS = {
  black: [0, 0, 0] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  gold: [218, 165, 32] as [number, number, number],
  darkGold: [184, 134, 11] as [number, number, number],
  lightGray: [240, 240, 240] as [number, number, number],
  mediumGray: [128, 128, 128] as [number, number, number],
  darkGray: [64, 64, 64] as [number, number, number],
  accentBlue: [41, 128, 185] as [number, number, number]
};

export const MARGINS = {
  top: 45,
  bottom: 30,
  left: 20,
  right: 20,
  contentStart: 50
} as const;

export function addLetterheadHeader(doc: jsPDF, template: 'nomadller' | 'bali-malayali' = 'nomadller'): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COLORS.lightGray);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(2);
  doc.line(0, 40, pageWidth, 40);

  doc.setTextColor(...COLORS.black);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');

  if (template === 'bali-malayali') {
    doc.text('BALI MALAYALI', MARGINS.left, 15);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const addressLine1 = 'Jl. Beringin, Dalung, Kuta Utara, Badung Regency, Bali 80361, Indonesia';
    doc.text(addressLine1, MARGINS.left, 22);

    doc.setFontSize(7);
    const contactLine = 'PH : +91 8129165766  |  +91 8590766166  |  +91 8501918751';
    doc.text(contactLine, MARGINS.left, 27);

    doc.setFontSize(7);
    const webLine = 'www.nomadller.in  I  nomadllercommunity@gmail.com';
    doc.text(webLine, MARGINS.left, 32);
  } else {
    doc.text('NOMADLLER PVT LTD', MARGINS.left, 15);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const addressLine1 = '1st floor, Shabana Building, Puzhakkarapadam Road, Vennala High School Road, Vennala, Ernakulam, Kerala | GST IN: 32AAICN3551E1ZS';
    doc.text(addressLine1, MARGINS.left, 22);

    doc.setFontSize(7);
    const contactLine = 'PH : +91 8129165766  |  +91 8590766166  |  +91 8501918751';
    doc.text(contactLine, MARGINS.left, 27);

    doc.setFontSize(7);
    const webLine = 'www.nomadller.in  I  nomadllercommunity@gmail.com';
    doc.text(webLine, MARGINS.left, 32);
  }
}

export function addLetterheadFooter(config: LetterheadConfig): void {
  const { doc, pageNumber = 1, totalPages = 1 } = config;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1);
  doc.line(0, pageHeight - 25, pageWidth, pageHeight - 25);

  doc.setFillColor(...COLORS.lightGray);
  doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');

  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const footerText1 = 'Phone: +91 8129165766  |  +91 8590766166  |  +91 8501918751';
  const footerText2 = 'Email: nomadllercommunity@gmail.com  |  Web: www.nomadller.in';

  doc.text(footerText1, pageWidth / 2, pageHeight - 16, { align: 'center' });
  doc.text(footerText2, pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.setTextColor(...COLORS.mediumGray);
  doc.setFontSize(7);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - MARGINS.right, pageHeight - 5, { align: 'right' });
}

export function addPageWithLetterhead(doc: jsPDF, template: 'nomadller' | 'bali-malayali' = 'nomadller'): void {
  doc.addPage();
  addLetterheadHeader(doc, template);
}

export function checkPageBreak(doc: jsPDF, yPosition: number, requiredSpace: number = 40, template: 'nomadller' | 'bali-malayali' = 'nomadller'): number {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (yPosition + requiredSpace > pageHeight - 35) {
    addPageWithLetterhead(doc, template);
    return MARGINS.contentStart;
  }

  return yPosition;
}

export function addSectionHeader(doc: jsPDF, text: string, yPosition: number, color: keyof typeof COLORS = 'darkGold'): number {
  doc.setFillColor(...COLORS[color]);
  doc.rect(MARGINS.left - 2, yPosition - 5, 170, 8, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGINS.left, yPosition);

  doc.setTextColor(...COLORS.black);

  return yPosition + 10;
}

export function addInfoBox(doc: jsPDF, title: string, content: string[], yPosition: number, template: 'nomadller' | 'bali-malayali' = 'nomadller'): number {
  const boxWidth = 170;
  const lineHeight = 6;
  const padding = 5;
  const boxHeight = (content.length + 1) * lineHeight + padding * 2;

  yPosition = checkPageBreak(doc, yPosition, boxHeight + 5, template);

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGINS.left, yPosition, boxWidth, boxHeight, 2, 2, 'S');

  doc.setFillColor(...COLORS.lightGray);
  doc.rect(MARGINS.left, yPosition, boxWidth, 8, 'F');

  doc.setTextColor(...COLORS.black);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGINS.left + padding, yPosition + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let contentY = yPosition + 12;

  content.forEach(line => {
    doc.text(line, MARGINS.left + padding, contentY);
    contentY += lineHeight;
  });

  return yPosition + boxHeight + 8;
}

export function addDayPlanBox(doc: jsPDF, dayNumber: number, content: { title: string; items: string[] }[], yPosition: number, template: 'nomadller' | 'bali-malayali' = 'nomadller'): number {
  const boxWidth = 170;

  let totalHeight = 15;
  content.forEach(section => {
    totalHeight += 8 + (section.items.length * 5);
  });

  yPosition = checkPageBreak(doc, yPosition, totalHeight, template);

  doc.setFillColor(...COLORS.gold);
  doc.circle(MARGINS.left + 5, yPosition + 5, 5, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(dayNumber.toString(), MARGINS.left + 5, yPosition + 7, { align: 'center' });

  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(MARGINS.left + 12, yPosition, boxWidth - 12, 10, 2, 2, 'F');

  doc.setTextColor(...COLORS.black);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`DAY ${dayNumber}`, MARGINS.left + 17, yPosition + 7);

  let contentY = yPosition + 15;

  content.forEach(section => {
    contentY = checkPageBreak(doc, contentY, 8 + (section.items.length * 5), template);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.darkGold);
    doc.text(`${section.title}:`, MARGINS.left + 5, contentY);
    contentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.black);
    doc.setFontSize(9);

    section.items.forEach(item => {
      const wrappedText = doc.splitTextToSize(item, boxWidth - 20);
      wrappedText.forEach((line: string) => {
        contentY = checkPageBreak(doc, contentY, 5, template);
        doc.text(`• ${line}`, MARGINS.left + 10, contentY);
        contentY += 5;
      });
    });

    contentY += 3;
  });

  return contentY + 5;
}

export function addDayPlanBoxWithDetails(
  doc: jsPDF,
  dayNumber: number,
  content: { title: string; items: Array<{ name: string; description?: string }> }[],
  yPosition: number,
  template: 'nomadller' | 'bali-malayali' = 'nomadller'
): number {
  const boxWidth = 170;

  let totalHeight = 15;
  content.forEach(section => {
    totalHeight += 8;
    section.items.forEach(item => {
      totalHeight += 6;
      if (item.description) totalHeight += 5;
    });
  });

  yPosition = checkPageBreak(doc, yPosition, totalHeight, template);

  doc.setFillColor(...COLORS.gold);
  doc.circle(MARGINS.left + 5, yPosition + 5, 5, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(dayNumber.toString(), MARGINS.left + 5, yPosition + 7, { align: 'center' });

  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(MARGINS.left + 12, yPosition, boxWidth - 12, 10, 2, 2, 'F');

  doc.setTextColor(...COLORS.black);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`DAY ${dayNumber}`, MARGINS.left + 17, yPosition + 7);

  let contentY = yPosition + 15;

  content.forEach(section => {
    contentY = checkPageBreak(doc, contentY, 10, template);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.darkGold);
    doc.text(`${section.title}:`, MARGINS.left + 5, contentY);
    contentY += 6;

    doc.setTextColor(...COLORS.black);

    section.items.forEach(item => {
      contentY = checkPageBreak(doc, contentY, item.description ? 10 : 6, template);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const nameWrapped = doc.splitTextToSize(`• ${item.name}`, boxWidth - 20);
      nameWrapped.forEach((line: string) => {
        doc.text(line, MARGINS.left + 10, contentY);
        contentY += 5;
      });

      if (item.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const descWrapped = doc.splitTextToSize(item.description, boxWidth - 25);
        descWrapped.forEach((line: string) => {
          contentY = checkPageBreak(doc, contentY, 5, template);
          doc.text(line, MARGINS.left + 15, contentY);
          contentY += 4;
        });
        contentY += 1;
      }
    });

    contentY += 3;
  });

  return contentY + 5;
}

export function addPricingBox(doc: jsPDF, pricing: { label: string; usd: string; idr: string }[], yPosition: number, template: 'nomadller' | 'bali-malayali' = 'nomadller'): number {
  const boxWidth = 170;
  const boxHeight = 30;

  yPosition = checkPageBreak(doc, yPosition, boxHeight, template);

  doc.setFillColor(...COLORS.darkGold);
  doc.roundedRect(MARGINS.left, yPosition, boxWidth, boxHeight, 3, 3, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PACKAGE PRICE', MARGINS.left + 5, yPosition + 12);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const totalItem = pricing[pricing.length - 1];
  doc.text(totalItem.usd, MARGINS.left + 5, yPosition + 22);
  doc.text(totalItem.idr, MARGINS.left + boxWidth - 5, yPosition + 22, { align: 'right' });

  return yPosition + boxHeight + 10;
}

export function addInclusionsExclusions(doc: jsPDF, inclusions: string[], exclusions: string[], yPosition: number, note?: string, template: 'nomadller' | 'bali-malayali' = 'nomadller'): number {
  yPosition = checkPageBreak(doc, yPosition, 40, template);

  yPosition = addSectionHeader(doc, 'INCLUSIONS', yPosition);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.black);

  inclusions.forEach(item => {
    yPosition = checkPageBreak(doc, yPosition, 6, template);

    // Check if item is a bold header (wrapped in **)
    if (item.startsWith('**') && item.endsWith('**')) {
      const headerText = item.replace(/\*\*/g, '');
      doc.setFont('helvetica', 'bold');
      doc.text(headerText, MARGINS.left + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 6;
    } else {
      const wrappedText = doc.splitTextToSize(item, 160);
      wrappedText.forEach((line: string) => {
        doc.text(`• ${line}`, MARGINS.left + 5, yPosition);
        yPosition += 6;
      });
    }
  });

  yPosition += 5;
  yPosition = checkPageBreak(doc, yPosition, 40, template);

  yPosition = addSectionHeader(doc, 'EXCLUSIONS', yPosition);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.black);

  exclusions.forEach(item => {
    yPosition = checkPageBreak(doc, yPosition, 6, template);
    const wrappedText = doc.splitTextToSize(item, 160);
    wrappedText.forEach((line: string) => {
      doc.text(`• ${line}`, MARGINS.left + 5, yPosition);
      yPosition += 6;
    });
  });

  // Add note if provided
  if (note) {
    yPosition += 5;
    yPosition = checkPageBreak(doc, yPosition, 10, template);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    const wrappedNote = doc.splitTextToSize(note, 160);
    wrappedNote.forEach((line: string) => {
      doc.text(line, MARGINS.left + 5, yPosition);
      yPosition += 6;
    });
    doc.setTextColor(...COLORS.black);
  }

  return yPosition + 10;
}

export function finalizeLetterheadPDF(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addLetterheadFooter({ doc, pageNumber: i, totalPages });
  }
}

export function addDocumentTitle(doc: jsPDF, title: string, subtitle: string, yPosition: number): number {
  doc.setTextColor(...COLORS.black);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, doc.internal.pageSize.getWidth() / 2, yPosition, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.mediumGray);
  doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, yPosition + 6, { align: 'center' });

  doc.setTextColor(...COLORS.black);

  return yPosition + 15;
}
