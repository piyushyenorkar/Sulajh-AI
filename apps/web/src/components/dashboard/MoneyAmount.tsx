import React from 'react';

interface MoneyAmountProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  type?: 'neutral' | 'credit' | 'debit';
  currency?: string;
}

export function formatIndianCurrency(num: number): string {
  const parts = num.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }

  // Indian number grouping: last 3 digits, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return (isNegative ? '-' : '') + formattedInteger + (decimalPart !== '00' ? `.${decimalPart}` : '');
}

export const MoneyAmount: React.FC<MoneyAmountProps> = ({
  amount,
  className = '',
  showSign = false,
  type = 'neutral',
  currency = '₹',
}) => {
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  let colorClass = 'text-slate-900';
  if (type === 'credit') colorClass = 'text-emerald-600';
  if (type === 'debit') colorClass = 'text-rose-600';

  const signStr = showSign ? (isPositive ? '+' : isNegative ? '-' : '') : '';
  const displayVal = formatIndianCurrency(Math.abs(amount));

  return (
    <span className={`tabular-nums font-semibold tracking-tight ${colorClass} ${className}`}>
      {signStr}{currency}{displayVal}
    </span>
  );
};
