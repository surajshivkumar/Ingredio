import React, { useEffect, useState, useRef } from 'react';
import {
  View, Animated, Easing, SafeAreaView, Text,
  TouchableOpacity, Image, Dimensions, StyleSheet,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from './HomeScreen.styles';
import { login as apiLogin } from '../services/auth.service';

const { height, width } = Dimensions.get('window');
const HALF_W = width / 2;
const MASCOT_SZ = 360;

export default function HomeScreen({ navigation }: any) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ... (animation refs remain same)
  const bounceAnim   = useRef(new Animated.Value(0)).current;
  const leftPanelX   = useRef(new Animated.Value(0)).current;
  const rightPanelX  = useRef(new Animated.Value(0)).current;
  const leftRotate   = useRef(new Animated.Value(0)).current;  // counterclockwise
  const rightRotate  = useRef(new Animated.Value(0)).current;  // clockwise
  const tornOpacity  = useRef(new Animated.Value(0)).current;
  const loginOpacity = useRef(new Animated.Value(0)).current;

  // ... (useEffect remains same)
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -50, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,   duration: 400, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
      ])
    );
    bounce.start();

    const t = setTimeout(() => {
      bounce.stop();
      bounceAnim.setValue(0);
      tornOpacity.setValue(1);  // show torn edges right as tear starts

      Animated.parallel([
        Animated.timing(leftPanelX, {
          toValue: -HALF_W - 30,
          duration: 1000,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rightPanelX, {
          toValue: HALF_W + 30,
          duration: 650,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        // Rotation — tops swing apart first, like tearing from top down
        Animated.timing(leftRotate, {
          toValue: -12,     // degrees counterclockwise
          duration: 650,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rightRotate, {
          toValue: 12,      // degrees clockwise
          duration: 650,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowLogin(true);
        Animated.timing(loginOpacity, {
          toValue: 1, duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    return () => clearTimeout(t);
  }, []);

  const leftDeg = leftRotate.interpolate({ inputRange: [-12, 0], outputRange: ['-12deg', '0deg'] });
  const rightDeg = rightRotate.interpolate({ inputRange: [0, 12], outputRange: ['0deg', '12deg'] });

  const shadowScale   = bounceAnim.interpolate({ inputRange: [-50, 0], outputRange: [0.5, 1],    extrapolate: 'clamp' });
  const shadowOpacity = bounceAnim.interpolate({ inputRange: [-50, 0], outputRange: [0.06, 0.18], extrapolate: 'clamp' });

  const skipAuth = () => navigation.replace('MainTabs');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      await apiLogin(email, password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Login ────────────────────────────────────────────────────────────────
  if (showLogin) {
    return (
      <SafeAreaView style={[StyleSheet.absoluteFill, styles.safeArea]}>
        <StatusBar style="light" />
        <Animated.View style={[styles.mainContainer, { opacity: loginOpacity }]}>
          <View style={styles.contentWrapper}>
            <Image source={require('../../assets/mascot_happy.webp')} style={styles.landingMascot} resizeMode="contain" />
            <Text style={styles.brandTitle}>Ingredio</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#1E4620" />
                ) : (
                  <Text style={styles.primaryButtonText}>Login</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={skipAuth} activeOpacity={0.85}>
                <Text style={styles.secondaryButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.footerText}>Ylk Studios</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Splash: two halves that rip apart vertically ─────────────────────────
  return (
    <View style={local.root}>
      <StatusBar style="dark" />

      {/* LEFT HALF — tears left, clips left half of mascot */}
      <Animated.View style={[local.leftPanel, { transform: [{ translateX: leftPanelX }, { rotate: leftDeg }] }]}>
        {/* Torn edge — right side of left panel */}
        <Animated.View style={[local.tornEdgeRight, { opacity: tornOpacity }]}>
          {Array.from({ length: 28 }).map((_, i) => (
            <View key={`l${i}`} style={[local.toothRight, { width: i % 2 === 0 ? 14 : 6 }]} />
          ))}
        </Animated.View>
        {/* Left half of mascot — image positioned so only left half shows */}
        <View style={local.mascotClipLeft}>
          <Animated.Image
            source={require('../../assets/mascot_happy_no_hands.webp')}
            style={[local.mascotFull, { transform: [{ translateY: bounceAnim }] }]}
            resizeMode="contain"
          />
        </View>
        {/* Left half of shadow */}
        <View style={local.shadowClipLeft}>
          <Animated.View style={[local.shadowFull, { opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]} />
        </View>
      </Animated.View>

      {/* RIGHT HALF — tears right, clips right half of mascot */}
      <Animated.View style={[local.rightPanel, { transform: [{ translateX: rightPanelX }, { rotate: rightDeg }] }]}>
        {/* Torn edge — left side of right panel */}
        <Animated.View style={[local.tornEdgeLeft, { opacity: tornOpacity }]}>
          {Array.from({ length: 28 }).map((_, i) => (
            <View key={`r${i}`} style={[local.toothLeft, { width: i % 2 === 0 ? 14 : 6 }]} />
          ))}
        </Animated.View>
        {/* Right half of mascot — shifted left so only right half shows */}
        <View style={local.mascotClipRight}>
          <Animated.Image
            source={require('../../assets/mascot_happy_no_hands.webp')}
            style={[local.mascotFull, { left: -MASCOT_SZ / 2, transform: [{ translateY: bounceAnim }] }]}
            resizeMode="contain"
          />
        </View>
        {/* Right half of shadow */}
        <View style={local.shadowClipRight}>
          <Animated.View style={[local.shadowFull, { left: -70, opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const local = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1E4620',
  },

  // ── Panels ──────────────────────────────────────────────────────────────
  leftPanel: {
    position: 'absolute',
    top: 0, left: 0,
    width: HALF_W,
    height,
    backgroundColor: '#FFDE42',
    overflow: 'visible',
    zIndex: 5,
  },
  rightPanel: {
    position: 'absolute',
    top: 0, left: HALF_W,
    width: HALF_W,
    height,
    backgroundColor: '#FFDE42',
    overflow: 'visible',
    zIndex: 5,
  },

  // ── Mascot clipping (each half only shows its side) ─────────────────────
  mascotClipLeft: {
    position: 'absolute',
    top: (height - MASCOT_SZ) / 2,
    right: 0,                      // flush to center line
    width: MASCOT_SZ / 2,
    height: MASCOT_SZ,
    overflow: 'hidden',
  },
  mascotClipRight: {
    position: 'absolute',
    top: (height - MASCOT_SZ) / 2,
    left: 0,                       // flush to center line
    width: MASCOT_SZ / 2,
    height: MASCOT_SZ,
    overflow: 'hidden',
  },
  mascotFull: {
    width: MASCOT_SZ,
    height: MASCOT_SZ,
  },

  // ── Shadow clipping ─────────────────────────────────────────────────────
  shadowClipLeft: {
    position: 'absolute',
    top: (height - MASCOT_SZ) / 2 + MASCOT_SZ - 14,
    right: 0,
    width: 70,
    height: 22,
    overflow: 'hidden',
  },
  shadowClipRight: {
    position: 'absolute',
    top: (height - MASCOT_SZ) / 2 + MASCOT_SZ - 14,
    left: 0,
    width: 70,
    height: 22,
    overflow: 'hidden',
  },
  shadowFull: {
    width: 140,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000',
  },

  // ── Torn edges (vertical zigzag) ────────────────────────────────────────
  tornEdgeRight: {
    position: 'absolute',
    top: 0, right: -14,
    width: 14,
    height,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  toothRight: {
    height: height / 28 - 2,
    backgroundColor: '#FFDE42',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  tornEdgeLeft: {
    position: 'absolute',
    top: 0, left: -14,
    width: 14,
    height,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  toothLeft: {
    height: height / 28 - 2,
    backgroundColor: '#FFDE42',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
});
