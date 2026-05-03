"use client";

import { useState } from "react";
import JSZip from "jszip";
import { DownloadCloud } from "lucide-react";

export default function DownloadZipButton({ urls, taxonomyPath, specificShotNumber }: { urls: string[], taxonomyPath: string, specificShotNumber: number | null }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            
            // Format folder name from taxonomy path
            const folderName = taxonomyPath.replace(/\s*>\s*/g, ' - ').replace(/[^a-zA-Z0-9 -]/g, '');

            const promises = urls.map(async (url, index) => {
                const response = await fetch(url);
                const blob = await response.blob();
                
                // Determine shot number
                let shotNum = index + 1;
                if (specificShotNumber) {
                    shotNum = specificShotNumber; // if single shot, use that number
                }

                zip.file(`${folderName}/shoot${shotNum}.jpg`, blob);
            });

            await Promise.all(promises);

            const content = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = zipUrl;
            a.download = `${folderName}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(zipUrl);

        } catch (error) {
            console.error("Failed to download ZIP:", error);
            alert("Errore durante il download. Riprova.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (urls.length === 0) return null;

    return (
        <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '6px 12px', 
                background: isDownloading ? 'rgba(255,255,255,0.1)' : 'rgba(0, 210, 255, 0.1)', 
                border: `1px solid ${isDownloading ? 'rgba(255,255,255,0.2)' : 'rgba(0, 210, 255, 0.3)'}`, 
                color: isDownloading ? '#888' : '#00d2ff', 
                borderRadius: '8px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                cursor: isDownloading ? 'not-allowed' : 'pointer', 
                transition: 'all 0.2s' 
            }}
        >
            <DownloadCloud size={14} />
            {isDownloading ? 'Creazione ZIP...' : 'Scarica Tutto (ZIP)'}
        </button>
    );
}
