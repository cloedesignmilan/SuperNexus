"use server";

import { cookies } from 'next/headers';
import { Locale } from '@/lib/i18n/dictionaries';

export async function setLocale(locale: Locale) {
  cookies().set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
}
