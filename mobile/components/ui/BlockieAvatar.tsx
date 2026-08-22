import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BlockieAvatarProps {
  address?: string | null;
  size?: number;
  seed?: string;
}

const PALETTES = [
  ['#836EF9', '#2E1065', '#C084FC', '#00D4AA'],
  ['#00D4AA', '#064E3B', '#34D399', '#836EF9'],
  ['#F59E0B', '#78350F', '#FCD34D', '#EF4444'],
  ['#38BDF8', '#0C4A6E', '#7DD3FC', '#836EF9'],
  ['#EC4899', '#831843', '#F472B6', '#F59E0B'],
];

export function BlockieAvatar({ address, size = 36, seed }: BlockieAvatarProps) {
  const effectiveSeed = seed || address || '0x0000000000000000000000000000000000000000';
  
  let hash = 0;
  for (let i = 0; i < effectiveSeed.length; i++) {
    hash = (hash << 5) - hash + effectiveSeed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const paletteIndex = absHash % PALETTES.length;
  const palette = PALETTES[paletteIndex];

  const gridSize = 4;
  const blockSize = size / gridSize;

  // Generate 4x4 matrix
  const blocks = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const idx = (absHash + r * 7 + c * 13) % palette.length;
      blocks.push({
        key: `${r}-${c}`,
        color: palette[idx],
        top: r * blockSize,
        left: c * blockSize,
      });
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {blocks.map((b) => (
        <View
          key={b.key}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: blockSize,
            height: blockSize,
            backgroundColor: b.color,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
  },
});
