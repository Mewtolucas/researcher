import React, { useState, useEffect } from 'react';
import { X, Palette, Plus, Trash2, RotateCcw, Sun, Moon, Check } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { ThemeConfig, ThemePresetName, GradientStop } from '../types';
import { themePresets, defaultTheme } from '../utils/storage';

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-medium flex-1 truncate opacity-60">{label}</label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[72px] px-2 py-1 text-[11px] font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
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
      <label className="text-[11px] font-medium flex-1 truncate opacity-60">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-20"
      />
      <span className="text-[10px] font-mono w-10 text-right opacity-50">
        {value}{suffix}
      </span>
    </div>
  );
}

export default function ThemeCustomizer() {
  const { state, dispatch } = useResearch();
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'background'>('presets');

  // Local draft state for colors/background tabs
  const [draft, setDraft] = useState<ThemeConfig>(state.preferences.theme);
  const [hasChanges, setHasChanges] = useState(false);
  const [applied, setApplied] = useState(false);

  // Sync draft when theme changes externally (e.g. preset selected)
  useEffect(() => {
    setDraft(state.preferences.theme);
    setHasChanges(false);
  }, [state.preferences.theme]);

  if (!state.themeCustomizerOpen) return null;

  const updateDraft = (partial: Partial<ThemeConfig>) => {
    setDraft(prev => ({ ...prev, ...partial }));
    setHasChanges(true);
    setApplied(false);
  };

  const updateDraftGradient = (partial: Partial<ThemeConfig['backgroundGradient']>) => {
    setDraft(prev => ({ ...prev, backgroundGradient: { ...prev.backgroundGradient, ...partial } }));
    setHasChanges(true);
    setApplied(false);
  };

  const updateDraftGradientStop = (index: number, partial: Partial<GradientStop>) => {
    setDraft(prev => {
      const stops = [...prev.backgroundGradient.stops];
      stops[index] = { ...stops[index], ...partial };
      return { ...prev, backgroundGradient: { ...prev.backgroundGradient, stops } };
    });
    setHasChanges(true);
    setApplied(false);
  };

  const addGradientStop = () => {
    setDraft(prev => {
      const stops = [...prev.backgroundGradient.stops];
      const lastPos = stops[stops.length - 1]?.position || 0;
      stops.push({ color: prev.primaryColor, position: Math.min(lastPos + 20, 100) });
      return { ...prev, backgroundGradient: { ...prev.backgroundGradient, stops } };
    });
    setHasChanges(true);
    setApplied(false);
  };

  const removeGradientStop = (index: number) => {
    if (draft.backgroundGradient.stops.length <= 2) return;
    setDraft(prev => {
      const stops = prev.backgroundGradient.stops.filter((_, i) => i !== index);
      return { ...prev, backgroundGradient: { ...prev.backgroundGradient, stops } };
    });
    setHasChanges(true);
    setApplied(false);
  };

  const applyTheme = () => {
    dispatch({ type: 'SET_THEME', payload: draft });
    setHasChanges(false);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const resetTheme = () => {
    dispatch({ type: 'SET_THEME_PRESET', payload: 'default' });
    setDraft(defaultTheme);
    setHasChanges(false);
  };

  const presetEntries = Object.entries(themePresets) as [ThemePresetName, typeof themePresets[ThemePresetName]][];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: active ? state.preferences.theme.primaryColor : 'transparent',
    color: active ? '#fff' : undefined,
    opacity: active ? 1 : 0.5,
  });

  // Build gradient preview from draft
  const draftGradientCSS = draft.backgroundGradient.enabled
    ? (draft.backgroundGradient.type === 'radial'
      ? `radial-gradient(ellipse at center, ${draft.backgroundGradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
      : `linear-gradient(${draft.backgroundGradient.angle}deg, ${draft.backgroundGradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`)
    : draft.backgroundColor;

  return (
    <div
      className="fixed inset-y-0 right-0 w-[320px] z-50 shadow-2xl flex flex-col overflow-hidden border-l border-gray-200 dark:border-gray-800"
      style={{ backgroundColor: state.preferences.darkMode ? '#0f172a' : '#ffffff' }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${state.preferences.theme.primaryColor}, ${state.preferences.theme.accentColor})` }}
          >
            <Palette size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Theme</h2>
            <p className="text-[10px] font-medium opacity-40">Customize appearance</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-50 hover:opacity-100"
            title="Toggle dark mode"
          >
            {state.preferences.darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={resetTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-50 hover:opacity-100"
            title="Reset to default"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME_CUSTOMIZER' })}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-50 hover:opacity-100"
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
                    border: isActive ? `2px solid ${preset.theme.primaryColor}` : `1px solid ${state.preferences.darkMode ? '#334155' : '#e2e8f0'}`,
                    boxShadow: isActive ? `0 0 0 3px ${preset.theme.primaryColor}33` : 'none',
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
                      backgroundColor: `${preset.theme.panelColor}cc`,
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
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Brand Colors</p>
              <ColorInput label="Primary" value={draft.primaryColor} onChange={(v) => updateDraft({ primaryColor: v })} />
              <ColorInput label="Accent" value={draft.accentColor} onChange={(v) => updateDraft({ accentColor: v })} />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Surface Colors</p>
              <ColorInput label="Panel" value={draft.panelColor} onChange={(v) => updateDraft({ panelColor: v })} />
              <ColorInput label="Text" value={draft.textColor} onChange={(v) => updateDraft({ textColor: v })} />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Style</p>
              <SliderInput label="Panel Opacity" value={draft.panelOpacity} onChange={(v) => updateDraft({ panelOpacity: v })} min={0.1} max={1} step={0.05} />
              <SliderInput label="Border Radius" value={draft.borderRadius} onChange={(v) => updateDraft({ borderRadius: v })} min={0} max={32} step={2} suffix="px" />
            </div>

            {/* Live preview swatch */}
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-3 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${draft.primaryColor}, ${draft.accentColor})` }}>
                <span className="text-white text-[11px] font-semibold">Preview</span>
              </div>
              <div className="p-3" style={{ backgroundColor: draft.panelColor, opacity: draft.panelOpacity }}>
                <p className="text-[11px]" style={{ color: draft.textColor }}>Sample panel text</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'background' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Background</p>
              <ColorInput label="Base Color" value={draft.backgroundColor} onChange={(v) => updateDraft({ backgroundColor: v })} />

              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium opacity-60">Enable Gradient</label>
                <button
                  onClick={() => updateDraftGradient({ enabled: !draft.backgroundGradient.enabled })}
                  className="w-10 h-5 rounded-full relative transition-colors"
                  style={{
                    backgroundColor: draft.backgroundGradient.enabled ? state.preferences.theme.primaryColor : '#94a3b8',
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
                    style={{ left: draft.backgroundGradient.enabled ? '22px' : '2px' }}
                  />
                </button>
              </div>
            </div>

            {draft.backgroundGradient.enabled && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Gradient Settings</p>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium flex-1 opacity-60">Type</label>
                  <div className="flex gap-1 rounded-lg p-0.5 bg-gray-100 dark:bg-gray-800">
                    {(['linear', 'radial'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => updateDraftGradient({ type })}
                        className="px-3 py-1 rounded-md text-[10px] font-semibold capitalize transition-all"
                        style={draft.backgroundGradient.type === type
                          ? { background: state.preferences.theme.primaryColor, color: '#fff' }
                          : { opacity: 0.5 }
                        }
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {draft.backgroundGradient.type === 'linear' && (
                  <SliderInput
                    label="Angle"
                    value={draft.backgroundGradient.angle}
                    onChange={(v) => updateDraftGradient({ angle: v })}
                    min={0} max={360} step={5} suffix="deg"
                  />
                )}

                {/* Gradient preview */}
                <div
                  className="h-12 rounded-xl border border-gray-200 dark:border-gray-700"
                  style={{ background: draftGradientCSS }}
                />

                {/* Gradient stops */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Color Stops</p>
                    <button
                      onClick={addGradientStop}
                      className="p-1 rounded-md transition-colors"
                      style={{ color: state.preferences.theme.primaryColor }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  {draft.backgroundGradient.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => updateDraftGradientStop(i, { color: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) => updateDraftGradientStop(i, { color: e.target.value })}
                        className="w-[68px] px-2 py-1 text-[10px] font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) => updateDraftGradientStop(i, { position: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-[9px] font-mono w-7 text-right opacity-40">{stop.position}%</span>
                      {draft.backgroundGradient.stops.length > 2 && (
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

      {/* Apply Button - shown for colors and background tabs when there are changes */}
      {(activeTab === 'colors' || activeTab === 'background') && (
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={applyTheme}
            disabled={!hasChanges && !applied}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
            style={{
              background: applied
                ? '#22c55e'
                : hasChanges
                  ? `linear-gradient(to right, ${draft.primaryColor}, ${draft.accentColor})`
                  : '#94a3b8',
              boxShadow: hasChanges ? `0 4px 15px ${draft.primaryColor}40` : 'none',
            }}
          >
            {applied ? (
              <>
                <Check size={16} />
                Applied!
              </>
            ) : (
              <>
                <Palette size={16} />
                Apply Theme
              </>
            )}
          </button>
          {hasChanges && (
            <p className="text-[10px] text-center mt-2 opacity-40 font-medium">
              Changes will be applied when you click the button
            </p>
          )}
        </div>
      )}
    </div>
  );
}
