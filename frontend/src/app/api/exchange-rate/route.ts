import { NextResponse } from 'next/server';

const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_GHS_PER_USD = 15;

export async function GET() {
  try {
    const response = await fetch(EXCHANGE_RATE_URL, {
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`Exchange rate request failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };

    const ghsPerUsd = data.rates?.GHS;

    if (typeof ghsPerUsd !== 'number' || !Number.isFinite(ghsPerUsd) || ghsPerUsd <= 0) {
      throw new Error('Missing valid GHS exchange rate');
    }

    return NextResponse.json(
      {
        ghsPerUsd,
        source: 'open.er-api.com',
        updatedAt: data.time_last_update_utc ?? new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=900, stale-while-revalidate=3600',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        ghsPerUsd: FALLBACK_GHS_PER_USD,
        source: 'fallback',
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  }
}
