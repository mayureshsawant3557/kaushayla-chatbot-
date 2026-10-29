import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import GazettePdfPage, { PAGE_WIDTH_PX, PAGE_HEIGHT_PX } from '../Component/PrintApplicationForm/GazettePdfPage';

const MAX_ROWS_PER_PAGE = 13;

const splitIntoPages = (candidates) => {
  const pages = [];
  for (let i = 0; i < candidates.length; i += MAX_ROWS_PER_PAGE) {
    pages.push(candidates.slice(i, i + MAX_ROWS_PER_PAGE));
  }
  return pages;
};

const waitForImages = (container) => {
  const imgs = Array.from(container.querySelectorAll('img'));
  return Promise.all(imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve; 
    });
  }));
};

export const downloadGazettePdf = async (reportData, filename = 'Gazette-Result.pdf') => {
  const allPages = [];
  reportData.courses.forEach(course => {
    const candidatePages = splitIntoPages(course.candidates);
    candidatePages.forEach((pageCandidates, pageIndex) => {
      allPages.push({ course, pageCandidates, pageIndex });
    });
  });
  const totalGlobalPages = allPages.length;
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '-99999px'; 
  host.style.zIndex = '-1';
  document.body.appendChild(host);

  const root = createRoot(host);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [PAGE_WIDTH_PX, PAGE_HEIGHT_PX] });

  try {
    for (let i = 0; i < allPages.length; i++) {
      const { course, pageCandidates, pageIndex } = allPages[i];

      
      await new Promise(resolve => {
        root.render(
          <GazettePdfPage
            course={course}
            pageCandidates={pageCandidates}
            pageIndex={pageIndex}
            globalPageNumber={i + 1}
            totalGlobalPages={totalGlobalPages}
            examinationDetails={reportData.examinationDetails}
            resultDate={reportData.resultDate}
            signature={reportData.signature}
          />
        );
        setTimeout(resolve, 50);
      });

      await waitForImages(host);

      const pageEl = host.firstElementChild;

const actualWidth = pageEl.scrollWidth;
const actualHeight = pageEl.scrollHeight;

const canvas = await html2canvas(pageEl, {
  scale: 2,
  useCORS: true,
  backgroundColor: '#ffffff',
  width: actualWidth,
  height: actualHeight,
  windowWidth: actualWidth,
  windowHeight: actualHeight,
});


const scaleFactor = Math.min(1, PAGE_WIDTH_PX / actualWidth);
const renderWidth = actualWidth * scaleFactor;
const renderHeight = actualHeight * scaleFactor;

const imgData = canvas.toDataURL('image/jpeg', 0.95);
if (i > 0) doc.addPage([PAGE_WIDTH_PX, PAGE_HEIGHT_PX], 'landscape');

const offsetX = (PAGE_WIDTH_PX - renderWidth) / 2;
doc.addImage(imgData, 'JPEG', offsetX, 0, renderWidth, renderHeight);

    }

    doc.save(filename);
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
};