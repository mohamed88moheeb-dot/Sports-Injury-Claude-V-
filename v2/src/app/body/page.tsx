import { Suspense } from 'react';
import BodyView from './BodyView';

export const metadata = { title: 'Body · ROYO' };

export default function Body() {
  return (
    <>
      <h1>Your body</h1>
      <p className="sub">Tap a structure to learn about it. Exercises link here to show the muscle they work.</p>
      <Suspense><BodyView /></Suspense>
    </>
  );
}
