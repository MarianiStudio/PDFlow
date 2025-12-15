import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { Download, Undo2, Redo2, Trash2, X, CheckSquare, Square, Plus, RotateCw, Settings2, Layers, Move, Maximize2, Stamp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PDFPage, UploadedFile, ExportOptions } from './types';
import { loadPDF, loadImage, mergePDFs } from './services/pdfService';
import { DropZone } from './components/DropZone';
import { SortablePage } from './components/SortablePage';
import { PreviewModal } from './components/PreviewModal';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [files, setFiles] = useState<Map<string, UploadedFile>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPage, setPreviewPage] = useState<PDFPage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Document Settings state (Global)
  const [fileName, setFileName] = useState("document-fusionne");
  
  // Watermark Settings
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIEL"); // Default text
  const [watermarkColor, setWatermarkColor] = useState("#FF3B30"); // Default Apple Red
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5); // Default 50% opacity
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Undo/Redo History
  const [history, setHistory] = useState<PDFPage[][]>([]);
  const [future, setFuture] = useState<PDFPage[][]>([]);

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: { distance: 5 } 
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Actions ---

  const saveToHistory = useCallback((currentPages: PDFPage[]) => {
    setHistory(prev => [...prev, currentPages]);
    setFuture([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [pages, ...prev]);
    setPages(previous);
    setHistory(prev => prev.slice(0, -1));
    setSelectedIds(new Set()); // Clear selection on undo
  }, [history, pages]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, pages]);
    setPages(next);
    setFuture(prev => prev.slice(1));
    setSelectedIds(new Set());
  }, [future, pages]);

  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    saveToHistory([...pages]);

    try {
      const newFilesData: UploadedFile[] = [];
      const newPagesData: PDFPage[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        try {
          let result;
          if (file.type === 'application/pdf') {
            result = await loadPDF(file);
          } else if (file.type.startsWith('image/')) {
            result = await loadImage(file);
          } else {
            console.warn(`Type de fichier non supporté: ${file.type}`);
            continue;
          }

          if (result) {
            newFilesData.push(result.fileData);
            newPagesData.push(...result.pages);
          }
        } catch (err) {
          console.error("Error loading file", err);
          alert(`Erreur lors du chargement de ${file.name}`);
        }
      }

      setFiles(prevFiles => {
        const nextFiles = new Map(prevFiles);
        newFilesData.forEach(f => nextFiles.set(f.id, f));
        return nextFiles;
      });

      setPages(prevPages => [...prevPages, ...newPagesData]);

    } catch (error) {
       console.error("Critical error in file handling", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // --- Selection Logic ---

  const handleToggleSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(multi ? prev : []);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map(p => p.id)));
    }
  }, [pages, selectedIds]);

  // --- Batch Actions ---

  const handleRotate = useCallback((id: string) => {
    saveToHistory(pages);
    setPages(prev => prev.map(p => {
      // Rotate if it matches ID OR if it's in the selection
      if (p.id === id || (selectedIds.has(p.id) && selectedIds.has(id))) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  }, [pages, saveToHistory, selectedIds]);

  const handleRotateSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    saveToHistory(pages);
    setPages(prev => prev.map(p => {
      if (selectedIds.has(p.id)) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  }, [pages, saveToHistory, selectedIds]);

  const handleDelete = useCallback((id: string) => {
    saveToHistory(pages);
    setPages(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [pages, saveToHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    saveToHistory(pages);
    setPages(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  }, [pages, saveToHistory, selectedIds]);

  // Preview specific
  const handleRotatePreview = useCallback(() => {
    if (!previewPage) return;
    handleRotate(previewPage.id);
    setPreviewPage(prev => prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : null);
  }, [previewPage, handleRotate]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      saveToHistory(pages);
      setPages((items) => {
        const oldIndex = items.findIndex(p => p.id === active.id);
        const newIndex = items.findIndex(p => p.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, [pages, saveToHistory]);

  // Handle Export Flow - Instant Download
  const handleInstantExport = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);

    try {
      const options: ExportOptions = {
        fileName: fileName,
        watermark: showWatermark ? watermarkText : undefined,
        watermarkColor: showWatermark ? watermarkColor : undefined,
        watermarkOpacity: showWatermark ? watermarkOpacity : undefined,
      };

      const pdfBytes = await mergePDFs(pages, files, options);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.trim() || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur export: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input (except filename in header is managed differently, but modal inputs need check)
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        handleDeleteSelected();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll, handleDeleteSelected, handleUndo, handleRedo, selectedIds.size]);

  // Contextual State
  const hasSelection = selectedIds.size > 0;
  const hasPages = pages.length > 0;

  const features = [
    {
      icon: Layers,
      title: "Fusionner",
      desc: "PDF & Images"
    },
    {
      icon: Move,
      title: "Organiser",
      desc: "Drag & Drop"
    },
    {
      icon: RotateCw,
      title: "Pivoter",
      desc: "Orientation"
    },
    {
      icon: Trash2,
      title: "Supprimer",
      desc: "Pages inutiles"
    },
    {
      icon: Stamp,
      title: "Filigrane",
      desc: "Protection"
    },
    {
      icon: Maximize2,
      title: "Zoomer",
      desc: "Inspection"
    }
  ];

  return (
    // MAIN LAYOUT
    <div className="h-[100dvh] bg-black text-gray-200 flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* HEADER: Flex-none to keep fixed height */}
      <header className="flex-none sticky top-0 z-40 w-full backdrop-blur-xl bg-black/80 border-b border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            {!hasSelection ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <span className="font-bold text-white">P</span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-white hidden sm:block">PDFlow</h1>
              </div>
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                 <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
                 >
                   <X size={18} />
                </button>
                <span className="text-white font-medium whitespace-nowrap">{selectedIds.size} <span className="hidden sm:inline">sélectionné(s)</span></span>
              </div>
            )}
          </div>

          {/* Controls */}
          {hasPages && (
             <div className="flex-1 max-w-md mx-4 sm:mx-8 flex items-center gap-3 justify-end sm:justify-center">
                <div className="flex items-center bg-[#1c1c1e] rounded-lg border border-white/10 px-3 h-10 w-full max-w-[240px] focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                  <span className="text-gray-500 text-xs mr-2 font-medium shrink-0">Nom</span>
                  <input 
                    type="text" 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="bg-transparent border-none text-white text-sm w-full focus:outline-none placeholder-gray-600 min-w-0"
                    placeholder="document"
                  />
                  <span className="text-gray-600 text-xs ml-1 hidden sm:block">.pdf</span>
               </div>
               
               <button 
                 onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                 className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${isSettingsOpen ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-[#1c1c1e] text-gray-400 border-white/10 hover:text-white hover:bg-[#2c2c2e]'}`}
               >
                 <Settings2 size={20} />
               </button>
             </div>
          )}

          <div className="w-8 hidden sm:block" />
        </div>
      </header>

      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        watermark={watermarkText}
        setWatermark={setWatermarkText}
        showWatermark={showWatermark}
        setShowWatermark={setShowWatermark}
        watermarkColor={watermarkColor}
        setWatermarkColor={setWatermarkColor}
        watermarkOpacity={watermarkOpacity}
        setWatermarkOpacity={setWatermarkOpacity}
      />

      {/* SCROLLABLE AREA: This takes all remaining space */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col scroll-smooth"
        onClick={() => {
          if (hasSelection) setSelectedIds(new Set());
          if (isSettingsOpen) setIsSettingsOpen(false);
        }}
      >
        {/* INNER WRAPPER: Ensures footer is pushed down via flex-grow */}
        <div className="flex-grow flex flex-col min-h-full">
           
           {/* MAIN CONTENT: Grows to push footer */}
           <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
              />

              {pages.length === 0 ? (
                // EMPTY STATE: Centered with offset to avoid footer overlap and reduce top space
                <div className="flex-1 flex flex-col items-center justify-center py-6 gap-6 animate-in fade-in zoom-in duration-500 pb-20">
                    
                    {/* Feature Grid - Compact & Responsive */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 w-full max-w-4xl">
                        {features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group cursor-default"
                          >
                            <div className="p-2 bg-white/5 rounded-full mb-2 text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                              <feature.icon size={18} />
                            </div>
                            <h3 className="text-xs font-medium text-gray-200 hidden sm:block">{feature.title}</h3>
                            <span className="text-xs font-medium text-gray-200 sm:hidden">{feature.title}</span>
                          </motion.div>
                        ))}
                    </div>

                    {/* DropZone - Hero Element - Responsive Height */}
                    <div className="w-full max-w-2xl h-60 sm:h-72 md:h-80 relative z-10 rounded-3xl shadow-2xl">
                        {isProcessing ? (
                          <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white/5 rounded-3xl border border-white/10">
                              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              <p className="text-gray-400 font-medium">Traitement des fichiers...</p>
                          </div>
                        ) : (
                          <DropZone onFileSelect={handleFileSelect} />
                        )}
                    </div>
                </div>
              ) : (
                // CONTENT STATE: Grid with proper top spacing
                <div className="pt-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DndContext 
                      sensors={sensors} 
                      collisionDetection={closestCenter} 
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={pages.map(p => p.id)} 
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
                          {pages.map((page, index) => (
                            <SortablePage 
                              key={page.id} 
                              page={page} 
                              index={index}
                              isSelected={selectedIds.has(page.id)}
                              selectionMode={hasSelection}
                              onToggleSelect={handleToggleSelect}
                              onRotate={handleRotate}
                              onDelete={handleDelete}
                              onZoom={setPreviewPage}
                              watermark={showWatermark ? watermarkText : undefined}
                              watermarkColor={showWatermark ? watermarkColor : undefined}
                              watermarkOpacity={showWatermark ? watermarkOpacity : undefined}
                            />
                          ))}
                          
                          {isProcessing && (
                            <div className="aspect-[3/4] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                </div>
              )}
           </main>

           {/* FOOTER: Part of flex flow, pushed to bottom. Use z-20 to ensure it's clickable and visible but not overlapping content if content is large (it pushes footer). 
               Background opacity ensures if something DOES scroll behind (rare), it's visible. */}
           <footer className={`flex-none w-full text-center border-t border-white/5 bg-black z-20 transition-all duration-300 ${hasPages ? 'pt-8 pb-32' : 'py-8'}`}>
              <div className="flex flex-col items-center gap-3">
                  <p className="text-[10px] sm:text-xs font-medium tracking-wide text-gray-500 uppercase">Privacy First: 100% Client-Side & Local Data</p>
                  <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[10px] sm:text-xs text-gray-600">
                    <a href="https://irreductia.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Irreductia App</a>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-700" />
                    <a href="https://marianistudio.fr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Powered by Mariani Studio</a>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-700" />
                    <a href="mailto:hello@irreductia.com" className="hover:text-white transition-colors">Feedback</a>
                  </div>
              </div>
           </footer>
        </div>
      </div>

      {/* FLOATING DOCK */}
      {hasPages && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
          <AnimatePresence mode="wait">
            {hasSelection ? (
              // Selection Dock
              <motion.div 
                key="selection-dock"
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                className="pointer-events-auto h-16 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-between px-6 shadow-2xl w-full max-w-sm"
              >
                  <button onClick={handleRotateSelected} className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
                    <div className="p-2 bg-white/10 rounded-full"><RotateCw size={20} /></div>
                    <span className="text-[10px] font-medium">Pivoter</span>
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <button onClick={handleDeleteSelected} className="flex flex-col items-center gap-1 text-red-400 active:scale-90 transition-transform">
                    <div className="p-2 bg-red-500/10 rounded-full border border-red-500/20"><Trash2 size={20} /></div>
                    <span className="text-[10px] font-medium">Supprimer</span>
                  </button>
                  <div className="flex-1" />
                  <button onClick={handleSelectAll} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white active:scale-90 transition-transform">
                    <div className="p-2">{selectedIds.size === pages.length ? <CheckSquare size={20} /> : <Square size={20} />}</div>
                    <span className="text-[10px] font-medium">Tout</span>
                  </button>
              </motion.div>
            ) : (
              // Main Dock
              <motion.div 
                key="main-dock"
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                className="pointer-events-auto h-16 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-between px-4 shadow-2xl w-full max-w-sm gap-2"
              >
                 <div className="flex items-center gap-1">
                    <button onClick={handleUndo} disabled={history.length === 0} className="p-3 text-gray-400 hover:text-white disabled:opacity-30 active:scale-90 transition-all"><Undo2 size={20} /></button>
                    <button onClick={handleRedo} disabled={future.length === 0} className="p-3 text-gray-400 hover:text-white disabled:opacity-30 active:scale-90 transition-all"><Redo2 size={20} /></button>
                 </div>
                 <div className="-mt-8">
                    <button onClick={triggerFileInput} className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center active:scale-95 hover:scale-105 transition-all border-4 border-black"><Plus size={28} /></button>
                 </div>
                 <div className="flex items-center gap-1">
                    <button onClick={handleSelectAll} className="p-3 text-gray-400 hover:text-white active:scale-90 transition-all" title="Mode sélection"><CheckSquare size={20} /></button>
                    <button onClick={handleInstantExport} disabled={pages.length === 0} className="p-3 text-blue-400 hover:text-blue-300 disabled:opacity-30 active:scale-90 transition-all" title="Télécharger"><Download size={20} /></button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <PreviewModal 
        page={previewPage} 
        onClose={() => setPreviewPage(null)} 
        onRotate={handleRotatePreview}
        watermark={showWatermark ? watermarkText : undefined}
        watermarkColor={showWatermark ? watermarkColor : undefined}
        watermarkOpacity={showWatermark ? watermarkOpacity : undefined}
      />
    </div>
  );
}

export default App;