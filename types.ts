
export interface PDFPage {
  id: string;          // Unique ID for React keys
  fileId: string;      // ID of the source file
  pageIndex: number;   // Index in the original file (0-based)
  rotation: number;    // Rotation in degrees (0, 90, 180, 270)
  thumbnailUrl: string; // Base64 or Blob URL for the preview
  width: number;       // Aspect ratio helper
  height: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  mimeType: string;
}

export interface AppState {
  pages: PDFPage[];
  files: Map<string, UploadedFile>; // Map fileId to raw data
}

export interface ExportOptions {
  fileName: string;
  watermark?: string;
  watermarkColor?: string;
  watermarkOpacity?: number;
}
