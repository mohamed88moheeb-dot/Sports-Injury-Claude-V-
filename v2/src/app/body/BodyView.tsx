'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// WebGL only runs in the browser.
const Anatomy3D = dynamic(() => import('@/components/anatomy3d/Anatomy3D'), { ssr: false });

export default function BodyView() {
  const focus = useSearchParams().get('focus') ?? undefined;
  return <div className="body3d"><Anatomy3D focus={focus} /></div>;
}
