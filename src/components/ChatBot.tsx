"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: 'Hi! 👋 Do you have any questions about SuperNexus or our plans?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages as any);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      
      if (data.reply) {
         setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
         setMessages(prev => [...prev, { role: 'model', content: 'API Error: ' + data.error }]);
      }
    } catch (err) {
       setMessages(prev => [...prev, { role: 'model', content: 'Temporary network error.' }]);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-animated-gradient"
          style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, width: '60px', height: '60px', borderRadius: '30px', boxShadow: '0 4px 20px rgba(0, 133, 255, 0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <>
          <style dangerouslySetInnerHTML={{__html: `
            .chatbot-window {
              bottom: 30px;
              right: 30px;
              width: 350px;
            }
            @media (max-width: 450px) {
              .chatbot-window {
                bottom: 15px !important;
                right: 15px !important;
                width: calc(100vw - 30px) !important;
              }
            }
          `}} />
          <div className="chatbot-window" style={{ position: 'fixed', zIndex: 9999, background: '#151515', border: '1px solid #333', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
            <div style={{ background: '#0a0a0a', padding: '16px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#03dac6', borderRadius: '50%', display: 'inline-block' }}></span>
                    AI Assistant
                </h4>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    <X size={20} />
                </button>
            </div>
            
            <div ref={scrollRef} style={{ height: '350px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((m, i) => {
                    const renderMessageContent = (text: string) => {
                        const parts = text.split(/(\[IMAGE:\s*[^\]]+\])/);
                        return parts.map((part, idx) => {
                          if (part.startsWith('[IMAGE:')) {
                            const match = part.match(/\[IMAGE:\s*([^\]]+)\]/);
                            if (match && match[1]) {
                              return <img key={idx} src={match[1]} alt="Example" style={{ width: '100%', borderRadius: '8px', marginTop: '10px', display: 'block' }} />;
                            }
                          }
                          return <span key={idx} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
                        });
                    };

                    return (
                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                            maxWidth: '85%', 
                            padding: '12px 16px', 
                            borderRadius: '16px', 
                            background: m.role === 'user' ? '#ccff00' : '#222', 
                            color: m.role === 'user' ? '#000' : '#fff',
                            borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                            borderTopLeftRadius: m.role === 'user' ? '16px' : '4px',
                            fontSize: '0.95rem',
                            lineHeight: '1.4'
                        }}>
                            {renderMessageContent(m.content)}
                        </div>
                    </div>
                )})}
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '12px 16px', borderRadius: '16px', background: '#222', color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            Typing...
                        </div>
                    </div>
                )}
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #333', background: '#0a0a0a' }}>
                <form 
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  style={{ display: 'flex', gap: '10px' }}
                >
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Ask me anything..." 
                        style={{ flex: 1, background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '20px', padding: '10px 16px', outline: 'none', fontSize: '16px' }}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} style={{ background: '#ccff00', color: '#000', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
        </>
      )}
    </>
  );
}
