'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
    const slug = formData.get('slug') as string;
    const password = formData.get('password') as string;

    if (!slug || !password) {
        return { error: 'Inserisci il nome del negozio e la password' };
    }

    // Format the slug (lowercase, replace spaces with hyphens just in case)
    const formattedSlug = slug.toLowerCase().replace(/ +/g, '-');

    const store = await prisma.store.findFirst({
        where: {
            OR: [
                { slug: formattedSlug },
                { name: { equals: slug, mode: 'insensitive' } } // Fallback to exact name match
            ]
        }
    });

    if (!store) {
        return { error: 'Negozio non trovato. Verifica il nome esatto.' };
    }

    if (store.password !== password) {
        return { error: 'Password errata.' };
    }

    // Imposta il cookie di sessione
    const cookieStore = await cookies();
    cookieStore.set('store_session', store.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 settimana
    });

    redirect('/portal');
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('store_session');
    redirect('/portal/login');
}
