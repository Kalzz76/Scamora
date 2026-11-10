import React, { useRef, useEffect } from 'react';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  className = '',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value string into array of chars with length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawChar = e.target.value;
    // Only accept numeric digit
    const cleaned = rawChar.replace(/\D/g, '');

    if (!cleaned) {
      // Clear this digit
      const nextArr = [...digits];
      nextArr[index] = '';
      onChange(nextArr.join(''));
      return;
    }

    // If pasted or typed multiple digits
    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, length);
      onChange(pasteDigits);
      const targetIndex = Math.min(pasteDigits.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    const nextArr = [...digits];
    nextArr[index] = cleaned[0];
    const newCombined = nextArr.join('');
    onChange(newCombined);

    // Auto-focus next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box and clear it
        inputRefs.current[index - 1]?.focus();
        const nextArr = [...digits];
        nextArr[index - 1] = '';
        onChange(nextArr.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (pastedText) {
      onChange(pastedText);
      const focusIndex = Math.min(pastedText.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length} // Allow paste to catch in change
          disabled={disabled}
          value={digits[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-10 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl sm:text-2xl text-[#14161c] bg-[#faf8f5] border-2 border-[#d9d6d0] rounded-xl focus:border-[#0f9b8a] focus:bg-white focus:ring-4 focus:ring-[#0f9b8a]/15 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
        />
      ))}
    </div>
  );
};

