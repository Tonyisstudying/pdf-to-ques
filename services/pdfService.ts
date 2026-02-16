// Access the global variable loaded via CDN in index.html
const getPdfLib = () => (window as any).pdfjsLib;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const pdfjs = getPdfLib();
  if (!pdfjs) {
    throw new Error("PDF.js library not loaded");
  }

  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdfDocument.numPages;

    // Limit pages to prevent context window overflow if document is huge
    // For this demo, we'll take the first 15 pages which is usually sufficient for a quiz
    const maxPagesToRead = Math.min(numPages, 15);

    for (let i = 1; i <= maxPagesToRead; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\nPage ${i}:\n${pageText}`;
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to extract text from the PDF. Please try another file.");
  }
};