import { useEffect, useCallback } from 'react';

interface TouchGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  restraint?: number;
  allowedTime?: number;
}

export const useTouchGestures = (options: TouchGesturesOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 150, // мінімальна відстань для swipe
    restraint = 100, // максимальне відхилення перпендикулярно
    allowedTime = 300, // максимальний час для swipe
  } = options;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touchobj = e.changedTouches[0];
    const startX = touchobj.pageX;
    const startY = touchobj.pageY;
    const startTime = new Date().getTime();

    const handleTouchEnd = (e: TouchEvent) => {
      const touchobj = e.changedTouches[0];
      const distX = touchobj.pageX - startX; // горизонтальна відстань
      const distY = touchobj.pageY - startY; // вертикальна відстань
      const elapsedTime = new Date().getTime() - startTime; // час swipe

      if (elapsedTime <= allowedTime) { // у межах дозволеного часу
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          // Горизонтальний swipe
          if (distX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (distX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
          // Вертикальний swipe
          if (distY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (distY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      // Cleanup
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, restraint, allowedTime]);

  useEffect(() => {
    // Додаємо touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleTouchStart]);
};

// Hook для детекції мобільного пристрою
export const useIsMobile = () => {
  const checkIsMobile = useCallback(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Перевіряємо по user agent
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    
    // Перевіряємо по розміру екрану
    const isMobileScreen = window.innerWidth <= 768;
    
    // Перевіряємо touch підтримку
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return isMobileUA || (isMobileScreen && isTouchDevice);
  }, []);

  return checkIsMobile();
};

// Hook для детекції орієнтації
export const useOrientation = () => {
  const getOrientation = useCallback(() => {
    if (window.innerHeight > window.innerWidth) {
      return 'portrait';
    }
    return 'landscape';
  }, []);

  return getOrientation();
};

export default useTouchGestures;
