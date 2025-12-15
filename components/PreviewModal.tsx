import React from 'react';
import { PDFPage } from '../types';
import { X, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewModalProps {
  page: PDFPage | null;
  onClose: () => void;
  onRotate: () => void;
  watermark?: string;
  watermarkColor?: string;
  watermarkOpacity?: number;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ 
  page, 
  onClose, 
  onRotate,
  watermark,
  watermarkColor = '#000000',
  watermarkOpacity = 0.5
}) => {
  if (!page) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-lg"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Wrapper to catch clicks and prevent closing when clicking controls */}
          <div className="pointer-events-auto flex flex-col items-center gap-6 w-full h-full">
            
            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-[#1c1c1e]/80 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 shadow-2xl z-50">
               <button
                onClick={onRotate}
                className="p-3 rounded-full hover:bg-white/10 text-white transition-colors active:scale-95"
                title="Pivoter"
              >
                <RotateCw size={24} />
              </button>
              <div className="w-px h-6 bg-white/10"></div>
              <button
                onClick={onClose}
                className="p-3 rounded-full hover:bg-white/10 text-white transition-colors active:scale-95"
                title="Fermer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative flex-1 w-full min-h-0 flex items-center justify-center">
              <motion.div
                 className="relative shadow-2xl bg-white overflow-hidden"
                 animate={{ rotate: page.rotation }}
                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <img 
                  src={page.thumbnailUrl} 
                  alt="Page Preview" 
                  className="max-w-full max-h-[85vh] object-contain shadow-xl block"
                  draggable={false}
                />
                
                {/* Watermark in Preview - SVG Overlay */}
                {watermark && (
                   <div className="absolute inset-0 z-10 pointer-events-none">
                     <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                       <text 
                         x="50" 
                         y="50" 
                         fill={watermarkColor} 
                         fillOpacity={watermarkOpacity}
                         fontSize="12" 
                         fontFamily="Helvetica, sans-serif"
                         fontWeight="bold"
                         textAnchor="middle" 
                         dominantBaseline="middle"
                         transform="rotate(-45 50 50)"
                         style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                       >
                         {watermark}
                       </text>
                     </svg>
                   </div>
                 )}
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};