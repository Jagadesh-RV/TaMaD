import { useTheme } from '../../hooks/useTheme';
import { type Theme as LandingTheme, getStoredTheme, applyTheme } from '../../lib/theme';

export type { LandingTheme };

export const getInitialTheme = getStoredTheme;

export const applyLandingTheme = applyTheme;

export const useLandingTheme = useTheme;
