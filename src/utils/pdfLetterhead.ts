import { jsPDF } from 'jspdf';

export interface LetterheadConfig {
  doc: jsPDF;
  pageNumber?: number;
  totalPages?: number;
}

export const COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  gold: [218, 165, 32],
  darkGold: [184, 134, 11],
  lightGray: [240, 240, 240],
  mediumGray: [128, 128, 128],
  darkGray: [64, 64, 64],
  accentBlue: [41, 128, 185]
} as const;

export const MARGINS = {
  top: 45,
  bottom: 30,
  left: 20,
  right: 20,
  contentStart: 50
} as const;

export function addLetterheadHeader(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COLORS.lightGray);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(2);
  doc.line(0, 40, pageWidth, 40);

  doc.setTextColor(...COLORS.black);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
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

  doc.setTextColor(...COLORS.gold);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NOMADLLER', pageWidth - MARGINS.right - 35, 25);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text('TRAVEL & HOSPITALITY', pageWidth - MARGINS.right - 35, 30);

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1.5);
  doc.roundedRect(pageWidth - MARGINS.right - 38, 18, 36, 15, 2, 2, 'S');
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

  const footerText1 = '📞 +91 8129165766  |  +91 8590766166  |  +91 8501918751';
  const footerText2 = '📧 nomadllercommunity@gmail.com  |  🌐 www.nomadller.in';

  doc.text(footerText1, pageWidth / 2, pageHeight - 16, { align: 'center' });
  doc.text(footerText2, pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.setTextColor(...COLORS.mediumGray);
  doc.setFontSize(7);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - MARGINS.right, pageHeight - 5, { align: 'right' });
}

export function addPageWithLetterhead(doc: jsPDF): void {
  doc.addPage();
  addLetterheadHeader(doc);
}

export function checkPageBreak(doc: jsPDF, yPosition: number, requiredSpace: number = 40): number {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (yPosition + requiredSpace > pageHeight - 35) {
    addPageWithLetterhead(doc);
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

export function addInfoBox(doc: jsPDF, title: string, content: string[], yPosition: number): number {
  const boxWidth = 170;
  const lineHeight = 6;
  const padding = 5;
  const boxHeight = (content.length + 1) * lineHeight + padding * 2;

  yPosition = checkPageBreak(doc, yPosition, boxHeight + 5);

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

export function addDayPlanBox(doc: jsPDF, dayNumber: number, content: { title: string; items: string[] }[], yPosition: number): number {
  const boxWidth = 170;

  let totalHeight = 15;
  content.forEach(section => {
    totalHeight += 8 + (section.items.length * 5);
  });

  yPosition = checkPageBreak(doc, yPosition, totalHeight);

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
    contentY = checkPageBreak(doc, contentY, 8 + (section.items.length * 5));

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
        contentY = checkPageBreak(doc, contentY, 5);
        doc.text(`• ${line}`, MARGINS.left + 10, contentY);
        contentY += 5;
      });
    });

    contentY += 3;
  });

  return contentY + 5;
}

export function addPricingBox(doc: jsPDF, pricing: { label: string; usd: string; idr: string }[], yPosition: number): number {
  const boxWidth = 170;
  const lineHeight = 8;
  const boxHeight = (pricing.length + 2) * lineHeight + 10;

  yPosition = checkPageBreak(doc, yPosition, boxHeight);

  doc.setFillColor(...COLORS.darkGold);
  doc.roundedRect(MARGINS.left, yPosition, boxWidth, boxHeight, 3, 3, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PACKAGE PRICING', MARGINS.left + 5, yPosition + 10);

  let priceY = yPosition + 20;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  pricing.forEach((item, index) => {
    if (index === pricing.length - 1) {
      doc.setDrawColor(...COLORS.white);
      doc.setLineWidth(0.5);
      doc.line(MARGINS.left + 5, priceY - 3, MARGINS.left + boxWidth - 5, priceY - 3);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
    }

    doc.text(item.label, MARGINS.left + 5, priceY);
    doc.text(item.usd, MARGINS.left + 90, priceY, { align: 'right' });
    doc.text(item.idr, MARGINS.left + boxWidth - 5, priceY, { align: 'right' });
    priceY += lineHeight;
  });

  return yPosition + boxHeight + 10;
}

export function addInclusionsExclusions(doc: jsPDF, inclusions: string[], exclusions: string[], yPosition: number): number {
  yPosition = checkPageBreak(doc, yPosition, 40);

  yPosition = addSectionHeader(doc, 'INCLUSIONS', yPosition);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.black);

  inclusions.forEach(item => {
    yPosition = checkPageBreak(doc, yPosition, 5);
    const wrappedText = doc.splitTextToSize(item, 160);
    wrappedText.forEach((line: string) => {
      doc.text(`✓ ${line}`, MARGINS.left + 5, yPosition);
      yPosition += 5;
    });
  });

  yPosition += 5;
  yPosition = checkPageBreak(doc, yPosition, 40);

  yPosition = addSectionHeader(doc, 'EXCLUSIONS', yPosition);

  doc.setTextColor(...COLORS.black);

  exclusions.forEach(item => {
    yPosition = checkPageBreak(doc, yPosition, 5);
    const wrappedText = doc.splitTextToSize(item, 160);
    wrappedText.forEach((line: string) => {
      doc.text(`✗ ${line}`, MARGINS.left + 5, yPosition);
      yPosition += 5;
    });
  });

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
