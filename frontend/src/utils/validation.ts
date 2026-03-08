// Utility functions for input validation

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateInput = (value: string, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  // Required check
  if (rules.required && (!value || value.trim().length === 0)) {
    errors.push('Це поле обов\'язкове для заповнення');
  }

  // Only validate other rules if value exists
  if (value && value.trim().length > 0) {
    // MinLength check
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Мінімальна довжина: ${rules.minLength} символів`);
    }

    // MaxLength check
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Максимальна довжина: ${rules.maxLength} символів`);
    }

    // Number validation
    if (rules.min !== undefined || rules.max !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push('Має бути числом');
      } else {
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`Мінімальне значення: ${rules.min}`);
        }
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`Максимальне значення: ${rules.max}`);
        }
      }
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push('Неправильний формат');
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      errors.push('Значення не пройшло перевірку');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Predefined validation rules
export const ValidationRules = {
  playerName: {
    required: true,
    minLength: 2,
    maxLength: 20,
    pattern: /^[a-zA-Zа-яіїєґА-ЯІЇЄҐ0-9\s]+$/,
  },
  gameId: {
    required: true,
    minLength: 6,
    maxLength: 6,
    pattern: /^[A-Z0-9]{6}$/,
  },
  offer: {
    required: true,
    min: 1,
  },
  cash: {
    required: true,
    min: 0,
  },
} as const;

// Helper function to sanitize input
export const sanitizeInput = (value: string, type: 'text' | 'number' | 'gameId' = 'text'): string => {
  if (type === 'gameId') {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  }
  
  if (type === 'number') {
    return value.replace(/[^0-9.]/g, '');
  }
  
  if (type === 'text') {
    return value.replace(/[<>]/g, ''); // Remove potential XSS characters
  }
  
  return value;
};

// Format error messages for display
export const formatErrorMessages = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};
