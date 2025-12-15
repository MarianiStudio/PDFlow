import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageCard } from './PageCard';
import { PDFPage } from '../types';

interface SortablePageProps {
  page: PDFPage;
  index: number;
  isSelected: boolean;
  selectionMode?: boolean;
  onToggleSelect: (id: string, multi: boolean) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onZoom: (page: PDFPage) => void;
  watermark?: string;
  watermarkColor?: string;
  watermarkOpacity?: number;
}

export const SortablePage: React.FC<SortablePageProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none select-none">
      <PageCard {...props} isDragging={isDragging} />
    </div>
  );
};