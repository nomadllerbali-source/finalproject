export const handleNumericInput = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

export const handleDecimalInput = (value: string): string => {
  const parts = value.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return value.replace(/[^0-9.]/g, '');
};

export const numericInputProps = {
  inputMode: 'numeric' as const,
  pattern: '[0-9]*',
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }
};

export const decimalInputProps = {
  inputMode: 'decimal' as const,
  pattern: '[0-9.]*',
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;

    if (e.key === '.' && value.includes('.')) {
      e.preventDefault();
      return;
    }

    if (!/[0-9.]/.test(e.key)) {
      e.preventDefault();
    }
  }
};
