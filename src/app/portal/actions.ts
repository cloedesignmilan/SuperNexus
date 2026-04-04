'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function updateStoreTemplateAction(formData: FormData) {
    const cookieStore = await cookies();
    const session = cookieStore.get('store_session');
    if (!session?.value) redirect('/portal/login');

    let default_template_id: string | null = formData.get('default_template_id') as string;
    if (default_template_id === "") default_template_id = null;

    await prisma.store.update({
        where: { id: session.value },
        data: { default_template_id }
    });
}
