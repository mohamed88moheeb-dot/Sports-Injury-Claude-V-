'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadCourse } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace(loadCourse() ? '/today' : '/start'); }, [router]);
  return null;
}
