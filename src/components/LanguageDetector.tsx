"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/app/actions/i18n';

export default function LanguageDetector({ hasCookie }: { hasCookie: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasCookie) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('it')) {
        setLocale('it').then(() => {
          router.refresh();
        });
      } else {
        setLocale('en').then(() => {
          // set 'en' cookie so we don't run this check again
        });
      }
    }
  }, [hasCookie, router]);

  return null;
}
