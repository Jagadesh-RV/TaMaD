import React, { useState, useEffect } from 'react';
import { Palette, Layout, Square, Type } from 'lucide-react';
import { themes, layoutVariants, cardStyles, designPresets, textures } from '../utils/themes';

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [currentPreset, setCurrentPreset] = useState('modern');
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'default';
    setCurrentTheme(stored);
    document.documentElement.setAttribute('data-theme', stored === 'default' ? '' : stored);
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('theme', themeId);
    if (themeId === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeId);
    }
  };

  const handlePresetChange = (presetId) => {
    setCurrentPreset(presetId);
    localStorage.setItem('design-preset', presetId);
  };

  return (
    <>
      {/* Floating Theme Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-brand to-brand-light rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all z-40 hover:scale-110"
        title="Design Settings"
      >
        <Palette size={20} />
      </button>

      {/* Theme Panel */}
      {showPanel && (
        <div className="fixed bottom-24 right-6 bg-card border border-white/10 rounded-2xl p-6 shadow-2xl z-40 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Palette size={18} /> Design Settings
          </h3>

          {/* Themes */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Square size={16} /> Themes
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(themes).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`p-3 rounded-lg transition-all text-sm font-medium ${
                    currentTheme === theme.id
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mb-2 mx-auto"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Design Presets */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Type size={16} /> Design Presets
            </h4>
            <div className="space-y-2">
              {Object.entries(designPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key)}
                  className={`w-full p-3 rounded-lg transition-all text-sm text-left ${
                    currentPreset === key
                      ? 'bg-brand text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {preset.texture ? `${preset.texture.replace('texture-', '')} texture` : 'No texture'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500">
              Your preferences are saved locally. Select a theme and preset combination to customize your experience.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
