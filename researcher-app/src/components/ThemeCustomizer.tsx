import React, { useState } from 'react';
import { X, Palette, Plus, Trash2, RotateCcw, Sun, Moon } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { ThemeConfig, ThemePresetName, GradientStop } from '../types';
import { themePresets, defaultTheme } from '../utils/storage';

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-medium flex-1 truncate" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>{label}</label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 appearance-none bg-transparent"
          style={{ WebkitAppearance: 'none' }}
        />
        <div className="absolute inset-0 rounded-lg border pointer-events-none" style={{ borderColor: 'var(--theme-primary)', opacity: 0.2 }} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[72px] px-2 py-1 text-[11px] font-mono rounded-lg border"
        style={{
          backgroundColor: `color-mix(in srgb, var(--theme-panel) 80%, transparent)`,
          borderColor: `color-mix(in srgb, var(--theme-text) 10%, transparent)`,
          color: 'var(--theme-text)',
        }}
      />
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-medium flex-1 truncate" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-20 accent-[var(--theme-primary)]"
      />
      <span className="text-[10px] font-mono w-10 text-right" style={{ color: 'var(--theme-text)', opacity: 0.5 }}>
        {value}{suffix}
      </span>
    </div>
  );
}

export default function ThemeCustomizer() {
  const { state, dispatch } = useResearch();
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'background'>('presets');

  if (!state.themeCustomizerOpen) return null;

  const theme = state.preferences.theme;

  const updateTheme = (partial: Partial<ThemeConfig>) => {
    dispatch({ type: 'SET_THEME', payload: { ...theme, ...partial } });
  };

  const updateGradient = (partial: Partial<ThemeConfig['backgroundGradient']>) => {
    updateTheme({ backgroundGradient: { ...theme.backgroundGradient, ...partial } });
  };

  const updateGradientStop = (index: number, partial: Partial<GradientStop>) => {
    const stops = [...theme.backgroundGradient.stops];
    stops[index] = { ...stops[index], ...partial };
    updateGradient({ stops });
  };

  const addGradientStop = () => {
    const stops = [...theme.backgroundGradient.stops];
    const lastPos = stops[stops.length - 1]?.position || 0;
    stops.push({ color: theme.primaryColor, position: Math.min(lastPos + 20, 100) });
    updateGradient({ stops });
  };

  const removeGradientStop = (index: number) => {
    if (theme.backgroundGradient.stops.length <= 2) return;
    const stops = theme.backgroundGradient.stops.filter((_, i) => i !== index);
    updateGradient({ stops });
  };

  const presetEntries = Object.entries(themePresets) as [ThemePresetName, typeof themePresets[ThemePresetName]][];

  const tabStyle = (active: boolean) => ({
    background: active ? 'var(--theme-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--theme-text)',
    opacity: active ? 1 : 0.5,
  });

  return (
    <div
      className="fixed inset-y-0 right-0 w-[320px] z-50 shadow-2xl flex flex-col overflow-hidden"
      style={{
        background: `color-mix(in srgb, var(--theme-panel) 95%, transparent)`,
        backdropFilter: 'blur(20px)',
        borderLeft: `1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)`,
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)` }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, var(--theme-primary), var(--theme-accent))` }}
          >
            <Palette size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>Theme</h2>
            <p className="text-[10px] font-medium" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>Customize appearance</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--theme-text)', opacity: 0.5 }}
            title="Toggle dark mode"
          >
            {state.preferences.darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => {
              dispatch({ type: 'SET_THEME', payload: defaultTheme });
              dispatch({ type: 'SET_THEME_PRESET', payload: 'default' });
            }}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--theme-text)', opacity: 0.5 }}
            title="Reset to default"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME_CUSTOMIZER' })}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--theme-text)', opacity: 0.5 }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 pb-1 flex gap-1">
        {(['presets', 'colors', 'background'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
            style={tabStyle(activeTab === tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 gap-2">
            {presetEntries.map(([name, preset]) => {
              const isActive = state.preferences.themePreset === name;
              const g = preset.theme.backgroundGradient;
              const bgStyle = g.enabled
                ? `linear-gradient(${g.angle}deg, ${g.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                : preset.theme.backgroundColor;
              return (
                <button
                  key={name}
                  onClick={() => dispatch({ type: 'SET_THEME_PRESET', payload: name })}
                  className="relative rounded-xl overflow-hidden h-20 transition-all group"
                  style={{
                    border: isActive ? `2px solid var(--theme-primary)` : `1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)`,
                    boxShadow: isActive ? `0 0 0 3px color-mix(in srgb, ${preset.theme.primaryColor} 20%, transparent)` : 'none',
                  }}
                >
                  <div className="absolute inset-0" style={{ background: bgStyle }} />
                  <div className="absolute inset-0 flex items-end p-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: preset.theme.primaryColor }} />
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: preset.theme.accentColor }} />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{
                      backgroundColor: `color-mix(in srgb, ${preset.theme.panelColor} 80%, transparent)`,
                      color: preset.theme.textColor,
                    }}>
                      {preset.label}
                    </span>
                  </div>
                  {preset.darkMode && (
                    <div className="absolute top-2 right-2">
                      <Moon size={10} style={{ color: preset.theme.textColor, opacity: 0.5 }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
                Brand Colors
              </p>
              <ColorInput label="Primary" value={theme.primaryColor} onChange={(v) => updateTheme({ primaryColor: v })} />
              <ColorInput label="Accent" value={theme.accentColor} onChange={(v) => updateTheme({ accentColor: v })} />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
                Surface Colors
              </p>
              <ColorInput label="Panel" value={theme.panelColor} onChange={(v) => updateTheme({ panelColor: v })} />
              <ColorInput label="Text" value={theme.textColor} onChange={(v) => updateTheme({ textColor: v })} />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
                Style
              </p>
              <SliderInput label="Panel Opacity" value={theme.panelOpacity} onChange={(v) => updateTheme({ panelOpacity: v })} min={0.1} max={1} step={0.05} />
              <SliderInput label="Border Radius" value={theme.borderRadius} onChange={(v) => updateTheme({ borderRadius: v })} min={0} max={32} step={2} suffix="px" />
            </div>

            {/* Live preview swatch */}
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)` }}>
              <div className="p-3 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}>
                <span className="text-white text-[11px] font-semibold">Preview</span>
              </div>
              <div className="p-3" style={{ backgroundColor: `color-mix(in srgb, ${theme.panelColor} ${theme.panelOpacity * 100}%, transparent)` }}>
                <p className="text-[11px]" style={{ color: theme.textColor }}>Sample panel content</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'background' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
                Background
              </p>
              <ColorInput label="Base Color" value={theme.backgroundColor} onChange={(v) => updateTheme({ backgroundColor: v })} />

              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>
                  Enable Gradient
                </label>
                <button
                  onClick={() => updateGradient({ enabled: !theme.backgroundGradient.enabled })}
                  className="w-10 h-5 rounded-full relative transition-colors"
                  style={{
                    backgroundColor: theme.backgroundGradient.enabled
                      ? 'var(--theme-primary)'
                      : `color-mix(in srgb, var(--theme-text) 20%, transparent)`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
                    style={{ left: theme.backgroundGradient.enabled ? '22px' : '2px' }}
                  />
                </button>
              </div>
            </div>

            {theme.backgroundGradient.enabled && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
                  Gradient Settings
                </p>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium flex-1" style={{ color: 'var(--theme-text)', opacity: 0.6 }}>Type</label>
                  <div className="flex gap-1 rounded-lg p-0.5" style={{ backgroundColor: `color-mix(in srgb, var(--theme-text) 8%, transparent)` }}>
                    {(['linear', 'radial'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => updateGradient({ type })}
                        className="px-3 py-1 rounded-md text-[10px] font-semibold capitalize transition-all"
                        style={tabStyle(theme.backgroundGradient.type === type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {theme.backgroundGradient.type === 'linear' && (
                  <SliderInput
                    label="Angle"
                    value={theme.backgroundGradient.angle}
                    onChange={(v) => updateGradient({ angle: v })}
                    min={0} max={360} step={5} suffix="deg"
                  />
                )}

                {/* Gradient preview */}
                <div
                  className="h-12 rounded-xl"
                  style={{
                    background: theme.backgroundGradient.type === 'radial'
                      ? `radial-gradient(ellipse at center, ${theme.backgroundGradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                      : `linear-gradient(${theme.backgroundGradient.angle}deg, ${theme.backgroundGradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
                    border: `1px solid color-mix(in srgb, var(--theme-text) 10%, transparent)`,
                  }}
                />

                {/* Gradient stops */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>
                      Color Stops
                    </p>
                    <button
                      onClick={addGradientStop}
                      className="p-1 rounded-md transition-colors"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  {theme.backgroundGradient.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => updateGradientStop(i, { color: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) => updateGradientStop(i, { color: e.target.value })}
                        className="w-[68px] px-2 py-1 text-[10px] font-mono rounded-lg border"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--theme-panel) 80%, transparent)`,
                          borderColor: `color-mix(in srgb, var(--theme-text) 10%, transparent)`,
                          color: 'var(--theme-text)',
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) => updateGradientStop(i, { position: parseInt(e.target.value) })}
                        className="flex-1 accent-[var(--theme-primary)]"
                      />
                      <span className="text-[9px] font-mono w-7 text-right" style={{ color: 'var(--theme-text)', opacity: 0.4 }}>{stop.position}%</span>
                      {theme.backgroundGradient.stops.length > 2 && (
                        <button
                          onClick={() => removeGradientStop(i)}
                          className="p-0.5 rounded text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
