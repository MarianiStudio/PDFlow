import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, X, Stamp, Palette, Eye } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  watermark: string;
  setWatermark: (text: string) => void;
  showWatermark: boolean;
  setShowWatermark: (show: boolean) => void;
  watermarkColor: string;
  setWatermarkColor: (color: string) => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (opacity: number) => void;
}

const COLORS = [
  { name: 'Red', hex: '#FF3B30' },
  { name: 'Black', hex: '#000000' },
  { name: 'Gray', hex: '#8E8E93' },
  { name: 'Blue', hex: '#0A84FF' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  watermark,
  setWatermark,
  showWatermark,
  setShowWatermark,
  watermarkColor,
  setWatermarkColor,
  watermarkOpacity,
  setWatermarkOpacity,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="w-full max-w-sm pointer-events-auto bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/20">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <span className="text-sm font-semibold text-white">Réglages du document</span>
              <button 
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              
              {/* Watermark Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${showWatermark ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                    <Stamp size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Filigrane</span>
                    <span className="text-[10px] text-gray-500">Appliquer sur toutes les pages</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showWatermark} 
                    onChange={(e) => setShowWatermark(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {/* Watermark Details */}
              <AnimatePresence>
                {showWatermark && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-5"
                  >
                    {/* Text Input */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        <Type size={12} />
                        Texte
                      </label>
                      <input 
                        type="text" 
                        value={watermark}
                        onChange={(e) => setWatermark(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 h-9 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-600"
                        placeholder="Ex: CONFIDENTIEL"
                      />
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        <Palette size={12} />
                        Couleur
                      </label>
                      <div className="flex gap-3">
                        {COLORS.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setWatermarkColor(c.hex)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${watermarkColor === c.hex ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-2 pb-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Eye size={12} />
                          Opacité
                        </label>
                        <span className="text-xs text-gray-500">{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.1"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                      />
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};