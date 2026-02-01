import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

export default function SectionHeader({ title, subtitle, center }: SectionHeaderProps) {
  return (
    <View style={[styles.wrap, center && styles.wrapCenter]}>
      <Text style={[styles.title, center && styles.titleCenter]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, center && styles.subtitleCenter]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  wrapCenter: {
    alignItems: 'center',
    marginBottom: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  titleCenter: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  subtitleCenter: {
    textAlign: 'center',
  },
});
