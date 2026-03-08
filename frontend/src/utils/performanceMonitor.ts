/**
 * Performance Monitoring Utilities
 * Tracks and measures performance improvements from UX optimizations
 */

interface PerformanceMetrics {
  componentRenderTime: number;
  interactionDelay: number;
  memoryUsage: number;
  animationFrameRate: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

interface UXMetrics {
  timeToInteraction: number;
  visualStabilityScore: number;
  accessibilityScore: number;
  userEngagementScore: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private uxMetrics: UXMetrics[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Performance Observer for paint timing
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.logMetric('FCP', entry.startTime);
          }
          if (entry.name === 'largest-contentful-paint') {
            this.logMetric('LCP', entry.startTime);
          }
        });
      });
      
      try {
        paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        this.observers.set('paint', paintObserver);
      } catch (e) {
        console.warn('Paint observer not supported');
      }
    }

    // Memory usage monitoring
    this.startMemoryMonitoring();
  }

  /**
   * Measures component render performance
   */
  measureComponentRender<T>(
    componentName: string,
    renderFunction: () => T
  ): T {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    this.logMetric(`${componentName}_render`, endTime - startTime);
    return result;
  }

  /**
   * Measures user interaction response time
   */
  measureInteraction(interactionName: string, callback: () => void): void {
    const startTime = performance.now();
    
    // Use requestAnimationFrame to measure actual response time
    requestAnimationFrame(() => {
      callback();
      const endTime = performance.now();
      this.logMetric(`${interactionName}_interaction`, endTime - startTime);
    });
  }

  /**
   * Tracks animation performance
   */
  trackAnimationPerformance(animationName: string): () => void {
    let frameCount = 0;
    let startTime = performance.now();
    let lastFrameTime = startTime;
    
    const trackFrame = () => {
      const currentTime = performance.now();
      frameCount++;
      
      // Calculate FPS
      const frameTime = currentTime - lastFrameTime;
      const fps = 1000 / frameTime;
      
      this.logMetric(`${animationName}_fps`, fps);
      lastFrameTime = currentTime;
    };

    const animationId = requestAnimationFrame(function frame() {
      trackFrame();
      requestAnimationFrame(frame);
    });

    // Return cleanup function
    return () => {
      cancelAnimationFrame(animationId);
      const totalTime = performance.now() - startTime;
      const avgFps = (frameCount / totalTime) * 1000;
      this.logMetric(`${animationName}_avg_fps`, avgFps);
    };
  }

  /**
   * Measures visual stability (CLS equivalent)
   */
  measureVisualStability(): void {
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        this.logMetric('visual_stability', clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }
    }
  }

  /**
   * Memory usage monitoring
   */
  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.logMetric('memory_used', memory.usedJSHeapSize);
        this.logMetric('memory_total', memory.totalJSHeapSize);
        this.logMetric('memory_limit', memory.jsHeapSizeLimit);
      }, 5000);
    }
  }

  /**
   * UX-specific metrics tracking
   */
  trackUserEngagement(action: string): void {
    const timestamp = Date.now();
    const engagementData = {
      action,
      timestamp,
      elementVisible: this.isElementVisible(document.activeElement as HTMLElement)
    };
    
    this.logMetric('user_engagement', 1, engagementData);
  }

  /**
   * Accessibility metrics
   */
  auditAccessibility(): Promise<number> {
    return new Promise((resolve) => {
      // Basic accessibility checks
      let score = 100;
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      let imagesWithoutAlt = 0;
      images.forEach(img => {
        if (!img.getAttribute('alt')) {
          imagesWithoutAlt++;
        }
      });
      score -= (imagesWithoutAlt / images.length) * 20;

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let invalidHeadingStructure = 0;
      let lastLevel = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (level > lastLevel + 1) {
          invalidHeadingStructure++;
        }
        lastLevel = level;
      });
      score -= (invalidHeadingStructure / headings.length) * 15;

      // Check for keyboard navigation
      const interactive = document.querySelectorAll('button, a, input, select, textarea');
      let nonKeyboardAccessible = 0;
      interactive.forEach(element => {
        if (element.getAttribute('tabindex') === '-1' && !element.hasAttribute('aria-hidden')) {
          nonKeyboardAccessible++;
        }
      });
      score -= (nonKeyboardAccessible / interactive.length) * 25;

      // Check for ARIA labels
      const needsLabels = document.querySelectorAll('input, button, select, textarea');
      let missingLabels = 0;
      needsLabels.forEach(element => {
        const hasLabel = element.getAttribute('aria-label') || 
                        element.getAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${element.id}"]`);
        if (!hasLabel) {
          missingLabels++;
        }
      });
      score -= (missingLabels / needsLabels.length) * 20;

      score = Math.max(0, Math.min(100, score));
      this.logMetric('accessibility_score', score);
      resolve(score);
    });
  }

  /**
   * Card system performance audit
   */
  auditCardSystem(): void {
    const cards = document.querySelectorAll('.card, .player-card, .lobby-card, .deal-card, .board-card, .chat-card, .action-card, .stats-card, .modal-card');
    
    let performanceScore = 100;
    let consistencyScore = 100;
    
    cards.forEach(card => {
      // Check for consistent class usage
      const cardClasses = Array.from(card.classList);
      const hasCardClass = cardClasses.some(cls => cls.includes('card'));
      if (!hasCardClass) {
        consistencyScore -= 10;
      }

      // Check for excessive nesting
      const depth = this.getElementDepth(card as HTMLElement);
      if (depth > 5) {
        performanceScore -= 5;
      }

      // Check for animation performance
      const computedStyle = window.getComputedStyle(card);
      const hasExpensiveAnimations = computedStyle.transform !== 'none' || 
                                   computedStyle.filter !== 'none';
      if (hasExpensiveAnimations) {
        performanceScore -= 2;
      }
    });

    this.logMetric('card_system_performance', Math.max(0, performanceScore));
    this.logMetric('card_system_consistency', Math.max(0, consistencyScore));
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): object {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      uxMetrics: this.uxMetrics,
      summary: {
        averageRenderTime: this.calculateAverage('render'),
        averageInteractionDelay: this.calculateAverage('interaction'),
        memoryEfficiency: this.calculateMemoryEfficiency(),
        overallPerformanceScore: this.calculateOverallScore()
      },
      recommendations: this.generateRecommendations()
    };

    console.log('Performance Report:', report);
    return report;
  }

  // Helper methods
  private logMetric(name: string, value: number, metadata?: any): void {
    console.log(`Performance Metric - ${name}: ${value}ms`, metadata || '');
  }

  private isElementVisible(element: HTMLElement): boolean {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private getElementDepth(element: HTMLElement): number {
    let depth = 0;
    let parent = element.parentElement;
    while (parent) {
      depth++;
      parent = parent.parentElement;
    }
    return depth;
  }

  private calculateAverage(metricType: string): number {
    const relevantMetrics = this.metrics.filter(m => 
      Object.keys(m).some(key => key.includes(metricType))
    );
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, metric) => {
      const values = Object.values(metric);
      return acc + values.reduce((a, b) => a + b, 0);
    }, 0);
    
    return sum / relevantMetrics.length;
  }

  private calculateMemoryEfficiency(): number {
    // Placeholder for memory efficiency calculation
    return 85; // Good efficiency score
  }

  private calculateOverallScore(): number {
    // Weighted score calculation
    const renderScore = Math.max(0, 100 - (this.calculateAverage('render') / 10));
    const interactionScore = Math.max(0, 100 - (this.calculateAverage('interaction') / 5));
    const memoryScore = this.calculateMemoryEfficiency();
    
    return (renderScore * 0.4 + interactionScore * 0.4 + memoryScore * 0.2);
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    
    const avgRender = this.calculateAverage('render');
    if (avgRender > 50) {
      recommendations.push('Consider optimizing component render times');
    }
    
    const avgInteraction = this.calculateAverage('interaction');
    if (avgInteraction > 20) {
      recommendations.push('Reduce interaction response time for better UX');
    }
    
    return recommendations;
  }

  /**
   * Cleanup all observers
   */
  cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default PerformanceMonitor;
