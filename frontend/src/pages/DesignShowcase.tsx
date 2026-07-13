import React, { useState } from 'react';
import { Palette, Grid3X3, Type, Zap } from 'lucide-react';
import { cardStyles, buttonStyles, textures, themes, designPresets } from '../utils/themes';

export default function DesignShowcase() {
  const [selectedSection, setSelectedSection] = useState('colors');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Design System Showcase</h1>
        <p className="text-slate-400">Explore all available design components, themes, and variations</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 border-b border-white/10 pb-6 overflow-x-auto">
        {[
          { id: 'colors', label: 'Color Themes', icon: Palette },
          { id: 'cards', label: 'Card Styles', icon: Grid3X3 },
          { id: 'buttons', label: 'Buttons', icon: Zap },
          { id: 'textures', label: 'Textures', icon: Type },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              selectedSection === id
                ? 'bg-brand text-white'
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Color Themes Section */}
      {selectedSection === 'colors' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Color Themes</h2>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(themes).map((theme) => (
              <div
                key={theme.id}
                data-theme={theme.id === 'default' ? '' : theme.id}
                className="card-glass p-6 rounded-2xl space-y-4"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">{theme.name}</h3>
                  <p className="text-sm text-slate-500">Theme ID: {theme.id}</p>
                </div>

                {/* Color Swatches */}
                <div className="space-y-3">
                  {Object.entries(theme.colors).map(([colorName, colorValue]) => (
                    <div key={colorName} className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-white/10"
                        style={{ backgroundColor: colorValue }}
                      />
                      <div>
                        <p className="text-sm font-medium text-white capitalize">{colorName}</p>
                        <p className="text-xs text-slate-500">{colorValue}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview Buttons */}
                <div className="pt-4 border-t border-white/10 flex gap-2">
                  <button className="flex-1 btn-primary text-sm">Primary</button>
                  <button className="flex-1 btn-ghost text-sm">Ghost</button>
                </div>
              </div>
            ))}
          </div>

          {/* Color Palette Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="card p-6 rounded-2xl">
              <h4 className="font-semibold text-white mb-4">Status Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg" />
                  <span className="text-sm text-slate-300">Success - #34d399</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg" />
                  <span className="text-sm text-slate-300">Error - #f87171</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg" />
                  <span className="text-sm text-slate-300">Warning - #fbbf24</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg" />
                  <span className="text-sm text-slate-300">Info - #60a5fa</span>
                </div>
              </div>
            </div>

            <div className="card p-6 rounded-2xl">
              <h4 className="font-semibold text-white mb-4">Priority Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg" />
                  <span className="text-sm text-slate-300">Low</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg" />
                  <span className="text-sm text-slate-300">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg" />
                  <span className="text-sm text-slate-300">High</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg" />
                  <span className="text-sm text-slate-300">Urgent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Styles Section */}
      {selectedSection === 'cards' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Card Styles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(cardStyles).map(([key, className]) => (
              <div key={key} className="space-y-3">
                <p className="text-sm font-semibold text-slate-400">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <div className={`${className} p-6 rounded-xl`}>
                  <h4 className="text-lg font-semibold text-white mb-2">Card Example</h4>
                  <p className="text-slate-400 mb-4">
                    This is a {key} card style with default content.
                  </p>
                  <div className="flex gap-2">
                    <span className="badge">Tag</span>
                    <span className="status-pill">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Card Variations Grid */}
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-semibold text-white">Card Combinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Minimal + Compact */}
              <div className="card-minimal p-4 rounded-xl border border-white/5">
                <p className="text-xs text-slate-500 mb-2">MINIMAL</p>
                <h4 className="font-semibold text-white">Minimal Design</h4>
                <p className="text-sm text-slate-400 mt-1">Clean and simple</p>
              </div>

              {/* Gradient + Bold */}
              <div className="card-gradient p-4 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">GRADIENT</p>
                <h4 className="font-semibold text-white">Gradient Design</h4>
                <p className="text-sm text-slate-400 mt-1">Modern appearance</p>
              </div>

              {/* Neon + Vibrant */}
              <div className="card-neon p-4 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">NEON</p>
                <h4 className="font-semibold text-white">Neon Design</h4>
                <p className="text-sm text-slate-400 mt-1">Vibrant and bold</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button Styles Section */}
      {selectedSection === 'buttons' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Button Styles</h2>

          {/* Button Types */}
          <div className="space-y-6">
            {Object.entries(buttonStyles).map(([key, className]) => (
              <div key={key} className="space-y-3">
                <p className="text-sm font-semibold text-slate-400 capitalize">{key} Button</p>
                <div className="flex flex-wrap gap-3">
                  <button className={className}>Button</button>
                  <button className={className}>With Icon</button>
                  <button className={className} disabled>Disabled</button>
                  <button className={`${className} text-sm`}>Small</button>
                  <button className={`${className} px-6 py-3`}>Large</button>
                </div>
              </div>
            ))}
          </div>

          {/* Button States */}
          <div className="card p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold text-white">Button States</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Default</p>
                <button className="btn-primary w-full">Hover</button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Disabled</p>
                <button className="btn-primary w-full" disabled>Disabled</button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Ghost</p>
                <button className="btn-ghost w-full">Ghost</button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Outline</p>
                <button className="btn-outline w-full">Outline</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Textures Section */}
      {selectedSection === 'textures' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Textures & Patterns</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(textures).map(([key, className]) => (
              <div
                key={key}
                className={`${className} card p-8 rounded-2xl min-h-48 flex flex-col justify-between`}
              >
                <div>
                  <h4 className="text-lg font-semibold text-white capitalize">{key}</h4>
                  <p className="text-sm text-slate-400 mt-1">Texture pattern demo</p>
                </div>
                <div className="text-xs text-slate-500">{className || 'No texture class'}</div>
              </div>
            ))}
          </div>

          {/* Layout Alignments */}
          <div className="space-y-4 mt-12">
            <h3 className="text-xl font-semibold text-white">Layout Alignments</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 rounded-2xl h-48 align-center border-2 border-brand/50">
                <p className="text-white font-semibold">Centered (both axes)</p>
              </div>

              <div className="card p-6 rounded-2xl h-48 align-between border-2 border-brand/50">
                <p className="text-white font-semibold">Space Between</p>
                <p className="text-slate-400">Right aligned</p>
              </div>

              <div className="card p-6 rounded-2xl h-48 align-around border-2 border-brand/50">
                <p className="text-white font-semibold">Item 1</p>
                <p className="text-white font-semibold">Item 2</p>
                <p className="text-white font-semibold">Item 3</p>
              </div>

              <div className="card p-6 rounded-2xl h-48 align-center-h border-2 border-brand/50">
                <p className="text-white font-semibold">Horizontal Center</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 rounded-2xl">
            <h4 className="font-semibold text-white mb-2">🎨 Themes</h4>
            <p className="text-sm text-slate-400">6 available color themes to personalize your interface</p>
          </div>
          <div className="card p-6 rounded-2xl">
            <h4 className="font-semibold text-white mb-2">✨ Components</h4>
            <p className="text-sm text-slate-400">Multiple card, button, and badge styles for variety</p>
          </div>
          <div className="card p-6 rounded-2xl">
            <h4 className="font-semibold text-white mb-2">🔄 Combinations</h4>
            <p className="text-sm text-slate-400">Mix and match designs to create unique experiences</p>
          </div>
        </div>
      </div>
    </div>
  );
}
