// src/components/Loader.js
import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import colors from '../utils/colors';

export default function Loader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
