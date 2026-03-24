'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/api';

interface ExchangeRateResponse {
  ghsPerUsd: number;
  source: string;
  updatedAt: string;
}

interface PriceWithUsdProps {
  amount: number;
  className?: string;
  usdClassName?: string;
  suffix?: string;
}

let cachedGhsPerUsd: number | null = null;
let rateRequest: Promise<number> | null = null;

const formatUsd = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

const loadExchangeRate = async () => {
  if (cachedGhsPerUsd) {
    return cachedGhsPerUsd;
  }

  if (!rateRequest) {
    rateRequest = fetch('/api/exchange-rate')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load exchange rate');
        }

        const data = (await response.json()) as ExchangeRateResponse;

        if (!data.ghsPerUsd || !Number.isFinite(data.ghsPerUsd) || data.ghsPerUsd <= 0) {
          throw new Error('Invalid exchange rate response');
        }

        cachedGhsPerUsd = data.ghsPerUsd;
        return data.ghsPerUsd;
      })
      .finally(() => {
        rateRequest = null;
      });
  }

  return rateRequest;
};

export default function PriceWithUsd({ amount, className, usdClassName, suffix }: PriceWithUsdProps) {
  const [ghsPerUsd, setGhsPerUsd] = useState<number | null>(cachedGhsPerUsd);

  useEffect(() => {
    let cancelled = false;

    loadExchangeRate()
      .then((rate) => {
        if (!cancelled) {
          setGhsPerUsd(rate);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGhsPerUsd(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const usdText = useMemo(() => {
    if (!ghsPerUsd || ghsPerUsd <= 0) {
      return null;
    }

    return formatUsd(amount / ghsPerUsd);
  }, [amount, ghsPerUsd]);

  return (
    <span className={className}>
      {formatCurrency(amount)}
      {usdText ? <span className={usdClassName}>{` (${usdText})`}</span> : null}
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}
