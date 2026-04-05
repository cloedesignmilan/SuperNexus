"use client";
import React, { useEffect, useRef } from "react";
import "./AnimatedTelegramMockup.css";

export default function AnimatedTelegramMockup() {
  return (
    <div className="phone-mockup">
      <div className="phone-notch"></div>
      
      {/* Header App */}
      <div className="telegram-app-header">
        <div className="header-back">{"<"}</div>
        <div className="header-title">
          <span className="logo-text">SuperNexus</span>
          <span className="bot-status">bot</span>
        </div>
        <div className="header-avatar">S</div>
      </div>

      {/* Finestra Chat */}
      <div className="chat-window">
        <div className="chat-content">
          
          {/* ------ INTERAZIONE 1: UOMO ------ */}
          
          {/* Messaggio 1: Utente invia foto */}
          <div className="msg-row msg-user fade-in" style={{ animationDelay: '1s' }}>
            <div className="msg-bubble">
              <img src="/4-a.jpeg" alt="Foto scattata in negozio" className="msg-photo" />
              <div className="msg-time">10:30 ✓✓</div>
            </div>
          </div>

          {/* Messaggio 2: Bot Analisi */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '2.5s' }}>
            <div className="avatar-bot">🤖</div>
            <div className="msg-bubble">
              <p><strong>Occhio dell'IA in corso...</strong><br/>Sto analizzando il capo ⏳</p>
              <div className="msg-time">10:30</div>
            </div>
          </div>

          {/* Messaggio 3: Bot Conferma */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '4s' }}>
            <div className="avatar-bot">🤖</div>
            <div className="msg-bubble">
              <p>Analisi Rapida Completata!<br/>Categoria: <strong>Completo Uomo / Business</strong><br/><br/>Vuoi procedere con la trasformazione?</p>
              <div className="bot-buttons multi-buttons">
                <button>📸 Genera 3 Immagini</button>
                <button>📸 Genera 5 Immagini</button>
                <button>📸 Genera 10 Immagini</button>
              </div>
              <div className="msg-time">10:31</div>
            </div>
          </div>

          {/* Messaggio 4: Utente sceglie genera */}
          <div className="msg-row msg-user fade-in" style={{ animationDelay: '5.5s' }}>
            <div className="msg-bubble text-only">
              📸 Genera 3 Immagini
              <div className="msg-time">10:31 ✓✓</div>
            </div>
          </div>

          {/* Messaggio 5: Bot Lavorazione */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '6s' }}>
            <div className="avatar-bot">🤖</div>
            <div className="msg-bubble">
              <p>Inizio Servizio Fotografico (3 foto)!<br/><em>L'IA sta dipingendo il tuo abito nelle scene Premium</em></p>
              <div className="msg-time">10:31</div>
            </div>
          </div>

          {/* Messaggio 6: Bot Fine - Risultato */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '9s' }}>
            <div className="avatar-bot">✨</div>
            <div className="msg-bubble highlight-bubble">
              <p><strong>PROCESSO COMPLETATO! 🎉</strong><br/>Ecco le scene esclusive generate per te:</p>
              <img src="/4-b.jpeg" alt="Risultato editoriale" className="msg-photo-result" />
              <div className="msg-time">10:32</div>
            </div>
          </div>


          {/* ------ INTERAZIONE 2: DONNA ------ */}

          {/* Messaggio 7: Utente invia foto 2 */}
          <div className="msg-row msg-user fade-in" style={{ animationDelay: '12s' }}>
            <div className="msg-bubble">
              <img src="/1-a.jpeg" alt="Seconda foto negozio" className="msg-photo" />
              <div className="msg-time">10:33 ✓✓</div>
            </div>
          </div>

          {/* Messaggio 8: Bot Analisi 2 */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '13.5s' }}>
            <div className="avatar-bot">🤖</div>
            <div className="msg-bubble">
              <p><strong>Occhio dell'IA in corso...</strong><br/>Sto guardando l'immagine ⏳</p>
              <div className="msg-time">10:33</div>
            </div>
          </div>

          {/* Messaggio 9: Bot Conferma 2 */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '15s' }}>
            <div className="avatar-bot">🤖</div>
            <div className="msg-bubble">
              <p>Analisi Rapida Completata!<br/>Penso si tratti di: <strong>Cerimonia e festa</strong>.<br/><br/>Tutto Confermato. Scegli quante immagini desideri generare:</p>
              <div className="bot-buttons multi-buttons">
                <button>📸 Genera 3 Immagini</button>
                <button>📸 Genera 5 Immagini</button>
                <button>📸 Genera 10 Immagini</button>
              </div>
              <div className="msg-time">10:33</div>
            </div>
          </div>

          {/* Messaggio 10: Utente sceglie genera 2 */}
          <div className="msg-row msg-user fade-in" style={{ animationDelay: '16.5s' }}>
            <div className="msg-bubble text-only">
              📸 Genera 5 Immagini
              <div className="msg-time">10:34 ✓✓</div>
            </div>
          </div>

          {/* Messaggio 11: Bot Lavorazione 2 */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '17s' }}>
            <div className="avatar-bot">🤖</div>
            <div className="msg-bubble">
              <p>Inizio Servizio Fotografico (5 foto)!<br/><em>L'IA sta dipingendo l'abito sul modello perfetto</em></p>
              <div className="msg-time">10:34</div>
            </div>
          </div>

          {/* Messaggio 12: Bot Fine - Risultato 2 */}
          <div className="msg-row msg-bot fade-in" style={{ animationDelay: '20s' }}>
            <div className="avatar-bot">✨</div>
            <div className="msg-bubble highlight-bubble">
              <p><strong>PROCESSO COMPLETATO! 🎉</strong><br/>Ecco le scene esclusive generate per te:</p>
              {/* L'utente voleva vedere bene la foto da donna, l'ho messa in grande */}
              <img src="/1-b.jpeg" alt="Risultato editoriale donna" className="msg-photo-result" style={{ width: '220px' }} />
              <div className="msg-time">10:35</div>
            </div>
          </div>

          {/* Spazio fondo extra per scorrimento */}
          <div className="scroll-spacer" style={{ height: '800px' }}></div>

        </div>
      </div>
    </div>
  );
}
