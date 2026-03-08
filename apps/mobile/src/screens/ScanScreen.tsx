import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Text, TouchableOpacity, Image } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

// A smooth bezier wave calculation
const waveHeight = 20;
const wavePath = `
  M 0 ${waveHeight}
  Q ${width / 4} 0, ${width / 2} ${waveHeight}
  T ${width} ${waveHeight}
  L ${width} ${height + waveHeight}
  L 0 ${height + waveHeight}
  Z
`;

export default function ScanScreen() {
  const [isRevealed, setIsRevealed] = useState(false);
  const waveAnim = useRef(new Animated.Value(height)).current; 

  const handleTriggerRender = () => {
    if (isRevealed) {
      // Reset
      Animated.timing(waveAnim, {
        toValue: height,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setIsRevealed(false));
    } else {
      // Reveal the scanner
      setIsRevealed(true);
      Animated.timing(waveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      
      {/* LAYER 0: Bottom Layer - Mascot (Static) */}
      <View style={styles.layer0}>
        <Image 
          source={require('../../assets/mascot_happy_no_hands.webp')} 
          style={styles.heroMascot} 
          resizeMode="contain" 
        />
        <Text style={styles.heroTitle}>Ready to analyze?</Text>
        <Text style={styles.heroSubtitle}>Position the barcode over the scanner to begin the check.</Text>
        
        {!isRevealed && (
          <TouchableOpacity style={styles.triggerButton} onPress={handleTriggerRender} activeOpacity={0.8}>
            <Ionicons name="scan" size={24} color="#FFFFFF" />
            <Text style={styles.triggerText}>Initiate Scan Engine</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LAYER 1: Top Layer - Scanner UI wrapped in the Mask */}
      {/* The MaskedView only renders its children where the maskElement is opaque (black) */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        pointerEvents={isRevealed ? 'auto' : 'none'}
        maskElement={
          // The Mask defines what parts of Layer 1 to show.
          // Anything transparent hides Layer 1. Anything black shows Layer 1.
          <Animated.View style={[
            StyleSheet.absoluteFill, 
            { transform: [{ translateY: waveAnim }] }
          ]}>
            <Svg height={waveHeight} width={width} style={{ backgroundColor: 'transparent' }}>
              <Path d={wavePath} fill="black" />
            </Svg>
            <View style={{ width, height: height, backgroundColor: 'black' }} />
          </Animated.View>
        }
      >
        {/* Everything inside here is what gets revealed by the fluid wave rising */}
        <View style={styles.layer1}>
          
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={handleTriggerRender} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scanning Mode</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Faux Camera Viewfinder */}
          <View style={styles.viewfinderContainer}>
            {/* Viewfinder Corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <View style={styles.scanLine} />
          </View>
          
          <Text style={styles.scannerFooterText}>Looking for a barcode...</Text>
        </View>
      </MaskedView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  layer0: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heroMascot: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textBase,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  triggerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  layer1: {
    flex: 1,
    backgroundColor: '#0D1410', // Extremely dark, almost black green to simulate camera background natively
    alignItems: 'center',
  },
  scannerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  viewfinderContainer: {
    width: 260,
    height: 260,
    marginTop: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#4CA456', // Neon green scan frame
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  scanLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#4CA456',
    shadowColor: '#4CA456',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    opacity: 0.8,
  },
  scannerFooterText: {
    color: '#FFFFFF',
    marginTop: 60,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  }
});
