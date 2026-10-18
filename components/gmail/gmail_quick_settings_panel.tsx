'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

export type DensityOption = 'default' | 'comfortable' | 'compact';

export interface ThemeOption {
  id: string;
  name: string;
  type: 'color' | 'image';
  previewUrl: string;
  backgroundStyle: string;
}

export const PRESET_THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    type: 'color',
    previewUrl: 'default_svg',
    backgroundStyle: '#f8fafd',
  },
  {
    id: 'mountain_sunset',
    name: 'Mountain Sunset',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'blue_neon',
    name: 'Blue Neon',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'chess_board',
    name: 'Chess Strategy',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'red_canyon',
    name: 'Red Rock Canyon',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'nature_green',
    name: 'Nature & Foliage',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'industrial_tubes',
    name: 'Industrial Metal',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'autumn_leaves',
    name: 'Autumn Leaves',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1507371341162-763b5e419408?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1507371341162-763b5e419408?w=1920&q=80) center/cover no-repeat fixed',
  },
  // 30 Additional Themes
  {
    id: 'deep_space',
    name: 'Deep Space Nebula',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'aurora_borealis',
    name: 'Northern Lights',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'tokyo_neon',
    name: 'Tokyo Cyberpunk',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'foggy_forest',
    name: 'Misty Pine Forest',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'desert_dunes',
    name: 'Sahara Twilight',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'ocean_waves',
    name: 'Pacific Azure',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'cyber_circuit',
    name: 'Quantum Circuit',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'alpine_lake',
    name: 'Emerald Alpine Lake',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'geometric_dark',
    name: 'Obsidian Hexagons',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'sunset_clouds',
    name: 'Golden Hour Stratosphere',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'iceland_glacier',
    name: 'Arctic Diamond Ice',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'modern_architecture',
    name: 'Monolithic Glass',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'retro_wave',
    name: 'Synthwave Horizon',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'volcano_magma',
    name: 'Volcanic Obsidian',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'lavender_field',
    name: 'Provence Twilight',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'cyber_matrix',
    name: 'Matrix Data Stream',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'starry_milkyway',
    name: 'Milky Way Galaxy',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'gradient_aurora_mesh',
    name: 'Cosmic Mesh Gradient',
    type: 'color',
    previewUrl: 'gradient_aurora',
    backgroundStyle: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #312e81 70%, #0369a1 100%)',
  },
  {
    id: 'gradient_midnight_slate',
    name: 'Midnight Slate',
    type: 'color',
    previewUrl: 'gradient_slate',
    backgroundStyle: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1f2937 100%)',
  },
  {
    id: 'gradient_emerald_deep',
    name: 'Cyber Emerald',
    type: 'color',
    previewUrl: 'gradient_emerald',
    backgroundStyle: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)',
  },
  {
    id: 'gradient_crimson_nebula',
    name: 'Crimson Nebula',
    type: 'color',
    previewUrl: 'gradient_crimson',
    backgroundStyle: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)',
  },
  {
    id: 'gradient_amethyst_dark',
    name: 'Dark Amethyst',
    type: 'color',
    previewUrl: 'gradient_amethyst',
    backgroundStyle: 'linear-gradient(135deg, #2e1065 0%, #3b0764 50%, #581c87 100%)',
  },
  {
    id: 'gradient_ocean_trench',
    name: 'Oceanic Trench',
    type: 'color',
    previewUrl: 'gradient_ocean',
    backgroundStyle: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 50%, #0369a1 100%)',
  },
  {
    id: 'gradient_sunset_flame',
    name: 'Sunset Ember',
    type: 'color',
    previewUrl: 'gradient_sunset',
    backgroundStyle: 'linear-gradient(135deg, #1c1917 0%, #431407 50%, #7c2d12 100%)',
  },
  {
    id: 'gradient_pure_minimal',
    name: 'Pure Minimal Gray',
    type: 'color',
    previewUrl: 'gradient_minimal',
    backgroundStyle: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
  },
  {
    id: 'gradient_solar_gold',
    name: 'Solar Flare',
    type: 'color',
    previewUrl: 'gradient_solar',
    backgroundStyle: 'linear-gradient(135deg, #422006 0%, #713f12 50%, #a16207 100%)',
  },
  {
    id: 'bamboo_grove',
    name: 'Zen Bamboo Forest',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'yosemite_valley',
    name: 'Yosemite Granite',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'neon_geometric_mesh',
    name: 'Prism Waveform',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&q=80) center/cover no-repeat fixed',
  },
  {
    id: 'starfield_infinity',
    name: 'Infinite Stellar Field',
    type: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=300&q=80',
    backgroundStyle: 'url(https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=1920&q=80) center/cover no-repeat fixed',
  },
];

interface GmailQuickSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  density: DensityOption;
  onDensityChange: (d: DensityOption) => void;
  activeThemeId: string;
  onSelectTheme: (theme: ThemeOption) => void;
  onUploadCustomWallpaper: (dataUrl: string) => void;
  onSeeAllSettings: () => void;
}

export function GmailQuickSettingsPanel({
  isOpen,
  onClose,
  density,
  onDensityChange,
  activeThemeId,
  onSelectTheme,
  onUploadCustomWallpaper,
  onSeeAllSettings,
}: GmailQuickSettingsPanelProps) {
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Always reset view-all modal whenever the settings panel is closed
  useEffect(() => {
    if (!isOpen) {
      setIsViewAllModalOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // If modal is open, clicks inside the modal dialog should not trigger outside click
      if (isViewAllModalOpen && modalRef.current && modalRef.current.contains(event.target as Node)) {
        return;
      }

      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const isTrigger = (event.target as HTMLElement)?.closest?.('[data-panel-trigger="quick-settings"]');
        if (isTrigger) return;
        setIsViewAllModalOpen(false);
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isViewAllModalOpen) {
          setIsViewAllModalOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isViewAllModalOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onUploadCustomWallpaper(result);
      setIsViewAllModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Quick Settings Flyout Drawer */}
      <div
        ref={panelRef}
        className="absolute top-16 right-4 z-50 w-80 bg-[#f0f4f9] rounded-2xl shadow-2xl border border-[#c4c7c5]/50 overflow-hidden flex flex-col font-sans select-none animate-in fade-in slide-in-from-top-2 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#c4c7c5]/30">
          <h3 className="text-base font-medium text-[#1f1f1f]">
            Quick settings
          </h3>
          <button
            onClick={() => {
              setIsViewAllModalOpen(false);
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/10 text-[#444746] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* See All Settings Button */}
          <button
            onClick={() => {
              setIsViewAllModalOpen(false);
              onClose();
              onSeeAllSettings();
            }}
            className="w-full py-2.5 px-4 rounded-full border border-[#747775] text-[#0b57d0] hover:bg-[#0b57d0]/10 text-sm font-semibold text-center transition-colors shadow-xs"
          >
            See all settings
          </button>

          {/* Section: Density */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-semibold text-[#444746] tracking-wide uppercase">
              Density
            </span>

            <div className="space-y-2">
              {/* Default */}
              <label
                onClick={() => onDensityChange('default')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      density === 'default'
                        ? 'border-[#0b57d0]'
                        : 'border-[#747775]'
                    }`}
                  >
                    {density === 'default' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0b57d0]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#1f1f1f]">
                    Default
                  </span>
                </div>
                {/* Visual Icon Illustration */}
                <div className="w-20 h-7 bg-white rounded border border-[#c4c7c5] flex flex-col justify-center px-1.5 gap-1">
                  <div className="w-12 h-1 bg-[#c4c7c5] rounded" />
                  <div className="w-8 h-2.5 bg-[#d3e3fd] rounded flex items-center justify-center">
                    <div className="w-3 h-1 bg-[#0b57d0] rounded-xs" />
                  </div>
                </div>
              </label>

              {/* Comfortable */}
              <label
                onClick={() => onDensityChange('comfortable')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      density === 'comfortable'
                        ? 'border-[#0b57d0]'
                        : 'border-[#747775]'
                    }`}
                  >
                    {density === 'comfortable' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0b57d0]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#1f1f1f]">
                    Comfortable
                  </span>
                </div>
                {/* Visual Icon Illustration */}
                <div className="w-20 h-7 bg-white rounded border border-[#c4c7c5] flex flex-col justify-center px-1.5 gap-1.5">
                  <div className="w-16 h-1 bg-[#c4c7c5] rounded" />
                  <div className="w-14 h-1 bg-[#c4c7c5] rounded" />
                </div>
              </label>

              {/* Compact */}
              <label
                onClick={() => onDensityChange('compact')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      density === 'compact'
                        ? 'border-[#0b57d0]'
                        : 'border-[#747775]'
                    }`}
                  >
                    {density === 'compact' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0b57d0]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#1f1f1f]">
                    Compact
                  </span>
                </div>
                {/* Visual Icon Illustration */}
                <div className="w-20 h-7 bg-white rounded border border-[#c4c7c5] flex flex-col justify-center px-1.5 gap-0.5">
                  <div className="w-16 h-0.5 bg-[#c4c7c5] rounded" />
                  <div className="w-14 h-0.5 bg-[#c4c7c5] rounded" />
                  <div className="w-15 h-0.5 bg-[#c4c7c5] rounded" />
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-[#c4c7c5]/40" />

          {/* Section: Theme */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#444746] tracking-wide uppercase">
                Theme
              </span>
              <button
                onClick={() => setIsViewAllModalOpen(true)}
                className="text-xs font-semibold text-[#0b57d0] hover:underline"
              >
                View all
              </button>
            </div>

            {/* 4x2 Thumbnails Grid (strictly 8 themes) */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_THEMES.slice(0, 8).map((theme) => {
                const isSelected = activeThemeId === theme.id;

                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme)}
                    title={theme.name}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all group ${
                      isSelected
                        ? 'border-[#0b57d0] shadow-md ring-2 ring-[#0b57d0]/20'
                        : 'border-transparent hover:border-[#747775]'
                    }`}
                  >
                    {theme.id === 'default' ? (
                      <div className="w-full h-full bg-[#f6f8fc] flex flex-col justify-between p-1">
                        <div className="flex items-center gap-0.5">
                          <div className="w-2 h-2 rounded-xs bg-[#ea4335]" />
                          <div className="w-4 h-1 bg-[#c4c7c5] rounded-xs" />
                        </div>
                        <div className="w-4 h-2 rounded-xs bg-[#c2e7ff] self-center" />
                        <div className="w-full h-1 bg-[#e0e2ec] rounded-xs" />
                      </div>
                    ) : theme.type === 'color' ? (
                      <div
                        style={{ background: theme.backgroundStyle }}
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={theme.previewUrl}
                        alt={theme.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    )}

                    {isSelected && (
                      <div className="absolute inset-0 bg-[#0b57d0]/10 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#0b57d0] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#c4c7c5]/40" />

          {/* Section: Graph Visualization Format (Static Setting for actual metrics - Placed Below Theme) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#444746] tracking-wide uppercase">
              Graph Visualization Format
            </span>
            <div className="space-y-1.5">
              <label className="flex items-center p-2 rounded-xl hover:bg-black/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#0b57d0] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0b57d0]" />
                  </div>
                  <span className="text-sm font-medium text-[#1f1f1f]">
                    Smooth Area Curve
                  </span>
                </div>
              </label>
              <label className="flex items-center p-2 rounded-xl hover:bg-black/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#747775] flex items-center justify-center" />
                  <span className="text-sm font-medium text-[#1f1f1f]">
                    Vertical Bar Histogram
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* "View all" Theme Picker Modal */}
      {isViewAllModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsViewAllModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-[#c4c7c5] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e0e2ec] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1f1f1f]">
                  Pick your theme
                </h3>
                <p className="text-xs text-[#5e5e5e]">
                  Select a wallpaper background or upload a custom image from your PC
                </p>
              </div>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-[#444746]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Upload Card for Custom Wallpaper from PC */}
              <div className="border-2 border-dashed border-[#0b57d0]/60 rounded-2xl p-6 bg-[#f0f4f9] hover:bg-[#e8f0fe] transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-[#d3e3fd] text-[#0b57d0] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#041e49]">
                  Browse & Select Wallpaper from your PC
                </h4>
                <p className="text-xs text-[#5e5e5e] max-w-xs mt-1">
                  Choose any JPEG, PNG, or WebP photo from your computer to set as your custom desktop theme
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-5 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Choose Image File
                </button>
              </div>

              {/* Gallery of Presets */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#444746] uppercase tracking-wider">
                  Featured Themes
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {PRESET_THEMES.map((theme) => {
                    const isSelected = activeThemeId === theme.id;

                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onSelectTheme(theme);
                          setIsViewAllModalOpen(false);
                        }}
                        className={`aspect-[16/10] rounded-xl overflow-hidden relative border-2 transition-all ${
                          isSelected
                            ? 'border-[#0b57d0] ring-2 ring-[#0b57d0]/30'
                            : 'border-transparent hover:border-[#747775]'
                        }`}
                      >
                        {theme.id === 'default' ? (
                          <div className="w-full h-full bg-[#f6f8fc] flex items-center justify-center p-2 text-xs font-bold text-[#444746]">
                            Light Default
                          </div>
                        ) : theme.type === 'color' ? (
                          <div
                            style={{ background: theme.backgroundStyle }}
                            className="w-full h-full"
                          />
                        ) : (
                          <img
                            src={theme.previewUrl}
                            alt={theme.name}
                            className="w-full h-full object-cover"
                          />
                        )}

                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[11px] py-1 px-2 text-center truncate">
                          {theme.name}
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0b57d0] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#e0e2ec] flex justify-end">
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#0b57d0] text-white text-sm font-medium hover:bg-[#0842a0]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
