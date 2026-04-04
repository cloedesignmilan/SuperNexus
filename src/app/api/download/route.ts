import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Nessun URL fornito", { status: 400 });
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Errore fetch immagine: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        // Estraiamo il nome file simulato
        const filename = url.split("/").pop() || `supernexus_generation_${Date.now()}.jpg`;

        return new NextResponse(blob, {
            status: 200,
            headers: {
                "Content-Type": response.headers.get("content-type") || "image/jpeg",
                // Impone al browser di scaricare il file anziché visualizzarlo
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error("Errore Proxy Download Proxy:", error);
        return new NextResponse("Errore nello scaricamento del file", { status: 500 });
    }
}
