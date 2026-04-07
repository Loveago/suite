import { Suspense } from 'react';
import BookingConfirmedClient from './BookingConfirmedClient';

export default function BookingConfirmedPage() {
  return (
    <Suspense>
      <BookingConfirmedClient />
    </Suspense>
  );
}
