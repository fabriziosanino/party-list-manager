import { StyleSheet } from 'react-native';

export const colors = {
  // Nuova palette personalizzata (tonalità scure eleganti)
  primary: '#AF9BB6',        // Lavanda chiaro - colore principale
  primaryLight: '#84596B',   // Rosa-viola medio
  secondary: '#603A40',      // Marrone-rosa scuro
  accent: '#440D0F',         // Rosso molto scuro
  tertiary: '#191716',       // Nero-grigio (il più scuro)
  
  // Colori funzionali usando la nuova palette
  success: '#84596B',        // Rosa-viola per successo
  danger: '#440D0F',         // Rosso molto scuro per errori
  warning: '#603A40',        // Marrone-rosa per avvisi
  info: '#AF9BB6',          // Lavanda per info
  
  // Scala di grigi personalizzata basata sulla palette
  gray: {
    50: '#ffffff',           // Bianco puro
    100: '#f7f6f6',          // Bianco sporco con tinta rosa
    200: '#ede9ea',          // Grigio chiarissimo con tinta rosa
    300: '#d8d0d3',          // Grigio chiaro con tinta rosa
    400: '#c4b5bb',          // Mix più chiaro della palette
    500: '#AF9BB6',          // Lavanda chiaro (dalla palette)
    600: '#84596B',          // Rosa-viola medio (dalla palette)
    700: '#603A40',          // Marrone-rosa scuro (dalla palette)
    800: '#440D0F',          // Rosso molto scuro (dalla palette)
    900: '#2d0c0d',          // Versione più scura del rosso
    950: '#191716',          // Nero-grigio (dalla palette)
  },
  
  // Colori base
  white: '#ffffff',
  black: '#000000',
  
  // Colori specifici per l'app
  background: {
    primary: '#f7f6f6',      // Sfondo principale (bianco con tinta rosa)
    secondary: '#ffffff',    // Sfondo secondario (bianco puro)
    card: '#ffffff',         // Sfondo delle card
    header: '#191716',       // Sfondo header (nero-grigio)
    footer: '#f7f6f6',       // Sfondo footer
  },
  
  // Colori del testo ottimizzati per contrasto
  text: {
    primary: '#191716',      // Testo principale (nero-grigio)
    secondary: '#440D0F',    // Testo secondario (rosso molto scuro)
    muted: '#603A40',        // Testo disattivato (marrone-rosa)
    inverse: '#ffffff',      // Testo su sfondo scuro (bianco)
    accent: '#84596B',       // Testo di accento (rosa-viola)
  },
  
  // Bordi
  border: {
    light: '#ede9ea',       // Bordi chiari (grigio con tinta rosa)
    medium: '#d8d0d3',      // Bordi medi
    dark: '#c4b5bb',        // Bordi scuri
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.card,
  },
  header: {
    backgroundColor: colors.background.header,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    paddingTop: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    backgroundColor: colors.background.card,
    color: colors.text.primary,
  },
  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textSuccess: {
    color: colors.success,
  },
  textDanger: {
    color: colors.danger,
  },
  textWarning: {
    color: colors.warning,
  },
});