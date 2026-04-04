import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Initialize the Supabase client avoiding errors during build time if envs are missing
export const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

export async function uploadImageToSupabase(base64Data: string, filename: string): Promise<string | null> {
    if (!supabase) throw new Error("Supabase client non inizializzato. Controlla le chiavi.");

    const buffer = Buffer.from(base64Data, "base64");

    const { data, error } = await supabase
        .storage
        .from('supernexus')
        .upload(filename, buffer, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (error) {
        console.error("Storage upload error:", error);
        return null;
    }

    const { data: publicUrlData } = supabase
        .storage
        .from('supernexus')
        .getPublicUrl(filename);

    return publicUrlData.publicUrl;
}
