// Overlays.tsx
// Toast, MobileNavigation

import React from 'react';

interface OverlaysProps {
  toasts: any[];
  removeToast: (id: string) => void;
  gameId: string;
  isMobile: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  handleLeftSidebarToggle: () => void;
  handleRightSidebarToggle: () => void;
}

const Overlays: React.FC<OverlaysProps> = () => {
  // ...рендер ToastNotifications, MobileNavigation...
  // ...existing code...
  return null;
};

export default Overlays;
