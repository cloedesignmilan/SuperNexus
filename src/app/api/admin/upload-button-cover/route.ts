import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminAuthCookie = cookieStore.get('supernexus_admin_auth');
    const isAdminPasskey = adminAuthCookie && adminAuthCookie.value === 'authenticated';

    if (!isAdminPasskey) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const categorySlug = formData.get('categorySlug') as string;
    const modeName = formData.get('modeName') as string;
    const subName = formData.get('subName') as string;
    const specificShotNumber = formData.get('specificShotNumber') ? parseInt(formData.get('specificShotNumber') as string) : undefined;
    const clientGender = formData.get('clientGender') as string;

    if (!file || !type || !categorySlug) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Upload using Service Role to bypass RLS for Admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminSupabase = createSupabaseClient(supabaseUrl, supabaseKey);

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // WebP Optimization
    const optimizedBuffer = await sharp(buffer)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

    const cleanMode = modeName ? modeName.replace(/[^a-zA-Z0-9]/g, '') : '';
    const cleanSub = subName ? subName.replace(/[^a-zA-Z0-9]/g, '') : '';
    const oFileName = `UI_COVER_${categorySlug}_${type}_${cleanMode}_${cleanSub}_${Date.now()}.webp`;

    const { error: upErr } = await adminSupabase.storage.from('telegram-outputs').upload(oFileName, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: true
    });

    if (upErr) throw upErr;

    const { data: { publicUrl: imageUrl } } = adminSupabase.storage.from('telegram-outputs').getPublicUrl(oFileName);

    // Adesso applichiamo l'URL al database
    if (type === 'IMAGE_TYPE') {
        const bm = await prisma.businessMode.findFirst({
            where: { category: { slug: categorySlug }, name: modeName }
        });
        if (bm) {
            await prisma.businessMode.update({ where: { id: bm.id }, data: { cover_image: imageUrl } });
            return NextResponse.json({ success: true, imageUrl });
        }
        return NextResponse.json({ error: 'BusinessMode not found' }, { status: 404 });
    } 
    else if (type === 'MODEL_OPTION') {
        const sub = await prisma.subcategory.findFirst({
            where: { name: subName, business_mode: { name: modeName, category: { slug: categorySlug } } }
        });
        if (sub) {
            await prisma.subcategory.update({ where: { id: sub.id }, data: { preview_image: imageUrl } });
            return NextResponse.json({ success: true, imageUrl });
        }
        return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }
    else if (type === 'CLIENT_TYPE' || type === 'SPECIFIC_SHOT') {
        let normMode = modeName.toLowerCase();
        if (normMode.includes('ads') || normMode.includes('scroll stopper')) normMode = 'ads';
        else if (normMode.includes('detail') || normMode.includes('texture')) normMode = 'detail';
        else normMode = normMode.replace(/\s+/g, '-');

        let normPres = subName.toLowerCase().trim();
        if (normPres.includes('ugc in home') && clientGender === 'Woman') { normMode = 'ugc-home'; normPres = 'candid-woman'; }
        else if (normPres.includes('ugc in store') && clientGender === 'Woman') { normMode = 'ugc-store'; normPres = 'candid-woman'; }
        else if (normPres.includes('ugc in home') && clientGender === 'Man') { normMode = 'ugc-home'; normPres = 'candid-man'; }
        else if (normPres.includes('ugc in store') && clientGender === 'Man') { normMode = 'ugc-store'; normPres = 'candid-man'; }
        else if (normPres === 'ugc in home') { normMode = 'ugc-home'; normPres = 'candid-woman'; }
        else if (normPres === 'ugc in store') { normMode = 'ugc-store'; normPres = 'candid-woman'; }
        else if (normPres.includes('candid') && clientGender === 'Woman') normPres = 'candid-woman';
        else if (normPres.includes('candid') && clientGender === 'Man') normPres = 'candid-man';
        else if (normPres === 'candid') normPres = clientGender === 'Man' ? 'candid-man' : 'candid-woman';
        else if (normPres === 'model photo') normPres = clientGender === 'Man' ? 'model-photo-man' : 'model-photo-woman';
        else if (normPres.includes('curvy') || normPres.includes('plus-size')) normPres = clientGender === 'Man' ? 'curvy-man' : 'curvy-woman';
        else if (normPres.includes('still life')) normPres = clientGender === 'Man' ? 'still-life-pack-man' : 'still-life-pack-woman';
        else if (normPres.includes('ugc creator pack')) normPres = 'ugc-creator-pack';
        else if (normPres === 'no model') normPres = clientGender === 'Man' ? 'no-model-man' : 'no-model-woman';
        else normPres = normPres.replace(/\s+/g, '-');

        const targetShotNumber = specificShotNumber || 1;
        const existingShots = await prisma.promptConfigShot.findMany({
            where: { category: categorySlug, mode: normMode, presentation: normPres, shotNumber: targetShotNumber }
        });

        if (existingShots.length > 0) {
            for (const existingShot of existingShots) {
                await prisma.promptConfigShot.update({
                    where: { id: existingShot.id },
                    data: { imageUrl }
                });
            }
        } else {
            await prisma.promptConfigShot.create({
                data: {
                    category: categorySlug,
                    mode: normMode,
                    presentation: normPres,
                    shotNumber: targetShotNumber,
                    shotName: 'Cover da Assets UI',
                    positivePrompt: 'Fallback cover image generated by admin',
                    negativePrompt: '',
                    hardRules: '',
                    imageUrl,
                    isActive: true,
                    priority: 1
                }
            });
        }
        return NextResponse.json({ success: true, imageUrl });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error("Error uploading button cover:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
