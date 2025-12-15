import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import { PDFPage, UploadedFile, ExportOptions } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Helper: Convert Hex color to RGB object (0-1 values)
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
};

export const loadPDF = async (file: File): Promise<{ pages: PDFPage[], fileData: UploadedFile }> => {
  const arrayBuffer = await file.arrayBuffer();
  const fileId = uuidv4();
  
  // Load document for rendering thumbnails
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer.slice(0), 
    verbosity: 0 
  }); 
  
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  const pages: PDFPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); 
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;
      
      pages.push({
        id: uuidv4(),
        fileId: fileId,
        pageIndex: i - 1,
        rotation: 0,
        thumbnailUrl: canvas.toDataURL('image/jpeg', 0.85),
        width: viewport.width,
        height: viewport.height
      });
    }
  }

  const uploadedFile: UploadedFile = {
    id: fileId,
    name: file.name,
    data: arrayBuffer,
    mimeType: 'application/pdf'
  };

  return { pages, fileData: uploadedFile };
};

export const loadImage = async (file: File): Promise<{ pages: PDFPage[], fileData: UploadedFile }> => {
  const arrayBuffer = await file.arrayBuffer();
  const fileId = uuidv4();
  
  // Create an image element to get dimensions and thumbnail
  const blob = new Blob([arrayBuffer], { type: file.type });
  const imageUrl = URL.createObjectURL(blob);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create thumbnail via canvas to ensure consistent format/compression
      const canvas = document.createElement('canvas');
      // Limit max dimension for thumbnail performance if needed, but keeping full quality for now
      // to match PDF renderer behavior
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        const page: PDFPage = {
          id: uuidv4(),
          fileId: fileId,
          pageIndex: 0, // Images are always single page
          rotation: 0,
          thumbnailUrl: thumbnailUrl,
          width: img.width,
          height: img.height
        };

        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          data: arrayBuffer,
          mimeType: file.type
        };
        
        URL.revokeObjectURL(imageUrl); // Cleanup
        resolve({ pages: [page], fileData: uploadedFile });
      } else {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Failed to create canvas context"));
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(imageUrl);
      reject(e);
    };
    img.src = imageUrl;
  });
};

export const mergePDFs = async (
  pages: PDFPage[], 
  files: Map<string, UploadedFile>,
  options: ExportOptions
): Promise<Uint8Array> => {
  if (pages.length === 0) throw new Error("Aucune page à exporter.");

  const mergedPdf = await PDFDocument.create();
  const loadedDocs = new Map<string, PDFDocument>();
  const loadedImages = new Map<string, any>(); // Cache for embedded images

  // 1. Assemble pages
  for (const page of pages) {
    const fileData = files.get(page.fileId);
    if (!fileData) continue;

    // --- HANDLE PDF FILES ---
    if (fileData.mimeType === 'application/pdf') {
      let sourceDoc = loadedDocs.get(page.fileId);
      if (!sourceDoc) {
        try {
          sourceDoc = await PDFDocument.load(fileData.data);
          loadedDocs.set(page.fileId, sourceDoc);
        } catch (e) {
          console.error(`Erreur chargement PDF ${fileData.name}:`, e);
          continue;
        }
      }

      try {
          const [copiedPage] = await mergedPdf.copyPages(sourceDoc, [page.pageIndex]);
          const existingRotation = copiedPage.getRotation();
          const existingAngle = existingRotation.angle;
          const newAngle = (existingAngle + page.rotation) % 360;
          copiedPage.setRotation(degrees(newAngle));
          mergedPdf.addPage(copiedPage);
      } catch (e) {
          console.error(`Erreur copie page PDF ${page.pageIndex}:`, e);
      }
    } 
    // --- HANDLE IMAGE FILES (JPG/PNG) ---
    else if (fileData.mimeType.startsWith('image/')) {
       try {
         let embeddedImage = loadedImages.get(page.fileId);
         
         if (!embeddedImage) {
           if (fileData.mimeType === 'image/png') {
             embeddedImage = await mergedPdf.embedPng(fileData.data);
           } else {
             // Fallback to JPG for jpeg, etc.
             embeddedImage = await mergedPdf.embedJpg(fileData.data);
           }
           loadedImages.set(page.fileId, embeddedImage);
         }

         const { width, height } = embeddedImage.scale(1);
         const newPage = mergedPdf.addPage([width, height]);
         
         newPage.drawImage(embeddedImage, {
           x: 0,
           y: 0,
           width: width,
           height: height,
         });

         // Apply user rotation
         // Note: We set the page rotation metadata, simple and effective
         newPage.setRotation(degrees(page.rotation));
         
       } catch (e) {
         console.error(`Erreur image embedding ${fileData.name}:`, e);
       }
    }
  }

  // 2. Apply Watermark (if requested)
  if (options.watermark && options.watermark.trim().length > 0) {
    try {
      const helveticaFont = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
      const pages = mergedPdf.getPages();
      const text = options.watermark;
      const opacity = options.watermarkOpacity ?? 0.5;
      const colorHex = options.watermarkColor ?? '#FF3B30';
      const colorRgb = hexToRgb(colorHex);

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // MATCH PREVIEW: Use exactly 12% of page width as font size (like 12cqw in CSS)
        const fontSize = width * 0.12;
        
        const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);
        
        // CALCULATE CENTER
        const angle = 45;
        const rads = angle * (Math.PI / 180);
        
        const textCenterX = textWidth / 2;
        const textCenterY = fontSize * 0.35; 

        const rotatedOffsetX = textCenterX * Math.cos(rads) - textCenterY * Math.sin(rads);
        const rotatedOffsetY = textCenterX * Math.sin(rads) + textCenterY * Math.cos(rads);

        const x = (width / 2) - rotatedOffsetX;
        const y = (height / 2) - rotatedOffsetY;
        
        page.drawText(text, {
          x: x,
          y: y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
          opacity: opacity,
          rotate: degrees(angle),
        });
      }
    } catch (e) {
      console.warn("Erreur lors de l'application du filigrane:", e);
    }
  }

  if (mergedPdf.getPageCount() === 0) {
      throw new Error("Le document généré est vide.");
  }

  return await mergedPdf.save();
};