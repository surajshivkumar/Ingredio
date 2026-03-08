import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlaceholderScreen({ route }: any) {
  const name = route?.params?.name || 'Placeholder';
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name} View Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA'
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6C757D'
  }
});
