# react-native-vertical-deck-carousel

A customizable vertical swipe deck carousel for React Native, powered by Reanimated and Gesture Handler. The active card follows the finger; on swipe it shrinks and moves into the back of the deck while the remaining cards animate forward.

## Requirements

- React Native
- `react-native-reanimated` (v3 or v4)
- `react-native-gesture-handler` (v2 or newer)

These are peer dependencies and must be installed in your app. Configure Reanimated/Worklets and wrap your app root in `GestureHandlerRootView` as required by the installed versions.

## Install

```bash
npm install react-native-vertical-deck-carousel react-native-reanimated react-native-gesture-handler
```

## Basic usage

```tsx
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import VerticalDeckCarousel from 'react-native-vertical-deck-carousel';

const cards = [
  { id: '1', title: 'Credit Card', amount: '₹1,50,000', color: '#292929' },
  { id: '2', title: 'Personal Loan', amount: '₹5,00,000', color: '#183C70' },
  { id: '3', title: 'Investment', amount: '₹2,50,000', color: '#245D45' },
];

export default function ExampleScreen() {
  return (
    <VerticalDeckCarousel
      data={cards}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: item.color }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.amount}>{item.amount}</Text>
        </View>
      )}
      onSwipe={(item, direction, nextIndex) => {
        console.log('Swiped:', item.title, direction, nextIndex);
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 22,
    justifyContent: 'space-between',
    borderRadius: 22,
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700' },
  amount: { color: 'white', fontSize: 30, fontWeight: '800' },
});
```

## Props

| Prop | Type | Default | Description |
|---|---|---:|---|
| `data` | `T[]` | required | Carousel items. |
| `renderItem` | function | required | Render the card content. Receives `item`, visible `index`, and `isActive`. |
| `keyExtractor` | function | required | Stable unique key for each item. |
| `initialIndex` | number | `0` | Item initially shown at the front. |
| `visibleCards` | number | `4` | Number of cards rendered in the stack. |
| `cardHeight` | number | `190` | Card height in React Native layout points. |
| `cardWidth` | number or percentage string | `'88%'` | Card width. |
| `cardOffset` | number | `22` | Vertical offset between cards. |
| `swipeThreshold` | number | `65` | Minimum drag distance to trigger a swipe. |
| `swipeDistance` | number | `75` | Animated travel distance after a successful swipe. |
| `swipeVelocity` | number | `500` | Velocity threshold for a quick swipe. |
| `animationDuration` | number | `180` | Successful swipe animation duration in ms. |
| `enableSwipeUp` | boolean | `true` | Enable moving the front card to the back. |
| `enableSwipeDown` | boolean | `true` | Enable moving the last card to the front. |
| `cardScaleStep` | number | `0.045` | Scale reduction per stack level. |
| `cardOpacityStep` | number | `0.13` | Opacity reduction per stack level. |
| `layoutAnimation` | boolean | `true` | Animate cards when their stack positions change. |
| `containerStyle` | ViewStyle | — | Outer container style. |
| `stackStyle` | ViewStyle | — | Stack container style. |
| `cardStyle` | ViewStyle | — | Shared style for every card wrapper. |
| `springDamping` | number | `18` | Spring damping when a swipe is cancelled. |
| `springStiffness` | number | `180` | Spring stiffness when a swipe is cancelled. |
| `onSwipe` | function | — | Called with swiped item, direction, and next index. |
| `onIndexChange` | function | — | Called with the new front item's index in the original data array. |

## Notes

- The component rotates items internally; it does not mutate the `data` array.
- Use stable, unique IDs with `keyExtractor`.
- `renderItem` controls the card's visual design; no card content is hardcoded by the package.
- Keep `GestureHandlerRootView` at the application root.
- Rebuild the native app after changing native dependencies or Babel configuration.


