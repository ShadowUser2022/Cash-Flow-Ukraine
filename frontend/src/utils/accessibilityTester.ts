/**
 * Accessibility Testing & Validation Utilities
 * Ensures the card system and UX optimizations maintain accessibility standards
 */

interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info';
  type: string;
  element: HTMLElement;
  description: string;
  recommendation: string;
  wcagCriterion?: string;
}

interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  passedChecks: string[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

class AccessibilityTester {
  private issues: AccessibilityIssue[] = [];
  private passedChecks: string[] = [];

  /**
   * Run comprehensive accessibility audit
   */
  async runFullAudit(): Promise<AccessibilityReport> {
    this.issues = [];
    this.passedChecks = [];

    // Core accessibility checks
    this.checkImageAltText();
    this.checkHeadingStructure();
    this.checkKeyboardNavigation();
    this.checkAriaLabels();
    this.checkColorContrast();
    this.checkFocusManagement();
    this.checkSemanticStructure();
    
    // Card system specific checks
    this.checkCardAccessibility();
    
    // Interactive elements
    this.checkInteractiveElements();
    
    // Form accessibility
    this.checkFormAccessibility();

    const score = this.calculateAccessibilityScore();
    
    return {
      score,
      issues: this.issues,
      passedChecks: this.passedChecks,
      summary: {
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        info: this.issues.filter(i => i.severity === 'info').length
      }
    };
  }

  /**
   * Check image alt text
   */
  private checkImageAltText(): void {
    const images = document.querySelectorAll('img');
    let issuesFound = 0;

    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const ariaLabel = img.getAttribute('aria-label');
      const role = img.getAttribute('role');
      
      if (!alt && !ariaLabel && role !== 'presentation') {
        this.addIssue({
          severity: 'error',
          type: 'missing-alt-text',
          element: img as HTMLElement,
          description: 'Image missing alt text',
          recommendation: 'Add descriptive alt text or aria-label, or use role="presentation" for decorative images',
          wcagCriterion: 'WCAG 1.1.1 (Level A)'
        });
        issuesFound++;
      } else if (alt === '' && role !== 'presentation') {
        this.addIssue({
          severity: 'warning',
          type: 'empty-alt-text',
          element: img as HTMLElement,
          description: 'Image has empty alt text but no presentation role',
          recommendation: 'Add role="presentation" for decorative images or provide descriptive alt text',
          wcagCriterion: 'WCAG 1.1.1 (Level A)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Image alt text - All images have appropriate alternative text');
    }
  }

  /**
   * Check heading structure
   */
  private checkHeadingStructure(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    let issuesFound = 0;
    let hasH1 = false;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      
      if (level === 1) {
        hasH1 = true;
        if (index > 0) {
          this.addIssue({
            severity: 'warning',
            type: 'multiple-h1',
            element: heading as HTMLElement,
            description: 'Multiple H1 elements found',
            recommendation: 'Use only one H1 per page for better document structure',
            wcagCriterion: 'WCAG 1.3.1 (Level A)'
          });
          issuesFound++;
        }
      }

      if (level > lastLevel + 1) {
        this.addIssue({
          severity: 'error',
          type: 'heading-skip',
          element: heading as HTMLElement,
          description: `Heading level skipped (H${lastLevel} to H${level})`,
          recommendation: 'Use heading levels in order (H1, H2, H3, etc.) without skipping',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }

      lastLevel = level;
    });

    if (!hasH1 && headings.length > 0) {
      this.addIssue({
        severity: 'error',
        type: 'missing-h1',
        element: document.body,
        description: 'No H1 element found',
        recommendation: 'Add an H1 element to provide the main page heading',
        wcagCriterion: 'WCAG 1.3.1 (Level A)'
      });
      issuesFound++;
    }

    if (issuesFound === 0) {
      this.passedChecks.push('Heading structure - Proper heading hierarchy maintained');
    }
  }

  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(): void {
    const interactive = document.querySelectorAll('button, a, input, select, textarea, [tabindex], [role="button"], [role="tab"], [role="menuitem"]');
    let issuesFound = 0;

    interactive.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      const role = element.getAttribute('role');
      
      // Check for negative tabindex without aria-hidden
      if (tabIndex === '-1' && !element.hasAttribute('aria-hidden')) {
        this.addIssue({
          severity: 'warning',
          type: 'keyboard-inaccessible',
          element: element as HTMLElement,
          description: 'Interactive element not keyboard accessible',
          recommendation: 'Remove tabindex="-1" or add aria-hidden="true" if element should not be focusable',
          wcagCriterion: 'WCAG 2.1.1 (Level A)'
        });
        issuesFound++;
      }

      // Check for missing keyboard event handlers on custom interactive elements
      if (role === 'button' && element.tagName !== 'BUTTON') {
        const hasKeyboardHandler = element.hasAttribute('onkeydown') || 
                                 element.hasAttribute('onkeypress') ||
                                 element.hasAttribute('onkeyup');
        
        if (!hasKeyboardHandler) {
          this.addIssue({
            severity: 'error',
            type: 'missing-keyboard-handler',
            element: element as HTMLElement,
            description: 'Custom button missing keyboard event handler',
            recommendation: 'Add keyboard event handlers (Enter/Space) for custom interactive elements',
            wcagCriterion: 'WCAG 2.1.1 (Level A)'
          });
          issuesFound++;
        }
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Keyboard navigation - All interactive elements are keyboard accessible');
    }
  }

  /**
   * Check ARIA labels and descriptions
   */
  private checkAriaLabels(): void {
    const needsLabels = document.querySelectorAll('input:not([type="hidden"]), button, select, textarea, [role="button"], [role="tab"], [role="menuitem"]');
    let issuesFound = 0;

    needsLabels.forEach(element => {
      const hasLabel = this.hasAccessibleLabel(element as HTMLElement);
      
      if (!hasLabel) {
        this.addIssue({
          severity: 'error',
          type: 'missing-accessible-label',
          element: element as HTMLElement,
          description: 'Interactive element missing accessible label',
          recommendation: 'Add aria-label, aria-labelledby, or associate with a label element',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('ARIA labels - All interactive elements have accessible labels');
    }
  }

  /**
   * Check color contrast (basic implementation)
   */
  private checkColorContrast(): void {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
    let issuesFound = 0;

    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = style.fontWeight;
      
      // Basic contrast check (would need color parsing for full implementation)
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      
      // Placeholder for actual contrast calculation
      // In a real implementation, you'd extract colors and calculate contrast ratio
      if (style.color === style.backgroundColor) {
        this.addIssue({
          severity: 'error',
          type: 'insufficient-contrast',
          element: element as HTMLElement,
          description: 'Text color same as background color',
          recommendation: 'Ensure sufficient color contrast between text and background',
          wcagCriterion: 'WCAG 1.4.3 (Level AA)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Color contrast - Basic contrast checks passed');
    }
  }

  /**
   * Check focus management
   */
  private checkFocusManagement(): void {
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    let issuesFound = 0;

    focusableElements.forEach(element => {
      const style = window.getComputedStyle(element);
      
      // Check for removed focus indicators
      if (style.outline === 'none' && !style.boxShadow && !style.border) {
        this.addIssue({
          severity: 'warning',
          type: 'missing-focus-indicator',
          element: element as HTMLElement,
          description: 'Element may be missing visible focus indicator',
          recommendation: 'Ensure all focusable elements have visible focus indicators',
          wcagCriterion: 'WCAG 2.4.7 (Level AA)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Focus management - Focus indicators are properly implemented');
    }
  }

  /**
   * Check semantic structure
   */
  private checkSemanticStructure(): void {
    let issuesFound = 0;

    // Check for proper landmarks
    const hasMain = document.querySelector('main, [role="main"]');
    const hasNav = document.querySelector('nav, [role="navigation"]');
    const hasHeader = document.querySelector('header, [role="banner"]');

    if (!hasMain) {
      this.addIssue({
        severity: 'warning',
        type: 'missing-main-landmark',
        element: document.body,
        description: 'No main landmark found',
        recommendation: 'Add a <main> element or role="main" to identify the main content area',
        wcagCriterion: 'WCAG 1.3.1 (Level A)'
      });
      issuesFound++;
    }

    // Check for list semantics
    const listsWithoutUl = document.querySelectorAll('div.list, div.menu');
    listsWithoutUl.forEach(element => {
      if (!element.getAttribute('role')) {
        this.addIssue({
          severity: 'info',
          type: 'semantic-list',
          element: element as HTMLElement,
          description: 'Div used for list-like content',
          recommendation: 'Consider using <ul> or adding appropriate ARIA role',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Semantic structure - Proper HTML semantics used');
    }
  }

  /**
   * Check card system accessibility
   */
  private checkCardAccessibility(): void {
    const cards = document.querySelectorAll('.card, .player-card, .lobby-card, .deal-card, .board-card, .chat-card, .action-card, .stats-card, .modal-card');
    let issuesFound = 0;

    cards.forEach(card => {
      // Check if interactive cards have proper roles
      const isClickable = card.classList.contains('card-clickable') || card.hasAttribute('onclick');
      const hasRole = card.getAttribute('role');
      const hasTabIndex = card.hasAttribute('tabindex');

      if (isClickable && !hasRole) {
        this.addIssue({
          severity: 'warning',
          type: 'interactive-card-missing-role',
          element: card as HTMLElement,
          description: 'Interactive card missing ARIA role',
          recommendation: 'Add role="button" or appropriate ARIA role for interactive cards',
          wcagCriterion: 'WCAG 4.1.2 (Level A)'
        });
        issuesFound++;
      }

      if (isClickable && !hasTabIndex) {
        this.addIssue({
          severity: 'error',
          type: 'interactive-card-not-focusable',
          element: card as HTMLElement,
          description: 'Interactive card not keyboard focusable',
          recommendation: 'Add tabindex="0" to make interactive cards keyboard accessible',
          wcagCriterion: 'WCAG 2.1.1 (Level A)'
        });
        issuesFound++;
      }

      // Check for proper labeling
      const hasAccessibleName = this.hasAccessibleLabel(card as HTMLElement);
      if (isClickable && !hasAccessibleName) {
        this.addIssue({
          severity: 'error',
          type: 'card-missing-label',
          element: card as HTMLElement,
          description: 'Interactive card missing accessible name',
          recommendation: 'Add aria-label or aria-labelledby to describe the card\'s purpose',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Card system accessibility - All cards are properly accessible');
    }
  }

  /**
   * Check interactive elements
   */
  private checkInteractiveElements(): void {
    const buttons = document.querySelectorAll('button, [role="button"]');
    const links = document.querySelectorAll('a');
    let issuesFound = 0;

    // Check buttons
    buttons.forEach(button => {
      if (!button.textContent?.trim() && !this.hasAccessibleLabel(button as HTMLElement)) {
        this.addIssue({
          severity: 'error',
          type: 'empty-button',
          element: button as HTMLElement,
          description: 'Button has no accessible text content',
          recommendation: 'Add text content or aria-label to describe button purpose',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }
    });

    // Check links
    links.forEach(link => {
      const href = link.getAttribute('href');
      const hasText = link.textContent?.trim();
      const hasLabel = this.hasAccessibleLabel(link as HTMLElement);

      if (!hasText && !hasLabel) {
        this.addIssue({
          severity: 'error',
          type: 'empty-link',
          element: link as HTMLElement,
          description: 'Link has no accessible text content',
          recommendation: 'Add text content or aria-label to describe link purpose',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }

      if (href && href.startsWith('javascript:')) {
        this.addIssue({
          severity: 'warning',
          type: 'javascript-link',
          element: link as HTMLElement,
          description: 'Link uses javascript: protocol',
          recommendation: 'Consider using button element for JavaScript actions',
          wcagCriterion: 'WCAG 4.1.2 (Level A)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Interactive elements - All buttons and links are properly implemented');
    }
  }

  /**
   * Check form accessibility
   */
  private checkFormAccessibility(): void {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select, textarea');
    let issuesFound = 0;

    inputs.forEach(input => {
      const type = input.getAttribute('type');
      const hasLabel = this.hasAccessibleLabel(input as HTMLElement);
      const isRequired = input.hasAttribute('required');
      const hasRequiredIndicator = input.getAttribute('aria-required') === 'true' || 
                                  input.closest('label')?.textContent?.includes('*');

      if (!hasLabel && type !== 'hidden') {
        this.addIssue({
          severity: 'error',
          type: 'input-missing-label',
          element: input as HTMLElement,
          description: 'Form input missing label',
          recommendation: 'Associate input with label element or add aria-label',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }

      if (isRequired && !hasRequiredIndicator) {
        this.addIssue({
          severity: 'warning',
          type: 'missing-required-indicator',
          element: input as HTMLElement,
          description: 'Required field not clearly indicated',
          recommendation: 'Add aria-required="true" or visual indicator for required fields',
          wcagCriterion: 'WCAG 1.3.1 (Level A)'
        });
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      this.passedChecks.push('Form accessibility - All form elements are properly labeled');
    }
  }

  /**
   * Check if element has accessible label
   */
  private hasAccessibleLabel(element: HTMLElement): boolean {
    // Check aria-label
    if (element.getAttribute('aria-label')) return true;
    
    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy && document.getElementById(labelledBy)) return true;
    
    // Check for associated label
    const id = element.id;
    if (id && document.querySelector(`label[for="${id}"]`)) return true;
    
    // Check if wrapped in label
    if (element.closest('label')) return true;
    
    // Check for title attribute (less preferred)
    if (element.getAttribute('title')) return true;
    
    return false;
  }

  /**
   * Add issue to the list
   */
  private addIssue(issue: AccessibilityIssue): void {
    this.issues.push(issue);
  }

  /**
   * Calculate overall accessibility score
   */
  private calculateAccessibilityScore(): number {
    const totalChecks = this.issues.length + this.passedChecks.length;
    if (totalChecks === 0) return 100;

    const errorWeight = 10;
    const warningWeight = 5;
    const infoWeight = 1;

    const totalDeductions = this.issues.reduce((sum, issue) => {
      switch (issue.severity) {
        case 'error': return sum + errorWeight;
        case 'warning': return sum + warningWeight;
        case 'info': return sum + infoWeight;
        default: return sum;
      }
    }, 0);

    const maxPossibleScore = totalChecks * errorWeight;
    const score = Math.max(0, ((maxPossibleScore - totalDeductions) / maxPossibleScore) * 100);
    
    return Math.round(score);
  }

  /**
   * Generate accessibility report
   */
  generateReport(): AccessibilityReport {
    return {
      score: this.calculateAccessibilityScore(),
      issues: this.issues,
      passedChecks: this.passedChecks,
      summary: {
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        info: this.issues.filter(i => i.severity === 'info').length
      }
    };
  }

  /**
   * Auto-fix basic accessibility issues
   */
  autoFixBasicIssues(): number {
    let fixedCount = 0;

    // Fix missing alt text for decorative images
    const decorativeImages = document.querySelectorAll('img:not([alt]):not([aria-label])');
    decorativeImages.forEach(img => {
      // If image is in a decorative context, add role="presentation"
      if (img.closest('.decoration, .background, .icon') || img.classList.contains('decorative')) {
        img.setAttribute('role', 'presentation');
        img.setAttribute('alt', '');
        fixedCount++;
      }
    });

    // Fix missing tabindex for interactive elements
    const interactiveElements = document.querySelectorAll('.card-clickable, [onclick]');
    interactiveElements.forEach(element => {
      if (!element.hasAttribute('tabindex') && !element.hasAttribute('role')) {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        fixedCount++;
      }
    });

    return fixedCount;
  }
}

// Export singleton instance
export const accessibilityTester = new AccessibilityTester();
export default AccessibilityTester;
