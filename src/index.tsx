import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export type SwipeDirection = 'up' | 'down';

export interface VerticalDeckCarouselRenderInfo<T> {
  item: T;
  index: number;
  isActive: boolean;
}

export interface VerticalDeckCarouselProps<T> {
  data: T[];
  renderItem: (info: VerticalDeckCarouselRenderInfo<T>) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onSwipe?: (item: T, direction: SwipeDirection, nextIndex: number) => void;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
  visibleCards?: number;
  cardHeight?: number;
  cardWidth?: number | `${number}%`;
  cardOffset?: number;
  swipeThreshold?: number;
  swipeDistance?: number;
  swipeVelocity?: number;
  animationDuration?: number;
  enableSwipeUp?: boolean;
  enableSwipeDown?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  stackStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  cardScaleStep?: number;
  cardOpacityStep?: number;
  layoutAnimation?: boolean;
  springDamping?: number;
  springStiffness?: number;
}

export function VerticalDeckCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  onSwipe,
  onIndexChange,
  initialIndex = 0,
  visibleCards = 4,
  cardHeight = 190,
  cardWidth = '88%',
  cardOffset = 22,
  swipeThreshold = 65,
  swipeDistance = 75,
  swipeVelocity = 500,
  animationDuration = 180,
  enableSwipeUp = true,
  enableSwipeDown = true,
  containerStyle,
  stackStyle,
  cardStyle,
  cardScaleStep = 0.045,
  cardOpacityStep = 0.13,
  layoutAnimation = true,
  springDamping = 18,
  springStiffness = 180,
}: VerticalDeckCarouselProps<T>) {
  const safeData = data ?? [];
  const normalizedInitialIndex = safeData.length
    ? ((initialIndex % safeData.length) + safeData.length) % safeData.length
    : 0;

  const [items, setItems] = useState<T[]>(() => [
    ...safeData.slice(normalizedInitialIndex),
    ...safeData.slice(0, normalizedInitialIndex),
  ]);

  const translateY = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const activeItem = items[0];

  const rotateCards = useCallback((direction: SwipeDirection) => {
    if (!items.length) {
      isAnimating.value = false;
      translateY.value = 0;
      return;
    }

    const swipedItem = items[0];
    const nextItems = [...items];

    if (direction === 'up') {
      const first = nextItems.shift();
      if (first !== undefined) nextItems.push(first);
    } else {
      const last = nextItems.pop();
      if (last !== undefined) nextItems.unshift(last);
    }

    const nextIndex = direction === 'up'
      ? (safeData.findIndex(item => item === swipedItem) + 1) % safeData.length
      : (safeData.findIndex(item => item === swipedItem) - 1 + safeData.length) % safeData.length;

    translateY.value = 0;
    setItems(nextItems);
    isAnimating.value = false;
    onSwipe?.(swipedItem, direction, nextIndex);
    onIndexChange?.(nextIndex);
  }, [items, safeData, onSwipe, onIndexChange, isAnimating, translateY]);

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-30, 30])
    .onUpdate(event => {
      if (!isAnimating.value) translateY.value = event.translationY;
    })
    .onEnd(event => {
      if (isAnimating.value) return;

      const shouldSwipeUp = enableSwipeUp &&
        (event.translationY < -swipeThreshold || event.velocityY < -swipeVelocity);
      const shouldSwipeDown = enableSwipeDown &&
        (event.translationY > swipeThreshold || event.velocityY > swipeVelocity);

      if (shouldSwipeUp || shouldSwipeDown) {
        isAnimating.value = true;
        const direction: SwipeDirection = shouldSwipeUp ? 'up' : 'down';
        const destination = direction === 'up' ? -swipeDistance : swipeDistance;

        translateY.value = withTiming(
          destination,
          { duration: animationDuration },
          finished => {
            if (finished) runOnJS(rotateCards)(direction);
          },
        );
      } else {
        translateY.value = withSpring(0, {
          damping: springDamping,
          stiffness: springStiffness,
        });
      }
    }), [
      enableSwipeUp, enableSwipeDown, swipeThreshold, swipeVelocity,
      swipeDistance, animationDuration, springDamping, springStiffness,
      rotateCards, isAnimating, translateY,
    ]);

  const topCardAnimatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      Math.abs(translateY.value),
      [0, swipeDistance],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const rotation = interpolate(
      translateY.value,
      [-swipeDistance, 0, swipeDistance],
      [-4, 0, 4],
    );

    return {
      opacity: interpolate(progress, [0, 1], [1, 0.85]),
      transform: [
        { translateY: translateY.value },
        { scale: interpolate(progress, [0, 1], [1, 0.92]) },
        { rotateZ: `${rotation}deg` },
      ],
    };
  });

  if (!items.length) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.stack,
          {
            height: cardHeight + cardOffset * Math.max(0, Math.min(visibleCards, items.length) - 1),
          },
          stackStyle,
        ]}
      >
        {items.slice(0, Math.max(1, visibleCards)).map((item, index) => {
          const key = keyExtractor(item, index);
          const isActive = index === 0;
          const content = (
            <Animated.View
              key={key}
              layout={layoutAnimation
                ? LinearTransition.springify().damping(22).stiffness(160)
                : undefined}
              style={[
                styles.card,
                {
                  height: cardHeight,
                  width: cardWidth,
                  top: index * cardOffset,
                  zIndex: items.length - index,
                  opacity: 1 - index * cardOpacityStep,
                  transform: isActive
                    ? undefined
                    : [{ scale: 1 - index * cardScaleStep }],
                },
                cardStyle,
                isActive && topCardAnimatedStyle,
              ]}
            >
              {renderItem({ item, index, isActive })}
            </Animated.View>
          );

          return isActive ? (
            <GestureDetector key={key} gesture={panGesture}>
              {content}
            </GestureDetector>
          ) : content;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  stack: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 22,
    overflow: 'hidden',
  },
});

export default VerticalDeckCarousel;
