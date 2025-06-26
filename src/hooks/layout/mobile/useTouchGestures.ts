import { useState, useCallback, useRef, TouchEvent } from 'react';

interface TouchGestureOptions {
  minSwipeDistance?: number;
  maxVerticalDistance?: number;
  preventDefaultEvents?: boolean;
}

interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

interface UseTouchGesturesReturn {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  isGesturing: boolean;
}

export const useTouchGestures = (
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
): UseTouchGesturesReturn => {
  const {
    minSwipeDistance = 50,
    maxVerticalDistance = 100,
    preventDefaultEvents = false
  } = options;

  const [isGesturing, setIsGesturing] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefaultEvents) {
      e.preventDefault();
    }

    setIsGesturing(true);
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchEndRef.current = null;

    // Setup long press detection
    if (handlers.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.();
        setIsGesturing(false);
      }, 500);
    }
  }, [handlers.onLongPress, preventDefaultEvents]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefaultEvents) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, [preventDefaultEvents]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (preventDefaultEvents) {
      e.preventDefault();
    }

    setIsGesturing(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;

    // If no touch move was detected, treat as tap
    if (!touchEndRef.current) {
      const timeDiff = Date.now() - touchStartRef.current.time;
      if (timeDiff < 200 && handlers.onTap) {
        handlers.onTap();
      }
      return;
    }

    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = touchStartRef.current.y - touchEndRef.current.y;
    const timeDiff = touchEndRef.current.time - touchStartRef.current.time;

    // Check if it's a valid swipe (not too slow, not too much vertical movement)
    if (timeDiff > 500) return;
    if (Math.abs(deltaY) > maxVerticalDistance) return;

    const isLeftSwipe = deltaX > minSwipeDistance;
    const isRightSwipe = deltaX < -minSwipeDistance;
    const isUpSwipe = deltaY > minSwipeDistance;
    const isDownSwipe = deltaY < -minSwipeDistance;

    // Horizontal swipes (prioritized)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (isLeftSwipe && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      } else if (isRightSwipe && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      }
    }
    // Vertical swipes
    else if (Math.abs(deltaY) > minSwipeDistance) {
      if (isUpSwipe && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      } else if (isDownSwipe && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      }
    }
    // Small movement - treat as tap
    else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && handlers.onTap) {
      handlers.onTap();
    }

    // Reset references
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [
    handlers.onSwipeLeft,
    handlers.onSwipeRight,
    handlers.onSwipeUp,
    handlers.onSwipeDown,
    handlers.onTap,
    minSwipeDistance,
    maxVerticalDistance,
    // preventDefaultEvents
  ]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    // isGesturing
  };
};