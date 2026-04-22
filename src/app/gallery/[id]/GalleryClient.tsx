"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, CheckCircle, Sparkles, X, ChevronLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface GalleryClientProps {
  jobId: string;
  originalImage: string;
  generatedImages: any[];
  styleName: string;
  categoryName: string;
}

export default function GalleryClient({ jobId, originalImage, generatedImages, styleName, categoryName }: GalleryClientProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleDownload = async (url: string, id: string) => {
    setDownloading(id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `supernexus-ai-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Error downloading image:", e);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00f0ff] selection:text-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer transition-all">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#00f0ff] transition-all">
            <Sparkles className="w-4 h-4 text-white group-hover:text-[#00f0ff]" />
          </div>
          <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            SuperNexus AI
          </span>
        </Link>
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
              <CheckCircle className="w-4 h-4 text-[#00f0ff]" />
              <span>Ready to use</span>
            </div>
            <a href="/" className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors">
              Generate More
            </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 lg:pt-20">
        
        {/* Title Section */}
        <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Premium Output</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Your New <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#3b82f6] to-[#8b5cf6]">
               AI Product Campaign
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">
            High-converting imagery generated specifically for {categoryName} using our {styleName} style.
          </p>
        </div>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar: Original Image */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-32">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-zinc-300 font-medium mb-4">
                  <ImageIcon className="w-4 h-4" />
                  Original Photo
                </div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <Image 
                    src={originalImage} 
                    alt="Original Product" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Category</span>
                    <span className="text-zinc-200 font-medium">{categoryName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Style</span>
                    <span className="text-zinc-200 font-medium">{styleName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Photos</span>
                    <span className="text-zinc-200 font-medium">{generatedImages.length}</span>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-[#00f0ff]/5 border border-[#00f0ff]/10">
                  <p className="text-xs text-[#00f0ff]/80 leading-relaxed">
                    <strong className="text-[#00f0ff] font-semibold">Note:</strong> These images will only be available for a few hours. Please use the free download option if you wish to keep them.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Masonry/Grid of Generated Images */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {generatedImages.map((img) => (
                <div key={img.id} className="group relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/30 transition-all shadow-2xl">
                  <Image 
                    src={img.image_url} 
                    alt="AI Generated" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setFullscreenImage(img.image_url)}
                        className="text-sm font-medium text-white hover:text-[#00f0ff] transition-colors"
                      >
                        View Full
                      </button>
                      <button 
                        onClick={() => handleDownload(img.image_url, img.id)}
                        disabled={downloading === img.id}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#00f0ff] transition-colors disabled:opacity-50"
                      >
                        {downloading === img.id ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-200">
           <button 
             onClick={() => setFullscreenImage(null)}
             className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
           >
             <X className="w-6 h-6" />
           </button>
           <div className="relative w-full max-w-4xl max-h-[90vh] aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <Image 
                src={fullscreenImage} 
                alt="Fullscreen Preview" 
                fill 
                className="object-contain"
              />
           </div>
        </div>
      )}

    </div>
  );
}
