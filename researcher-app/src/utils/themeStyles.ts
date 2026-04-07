import { useMemo } from 'react';
import { useResearch } from '../context/ResearchContext';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * amount));
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * amount));
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function useThemeStyles() {
  const { state } = useResearch();
  const t = state.preferences.theme;
  const dark = state.preferences.darkMode;

  return useMemo(() => {
    const panelBg = hexToRgba(t.panelColor, t.panelOpacity);
    const borderColor = hexToRgba(t.textColor, 0.08);
    const borderColorStrong = hexToRgba(t.textColor, 0.15);
    const textMuted = hexToRgba(t.textColor, 0.5);
    const textFaint = hexToRgba(t.textColor, 0.35);
    const primaryBg = hexToRgba(t.primaryColor, 0.1);
    const primaryBorder = hexToRgba(t.primaryColor, 0.2);
    const gradient = `linear-gradient(135deg, ${t.primaryColor}, ${t.accentColor})`;
    const inputBg = dark ? darken(t.panelColor, 0.05) : lighten(t.panelColor, 0.03);
    const hoverBg = hexToRgba(t.textColor, 0.05);
    const radius = `${t.borderRadius}px`;

    const bgGradient = t.backgroundGradient.enabled
      ? (t.backgroundGradient.type === 'radial'
        ? `radial-gradient(ellipse at center, ${t.backgroundGradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
        : `linear-gradient(${t.backgroundGradient.angle}deg, ${t.backgroundGradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`)
      : t.backgroundColor;

    return {
      // Raw values
      primary: t.primaryColor,
      accent: t.accentColor,
      text: t.textColor,
      panel: t.panelColor,
      bg: t.backgroundColor,
      radius,
      gradient,

      // Computed
      panelBg,
      borderColor,
      borderColorStrong,
      textMuted,
      textFaint,
      primaryBg,
      primaryBorder,
      inputBg,
      hoverBg,
      bgGradient,

      // Common style objects
      appBackground: {
        background: bgGradient,
        color: t.textColor,
      } as React.CSSProperties,

      panelStyle: {
        background: panelBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: radius,
        border: `1px solid ${borderColor}`,
      } as React.CSSProperties,

      sidebarStyle: {
        background: panelBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRight: `1px solid ${borderColor}`,
      } as React.CSSProperties,

      inputStyle: {
        backgroundColor: inputBg,
        border: `1px solid ${borderColor}`,
        borderRadius: radius,
        color: t.textColor,
      } as React.CSSProperties,

      gradientButton: {
        background: gradient,
        color: '#ffffff',
        borderRadius: radius,
        boxShadow: `0 4px 15px ${hexToRgba(t.primaryColor, 0.3)}`,
      } as React.CSSProperties,

      gradientIcon: {
        background: gradient,
        boxShadow: `0 4px 12px ${hexToRgba(t.primaryColor, 0.25)}`,
      } as React.CSSProperties,

      activeChip: {
        background: primaryBg,
        border: `1px solid ${primaryBorder}`,
        color: t.primaryColor,
      } as React.CSSProperties,

      inactiveChip: {
        background: hexToRgba(t.textColor, 0.03),
        border: `1px solid ${borderColor}`,
        color: textMuted,
      } as React.CSSProperties,

      headerBorder: {
        borderBottom: `1px solid ${borderColor}`,
      } as React.CSSProperties,

      footerBorder: {
        borderTop: `1px solid ${borderColor}`,
      } as React.CSSProperties,
    };
  }, [t, dark]);
}
