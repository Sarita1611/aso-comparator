import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPDF(elementId, filename = 'aso-report') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Report element not found');

  // Find the tab buttons and content area
  const tabButtons = element.querySelectorAll('[data-tab-id]');
  const tabContentArea = element.querySelector('[data-tab-content]');

  // If we have tabs, render each one and combine
  if (tabButtons.length > 0 && tabContentArea) {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let isFirstPage = true;

    for (const btn of tabButtons) {
      btn.click();
      await new Promise(r => setTimeout(r, 600)); // wait for render

      const canvas = await html2canvas(tabContentArea, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png', 0.95);
      const ratio = pdfWidth / canvas.width;
      const scaledHeight = canvas.height * ratio;
      let position = 0;
      let remaining = scaledHeight;

      while (remaining > 0) {
        if (!isFirstPage) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, scaledHeight, '', 'FAST');
        position += pdfHeight;
        remaining -= pdfHeight;
        isFirstPage = false;
      }
    }

    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
    return;
  }

  // Fallback: capture whole element
  const canvas = await html2canvas(element, {
    scale: 1.5, useCORS: true, allowTaint: true,
    backgroundColor: '#ffffff', logging: false, windowWidth: 1200,
  });
  const imgData = canvas.toDataURL('image/png', 0.95);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const ratio = pdfWidth / canvas.width;
  const scaledHeight = canvas.height * ratio;
  let position = 0;
  let remaining = scaledHeight;
  let first = true;
  while (remaining > 0) {
    if (!first) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, scaledHeight, '', 'FAST');
    position += pdfHeight;
    remaining -= pdfHeight;
    first = false;
  }
  pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
}
