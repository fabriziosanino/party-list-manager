import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Guest, GuestStats } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/styles';

interface StatsCardProps {
  guests: Guest[];
}

const StatsCard: React.FC<StatsCardProps> = ({ guests }) => {
  const stats: GuestStats = React.useMemo(() => ({
    total: guests.length,
    paid: guests.filter(g => g.paid).length,
    scanned: guests.filter(g => g.scanned).length,
  }), [guests]);

  const StatBox: React.FC<{
    value: number;
    label: string;
    color: string;
    backgroundColor: string;
  }> = ({ value, label, color, backgroundColor }) => (
    <View style={[styles.statBox, { backgroundColor }]}>
      <Text style={[styles.statNumber, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.gray[600] }]}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatBox
        value={stats.total}
        label="Totale Ospiti"
        color={colors.primary}
        backgroundColor={`${colors.primary}15`}
      />
      <StatBox
        value={stats.paid}
        label="Hanno Pagato"
        color={colors.success}
        backgroundColor={`${colors.success}15`}
      />
      <StatBox
        value={stats.scanned}
        label="Già Entrati"
        color={colors.warning}
        backgroundColor={`${colors.warning}15`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default StatsCard;