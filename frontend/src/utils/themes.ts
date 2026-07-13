// Theme Configuration System
export const themes = {
  default: {
    name: 'Indigo',
    id: 'default',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
    },
  },
  ocean: {
    name: 'Ocean',
    id: 'ocean',
    colors: {
      primary: '#00d4ff',
      secondary: '#00e5ff',
      accent: '#0fb9db',
    },
  },
  forest: {
    name: 'Forest',
    id: 'forest',
    colors: {
      primary: '#20d9a3',
      secondary: '#13c68c',
      accent: '#2de0a5',
    },
  },
  sunset: {
    name: 'Sunset',
    id: 'sunset',
    colors: {
      primary: '#ff6b4a',
      secondary: '#ff8866',
      accent: '#ff9933',
    },
  },
  mint: {
    name: 'Mint',
    id: 'mint',
    colors: {
      primary: '#00e5a0',
      secondary: '#00d4a0',
      accent: '#2df5b5',
    },
  },
  neon: {
    name: 'Neon',
    id: 'neon',
    colors: {
      primary: '#ff00ff',
      secondary: '#ff33ff',
      accent: '#ff66ff',
    },
  },
};

// Layout variants
export const layoutVariants = {
  default: 'Default',
  compact: 'Compact',
  spacious: 'Spacious',
  minimal: 'Minimal',
};

// Card styles
export const cardStyles = {
  default: 'card',
  glass: 'card-glass',
  gradient: 'card-gradient',
  neon: 'card-neon',
  minimal: 'card-minimal',
};

// Button styles
export const buttonStyles = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  text: 'btn-text',
};

// Texture options
export const textures = {
  none: '',
  noise: 'texture-noise',
  grid: 'texture-grid',
  dots: 'texture-dots',
  stripes: 'texture-stripes',
};

// Alignment options
export const alignments = {
  'center': 'align-center',
  'center-h': 'align-center-h',
  'center-v': 'align-center-v',
  'between': 'align-between',
  'around': 'align-around',
};

// Theme Manager Hook
export function useTheme() {
  const getTheme = () => {
    const stored = localStorage.getItem('theme');
    return stored || 'default';
  };

  const setTheme = (themeId) => {
    localStorage.setItem('theme', themeId);
    if (themeId === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeId);
    }
  };

  const initTheme = () => {
    const theme = getTheme();
    if (theme !== 'default') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  return { getTheme, setTheme, initTheme };
}

// Design Preset Combinations
export const designPresets = {
  modern: {
    name: 'Modern',
    cardStyle: 'card-glass',
    buttonStyle: 'btn-primary',
    texture: 'texture-noise',
    layout: 'default',
  },
  minimal: {
    name: 'Minimal',
    cardStyle: 'card-minimal',
    buttonStyle: 'btn-ghost',
    texture: '',
    layout: 'minimal',
  },
  vibrant: {
    name: 'Vibrant',
    cardStyle: 'card-neon',
    buttonStyle: 'btn-primary',
    texture: 'texture-grid',
    layout: 'spacious',
  },
  elegant: {
    name: 'Elegant',
    cardStyle: 'card-gradient',
    buttonStyle: 'btn-secondary',
    texture: 'texture-dots',
    layout: 'default',
  },
  neo: {
    name: 'Neo',
    cardStyle: 'card-neon',
    buttonStyle: 'btn-outline',
    texture: 'texture-stripes',
    layout: 'compact',
  },
};

// Color palettes for different design contexts
export const colorPalettes = {
  status: {
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
  },
  priorities: {
    low: '#34d399',
    medium: '#fbbf24',
    high: '#fb923c',
    urgent: '#f87171',
  },
  semanticBg: {
    success: 'rgba(16, 185, 129, 0.14)',
    error: 'rgba(239, 68, 68, 0.14)',
    warning: 'rgba(245, 158, 11, 0.14)',
    info: 'rgba(59, 130, 246, 0.14)',
  },
};

// Typography scales
export const typography = {
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Spacing scale
export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
};

// Border radius options
export const borderRadius = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '1.75rem',
  full: '999px',
};

// Shadow options
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
};

export default {
  themes,
  layoutVariants,
  cardStyles,
  buttonStyles,
  textures,
  alignments,
  useTheme,
  designPresets,
  colorPalettes,
  typography,
  spacing,
  borderRadius,
  shadows,
};
