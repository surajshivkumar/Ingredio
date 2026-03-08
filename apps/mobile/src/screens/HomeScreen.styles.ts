import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  slimeWipe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '110%', // slightly larger to prevent edge gaps during the bounce
    backgroundColor: '#1E4620', // deep rich dark green complimenting the brand logo
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 999,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 360,
    height: 360,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1E4620', // Dark slime green
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#1E4620', // Dark slime green
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 20,
    
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  landingMascot: {
    width: 220,
    height: 220,
    marginBottom: -10,
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF', // High contrast white
    letterSpacing: 2,
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF', // White button pops brilliantly on dark
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonText: {
    color: '#1E4620', // Match text to background for perfect harmony
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#4CA456', // A bright neon/lime-green subtle border
  },
  secondaryButtonText: {
    color: '#FFFFFF', // White text
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 14,
    color: '#8BCC92', // Faint muted green
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
