import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get('supernexus_admin_auth');
    const isAdminPasskey = adminAuthCookie && adminAuthCookie.value === 'authenticated';

    if (!isAdminPasskey) {
      if (!user || !user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
      if (!dbUser || dbUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await req.json();
    console.log('[UPDATE-BUTTON-COVER] Incoming payload:', body);
    const { type, categorySlug, modeName, subName, imageUrl, clientGender, specificShotNumber } = body;

    if (!categorySlug || !imageUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (type === 'IMAGE_TYPE') {
        const bm = await prisma.businessMode.findFirst({
            where: { category: { slug: categorySlug }, name: modeName }
        });
        if (bm) {
            await prisma.businessMode.update({ where: { id: bm.id }, data: { cover_image: imageUrl } });
            return NextResponse.json({ success: true, message: 'BusinessMode updated' });
        }
        return NextResponse.json({ error: 'BusinessMode not found' }, { status: 404 });
    } 
    else if (type === 'MODEL_OPTION') {
        const sub = await prisma.subcategory.findFirst({
            where: { name: subName, business_mode: { name: modeName, category: { slug: categorySlug } } }
        });
        if (sub) {
            await prisma.subcategory.update({ where: { id: sub.id }, data: { preview_image: imageUrl } });
            return NextResponse.json({ success: true, message: 'Subcategory updated' });
        }
        return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }
    else if (type === 'CLIENT_TYPE') {
        // Find existing shot 1
        let normMode = modeName.toLowerCase();
        if (normMode.includes('ads') || normMode.includes('scroll stopper')) normMode = 'ads';
        else if (normMode.includes('detail') || normMode.includes('texture')) normMode = 'detail';
        else normMode = normMode.replace(/\s+/g, '-');

        let normPres = subName.toLowerCase().trim();
        if (normPres.includes('ugc in home') && clientGender === 'WOMAN') { normMode = 'ugc-home'; normPres = 'candid-woman'; }
        else if (normPres.includes('ugc in store') && clientGender === 'WOMAN') { normMode = 'ugc-store'; normPres = 'candid-woman'; }
        else if (normPres.includes('ugc in home') && clientGender === 'MAN') { normMode = 'ugc-home'; normPres = 'candid-man'; }
        else if (normPres.includes('ugc in store') && clientGender === 'MAN') { normMode = 'ugc-store'; normPres = 'candid-man'; }
        else if (normPres === 'ugc in home') { normMode = 'ugc-home'; normPres = 'candid-woman'; }
        else if (normPres === 'ugc in store') { normMode = 'ugc-store'; normPres = 'candid-woman'; }
        else if (normPres.includes('candid') && clientGender === 'WOMAN') normPres = 'candid-woman';
        else if (normPres.includes('candid') && clientGender === 'MAN') normPres = 'candid-man';
        else if (normPres === 'candid') normPres = clientGender === 'MAN' ? 'candid-man' : 'candid-woman';
        else if (normPres === 'model photo') normPres = clientGender === 'MAN' ? 'model-photo-man' : 'model-photo-woman';
        else if (normPres.includes('curvy') || normPres.includes('plus-size')) normPres = 'curvy';
        else if (normPres.includes('still life')) normPres = 'still-life-pack';
        else if (normPres.includes('ugc creator pack')) normPres = 'ugc-creator-pack';
        else if (normPres === 'no model') normPres = 'no-model';
        else normPres = normPres.replace(/\s+/g, '-');

        const targetShotNumber = specificShotNumber || 1;
        const existingShot = await prisma.promptConfigShot.findFirst({
            where: { category: categorySlug, mode: normMode, presentation: normPres, shotNumber: targetShotNumber }
        });

        if (existingShot) {
            await prisma.promptConfigShot.update({
                where: { id: existingShot.id },
                data: { imageUrl }
            });
        } else {
            // Create a dummy shot 1
            await prisma.promptConfigShot.create({
                data: {
                    category: categorySlug,
                    mode: normMode,
                    presentation: normPres,
                    shotNumber: targetShotNumber,
                    shotName: 'Fallback Cover',
                    positivePrompt: 'Fallback cover image generated by admin',
                    negativePrompt: '',
                    hardRules: '',
                    imageUrl,
                    isActive: true,
                    priority: 1
                }
            });
        }
        return NextResponse.json({ success: true, message: 'Client type shot updated' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error("Error updating button cover:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
