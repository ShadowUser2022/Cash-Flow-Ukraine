import { useState, useRef, useEffect, type ReactNode } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
}

export const Tooltip = ({ 
  content, 
  children, 
  position = 'top', 
  delay = 500,
  maxWidth = 250 
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      adjustPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const adjustPosition = () => {
    if (!tooltipRef.current || !containerRef.current) return;

    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let newPosition = position;

    // Check if tooltip goes out of viewport and adjust
    if (position === 'top' && rect.top - tooltipRect.height < 10) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight - 10) {
      newPosition = 'top';
    } else if (position === 'left' && rect.left - tooltipRect.width < 10) {
      newPosition = 'right';
    } else if (position === 'right' && rect.right + tooltipRect.width > window.innerWidth - 10) {
      newPosition = 'left';
    }

    setActualPosition(newPosition);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="tooltip-container"
      ref={containerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`tooltip tooltip-${actualPosition}`}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          <div className="tooltip-content">
            {content}
          </div>
          <div className={`tooltip-arrow tooltip-arrow-${actualPosition}`} />
        </div>
      )}
    </div>
  );
};
