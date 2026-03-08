// Overlays.tsx
// Toast, Chat, VideoChat, MobileNavigation

import React from 'react';

interface OverlaysProps {
  toasts: any[];
  removeToast: (id: string) => void;
  isChatMinimized: boolean;
  setIsChatMinimized: (v: boolean) => void;
  isVideoChatMinimized: boolean;
  setIsVideoChatMinimized: (v: boolean) => void;
  gameId: string;
  isMobile: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  handleLeftSidebarToggle: () => void;
  handleRightSidebarToggle: () => void;
}

const Overlays: React.FC<OverlaysProps> = (props) => {
  // ...рендер ToastNotifications, Chat, VideoChat, MobileNavigation...
  // ...existing code...
  return null;
};

export default Overlays;
