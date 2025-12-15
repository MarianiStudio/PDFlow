import React from 'react';
import { FileUp, Plus } from 'lucide-react';
import { Button } from './Button';

interface DropZoneProps {
  onFileSelect: (files: FileList | null) => void;
  isCompact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, isCompact }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  if (isCompact) {
    return (
      <>
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => onFileSelect(e.target.files)}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
        />
        <Button onClick={handleClick} variant="secondary" size="sm">
          <Plus size={16} className="mr-2" />
          Ajouter
        </Button>
      </>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-center h-full min-h-[400px] w-full border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => onFileSelect(e.target.files)}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
      />
      
      <div className="p-6 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-300 mb-6 border border-white/10">
        <FileUp size={48} className="text-white/80" />
      </div>
      
      <h3 className="text-2xl font-semibold text-white mb-2">Déposez PDF ou Images ici</h3>
      <p className="text-gray-400 max-w-sm text-center">
        ou cliquez pour sélectionner.
        <br />
        <span className="text-xs text-gray-500 mt-2 block">
          Supporte PDF, JPG, PNG. Traitement 100% local.
        </span>
      </p>
    </div>
  );
};