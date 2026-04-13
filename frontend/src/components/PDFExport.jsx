import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPDF(elementId, filename = 'aso-report') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Report element not found');

  // Temporarily make element full width for PDF
  const originalStyle = element.style.cssText;
  element.style.width = '1200px';
  element.style.maxWidth = '1200px';

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f8fafc',
      logging: false,
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    let position = 0;
    let remainingHeight = scaledHeight;

    // Add pages
    while (remainingHeight > 0) {
      if (position > 0) pdf.addPage();

      pdf.addImage(
        imgData,
        'PNG',
        0,
        -position,
        pdfWidth,
        scaledHeight,
        '',
        'FAST'
      );

      position += pdfHeight;
      remainingHeight -= pdfHeight;
    }

    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    element.style.cssText = originalStyle;
  }
}
