import React from 'react';
import { PDFPage } from '../types';
import { RotateCw, Trash2, Maximize2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageCardProps {
  page: PDFPage;
  index: number;
  isSelected: boolean;
  selectionMode?: boolean;
  onToggleSelect: (id: string, multi: boolean) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onZoom: (page: PDFPage) => void;
  isDragging?: boolean;
  watermark?: string; 
  watermarkColor?: string;
  watermarkOpacity?: number;
}

export const PageCard: React.FC<PageCardProps> = ({ 
  page, 
  index, 
  isSelected,
  selectionMode,
  onToggleSelect,
  onRotate, 
  onDelete, 
  onZoom,
  isDragging,
  watermark,
  watermarkColor = '#000000',
  watermarkOpacity = 0.5
}) => {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        const isMultiSelect = e.ctrlKey || e.metaKey || selectionMode;
        onToggleSelect(page.id, !!isMultiSelect);
      }}
      className={`
        group relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
        flex flex-col items-center justify-center
        ${isDragging ? 'opacity-50 scale-95 z-50 ring-2 ring-blue-500 bg-[#2c2c2e]' : 'hover:-translate-y-1'}
        ${isSelected 
          ? 'ring-2 ring-blue-500 bg-[#2c2c2e]/80 shadow-[0_0_25px_rgba(59,130,246,0.2)]' 
          : 'border-[1.5px] border-dashed border-white/10 hover:border-white/30 bg-[#1c1c1e]/40 hover:bg-[#2c2c2e] hover:shadow-2xl'
        }
      `}
    >
      {/* Selection Indicator - z-40 to be above everything */}
      <div 
         onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(page.id, true); 
         }}
         className={`
           absolute top-2 right-2 z-40 w-8 h-8 flex items-center justify-center cursor-pointer 
           transition-all duration-200 
           ${isSelected || selectionMode ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}
         `}
         title="Ajouter à la sélection"
      >
         <div className={`
           w-5 h-5 rounded-full border flex items-center justify-center 
           transition-colors duration-200 shadow-lg
           ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-[#1c1c1e] border-white/30 hover:bg-[#2c2c2e]'}
         `}>
            {isSelected && <CheckCircle2 size={12} className="text-white" />}
         </div>
      </div>

      {/* Page Content Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 z-0">
        <motion.div
          animate={{ rotate: page.rotation }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Paper Effect */}
          <div 
            className="relative shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-white w-full h-full flex items-center justify-center overflow-hidden rounded-sm ring-1 ring-black/5"
          >
             <img 
               src={page.thumbnailUrl} 
               alt={`Page ${index + 1}`}
               className="w-full h-full object-contain"
               draggable={false}
             />
             
             {/* Live Watermark Preview - SVG */}
             {watermark && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
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
                   >
                     {watermark}
                   </text>
                 </svg>
               </div>
             )}
          </div>
        </motion.div>
      </div>

      {/* Page Number Badge */}
      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-medium text-white/70 border border-white/5 z-20 pointer-events-none group-hover:bg-black/60 transition-colors">
        {index + 1}
      </div>

      {/* Hover Overlay Actions - z-30 to sit above content and watermark */}
      <div className="absolute inset-0 z-30 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-4 backdrop-blur-[1px]">
        {!selectionMode && (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onRotate(page.id); }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-white/10 shadow-lg"
              title="Pivoter"
            >
              <RotateCw size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onZoom(page); }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-white/10 shadow-lg"
              title="Zoomer"
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(page.id); }}
              className="p-2.5 rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-200 backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-red-500/20 shadow-lg"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};