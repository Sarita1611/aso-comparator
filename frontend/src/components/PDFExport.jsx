import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PAGE_MARGIN_MM = 10; // top/bottom margin on each page in mm
const SCAN_WINDOW_PX = 80; // how many canvas pixels above/below ideal cut to scan for whitespace

/**
 * Given a canvas and a pixel Y position, scan up to SCAN_WINDOW_PX rows
 * above it to find the best "quiet" row (mostly white/light pixels) to cut at.
 * Returns the best Y in canvas pixels.
 */
function findBestCutY(canvas, idealY) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;

  let bestY = idealY;
  let bestScore = -1;

  // scan from idealY upward by SCAN_WINDOW_PX
  const startY = Math.max(0, idealY - SCAN_WINDOW_PX);
  const endY = Math.min(canvas.height - 1, idealY);

  for (let y = endY; y >= startY; y--) {
    const imageData = ctx.getImageData(0, y, width, 1).data;
    let lightPixels = 0;
    for (let x = 0; x < imageData.length; x += 4) {
      const r = imageData[x], g = imageData[x + 1], b = imageData[x + 2];
      // consider "light" if close to white (background)
      if (r > 230 && g > 230 && b > 230) lightPixels++;
    }
    const score = lightPixels / (width);
    if (score > bestScore) {
      bestScore = score;
      bestY = y;
    }
    // if nearly all white, this is a great cut — stop early
    if (score > 0.95) break;
  }

  return bestY;
}

/**
 * Add a canvas image to the PDF across multiple pages with smart cut points
 * and top/bottom margins on each page.
 */
function addCanvasToPDF(pdf, canvas, isFirstSection) {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const marginMM = PAGE_MARGIN_MM;
  const usableHeightMM = pdfHeight - marginMM * 2;

  // scale factor: canvas px → mm
  const scaleMM = pdfWidth / canvas.width;
  const usableHeightPX = usableHeightMM / scaleMM;

  let sliceStartPX = 0;
  let isFirstPage = true;

  while (sliceStartPX < canvas.height) {
    // ideal end of this slice
    const idealEndPX = sliceStartPX + usableHeightPX;

    let sliceEndPX;
    if (idealEndPX >= canvas.height) {
      sliceEndPX = canvas.height;
    } else {
      // find a smart cut near idealEndPX
      sliceEndPX = findBestCutY(canvas, Math.floor(idealEndPX));
      // safety: if smart cut went too far back (very dense content), just cut at ideal
      if (sliceEndPX <= sliceStartPX + usableHeightPX * 0.5) {
        sliceEndPX = Math.floor(idealEndPX);
      }
    }

    const sliceHeightPX = sliceEndPX - sliceStartPX;
    if (sliceHeightPX <= 0) break;

    // Create a temporary canvas for this slice
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPX;
    const sliceCtx = sliceCanvas.getContext('2d');
    // white background
    sliceCtx.fillStyle = '#ffffff';
    sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sliceCtx.drawImage(canvas, 0, sliceStartPX, canvas.width, sliceHeightPX, 0, 0, canvas.width, sliceHeightPX);

    const sliceImgData = sliceCanvas.toDataURL('image/png', 0.95);
    const sliceHeightMM = sliceHeightPX * scaleMM;

    if (!isFirstPage || !isFirstSection) {
      pdf.addPage();
    }

    // place with top margin
    pdf.addImage(sliceImgData, 'PNG', 0, marginMM, pdfWidth, sliceHeightMM, '', 'FAST');

    sliceStartPX = sliceEndPX;
    isFirstPage = false;
  }
}

export async function exportReportToPDF(elementId, filename = 'aso-report') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Report element not found');

  const tabButtons = element.querySelectorAll('[data-tab-id]');
  const tabContentArea = element.querySelector('[data-tab-content]');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let isFirstSection = true;

  const captureOptions = {
    scale: 1.8,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 1200,
  };

  if (tabButtons.length > 0 && tabContentArea) {
    for (const btn of tabButtons) {
      btn.click();
      // wait for tab render + any animations
      await new Promise(r => setTimeout(r, 700));

      const canvas = await html2canvas(tabContentArea, captureOptions);
      addCanvasToPDF(pdf, canvas, isFirstSection);
      isFirstSection = false;
    }
  } else {
    // fallback: whole element
    const canvas = await html2canvas(element, captureOptions);
    addCanvasToPDF(pdf, canvas, true);
  }

  pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
}
