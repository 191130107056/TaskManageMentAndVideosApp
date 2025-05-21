import React from 'react';
import {Text, StyleSheet} from 'react-native';
import colors from '../utils/colors';

export default function ErrorMessage({message}) {
  return <Text style={styles.error}>{message}</Text>;
}
const styles = StyleSheet.create({
  error: {color: colors.red, textAlign: 'center', margin: 20},
});
