"use client";

import { useState } from "react";
import Image from "next/image";
import { verifyPinForTopup } from "./actions";
import TopupCheckout from "./TopupCheckout";

export default function RicaricaPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // User state
    const [user, setUser] = useState<{ email: string | null; remaining: number } | null>(null);
    const [selectedPackage, setSelectedPackage] = useState("topup_150");
    const [success, setSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await verifyPinForTopup(pin);
            if (res.error) {
                setError(res.error);
            } else if (res.success && res.user) {
                setUser(res.user);
            }
        } catch (err) {
            setError("Errore di connessione.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans tracking-tight">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-4xl text-white font-bold mb-4">Ricarica Eseguita!</h1>
                <p className="text-gray-400 mb-8 max-w-md">I tuoi crediti sono stati aggiunti istantaneamente. Puoi tornare su Telegram e ricominciare subito a generare immagini!</p>
                <a href="https://t.me/SuperNexusBot" target="_blank" rel="noopener noreferrer" className="bg-cyan-500 text-black px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors">
                    Torna a Telegram
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-16 px-6 font-sans">
            <div className="w-full max-w-md">
                
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Ricarica Crediti</h1>
                    <p className="text-gray-400 mt-2 text-center text-sm">Aggiungi potenza di calcolo istantanea al tuo abbonamento SuperNexus.</p>
                </div>

                {!user ? (
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
                        <h2 className="text-xl font-semibold mb-6">Accesso Sicuro</h2>
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Il tuo PIN Bot</label>
                                <input 
                                    type="text" 
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Es: 123456" 
                                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    required
                                />
                            </div>
                            
                            {error && <div className="text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">{error}</div>}
                            
                            <button 
                                type="submit" 
                                disabled={loading || pin.length < 5}
                                className="w-full bg-white text-black font-bold py-3 rounded-xl mt-2 disabled:opacity-50 transition-transform active:scale-95"
                            >
                                {loading ? "Verifica in corso..." : "Verifica Account"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account</p>
                                <p className="font-medium text-gray-300">{user.email || "Utente Anonimo"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Credito Residuo</p>
                                <p className={`font-bold text-lg ${user.remaining < 10 ? 'text-red-500' : 'text-cyan-400'}`}>{user.remaining} foto</p>
                            </div>
                        </div>

                        <h2 className="text-lg font-bold mb-4">Seleziona il Pacchetto</h2>
                        
                        <div className="flex flex-col gap-3 mb-6">
                            <label className={`relative border rounded-xl p-4 cursor-pointer transition-all ${selectedPackage === 'topup_150' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 hover:border-gray-600'}`}>
                                <input type="radio" name="package" value="topup_150" checked={selectedPackage === 'topup_150'} onChange={() => setSelectedPackage("topup_150")} className="sr-only" />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">Booster 150 <span className="text-xs text-cyan-400 bg-cyan-400/20 px-2 py-0.5 rounded-full ml-2">Standard</span></p>
                                        <p className="text-xs text-gray-400 mt-1">150 Immagini extra immediate</p>
                                    </div>
                                    <p className="font-bold">€ 9,90</p>
                                </div>
                            </label>

                            <label className={`relative border rounded-xl p-4 cursor-pointer transition-all ${selectedPackage === 'topup_500' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 hover:border-gray-600'}`}>
                                <input type="radio" name="package" value="topup_500" checked={selectedPackage === 'topup_500'} onChange={() => setSelectedPackage("topup_500")} className="sr-only" />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">Booster 500</p>
                                        <p className="text-xs text-gray-400 mt-1">500 Immagini extra immediate</p>
                                    </div>
                                    <p className="font-bold">€ 19,90</p>
                                </div>
                            </label>
                        </div>

                        <TopupCheckout 
                            pin={pin} 
                            packageId={selectedPackage} 
                            onSuccess={() => setSuccess(true)} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
