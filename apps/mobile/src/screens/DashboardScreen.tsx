import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors } from '../theme/colors';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Top Header / User Badge */}
      <View style={styles.header}>
        <View style={styles.userBadge}>
          <Image 
            source={require('../../assets/mascot.webp')} 
            style={styles.avatarImage} 
            resizeMode="cover"
          />
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>Suraaj</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={{fontSize: 20}}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Mascot Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Scan Groceries & Cosmetics!</Text>
            <Text style={styles.bannerSubtitle}>Instantly check ingredient safety.</Text>
          </View>
          <Image 
            source={require('../../assets/mascot_happy.webp')} 
            style={styles.bannerMascot} 
            resizeMode="contain" 
          />
        </View>

        {/* Dummy Data Section: Recent Scans */}
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        
        <View style={styles.recentList}>
          
          <View style={styles.productCard}>
            <View style={[styles.scoreCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.scoreText}>A</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Oat & Honey Moisturizer</Text>
              <Text style={styles.productDetails}>100% Safe Ingredients • Cosmetic</Text>
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={[styles.scoreCircle, { backgroundColor: colors.secondary }]}>
              <Text style={styles.scoreText}>C</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Organic Tomato Sauce</Text>
              <Text style={styles.productDetails}>Contains High Sodium • Grocery</Text>
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={[styles.scoreCircle, { backgroundColor: colors.danger }]}>
              <Text style={styles.scoreText}>F</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Clear Repair Sunscreen</Text>
              <Text style={styles.productDetails}>Contains Oxybenzone • Cosmetic</Text>
            </View>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // a tiny bit darker than absolute white for depth
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  welcomeText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textBase,
  },
  notificationButton: {
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // padding for the bottom tabs overlap
  },
  bannerCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    // Soft drop shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#4A7A4C',
    fontWeight: '500',
    opacity: 0.8,
  },
  bannerMascot: {
    width: 80,
    height: 80,
    transform: [{ translateY: -10 }], // Pop it slightly out of the box
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textBase,
    marginBottom: 16,
  },
  recentList: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    gap: 16,
    // Soft Drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textBase,
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
