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
    unpaid: guests.filter(g => !g.paid).length,
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
        value={stats.unpaid}
        label="Devono Pagare"
        color={colors.danger}
        backgroundColor={`${colors.danger}15`}
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
    padding: spacing.md,
    gap: spacing.xs,
  },
  statBox: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default StatsCard;