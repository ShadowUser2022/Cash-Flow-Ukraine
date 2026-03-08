import React, { useState, useEffect } from 'react';
import { validateInput, sanitizeInput, formatErrorMessages, type ValidationRule } from '../../utils/validation';
import './ValidatedInput.css';

interface ValidatedInputProps {
  id?: string;
  type?: 'text' | 'number' | 'gameId';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  validationRules?: ValidationRule;
  className?: string;
  maxLength?: number;
  disabled?: boolean;
  label?: string;
  showErrorIcon?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onValidationChange,
  validationRules,
  className = '',
  maxLength,
  disabled = false,
  label,
  showErrorIcon = true,
  validateOnBlur = true,
  validateOnChange = false,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const performValidation = (inputValue: string) => {
    if (!validationRules) {
      setErrors([]);
      setIsValid(true);
      onValidationChange?.(true, []);
      return;
    }

    const result = validateInput(inputValue, validationRules);
    setErrors(result.errors);
    setIsValid(result.isValid);
    onValidationChange?.(result.isValid, result.errors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue, type);
    
    onChange(sanitizedValue);

    if (validateOnChange) {
      setIsTouched(true);
      performValidation(sanitizedValue);
    }
  };

  const handleBlur = () => {
    if (validateOnBlur) {
      setIsTouched(true);
      performValidation(value);
    }
  };

  const handleFocus = () => {
    setIsTouched(true);
  };

  useEffect(() => {
    if (isTouched || validateOnChange) {
      performValidation(value);
    }
  }, [value, validationRules, isTouched, validateOnChange]);

  const shouldShowErrors = isTouched && errors.length > 0;
  const inputClassName = `
    validated-input 
    ${className} 
    ${shouldShowErrors ? 'error' : ''} 
    ${isValid && isTouched ? 'valid' : ''}
  `.trim();

  return (
    <div className="validated-input-container">
      {label && (
        <label htmlFor={id} className="validated-input-label">
          {label}
          {validationRules?.required && <span className="required-asterisk">*</span>}
        </label>
      )}
      
      <div className="validated-input-wrapper">
        <input
          id={id}
          type={type === 'gameId' ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={inputClassName}
          maxLength={maxLength}
          disabled={disabled}
        />
        
        {showErrorIcon && shouldShowErrors && (
          <div className="validation-icon error-icon">⚠️</div>
        )}
        
        {showErrorIcon && isValid && isTouched && (
          <div className="validation-icon success-icon">✅</div>
        )}
      </div>

      {shouldShowErrors && (
        <div className="validation-errors">
          {errors.map((error, index) => (
            <div key={index} className="validation-error">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
