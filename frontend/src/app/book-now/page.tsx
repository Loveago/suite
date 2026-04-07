import { Suspense } from 'react';
import BookNowClient from './BookNowClient';

export default function BookNowPage() {
  return (
    <Suspense>
      <BookNowClient />
    </Suspense>
  );
}
