import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Utensils, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'khady';
  text: string;
  time: string;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'khady',
      text: "N'na ! Bienvenue chez KHADY'S FOOD & EVENT. Je suis Khady, votre guide gastronomique personnelle. Que désirez-vous déguster aujourd'hui ? Dites-moi vos envies, votre tolérance au piment ou l'occasion que vous célébrez !",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      // Server-side call to proxy endpoint complying with gemini-api skill
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: historyPayload
        })
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'khady',
        text: data.text || "Nos plats sont cuisinés avec les meilleurs produits du Sahel et du Sénégal !",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Assistant request error:", err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'khady',
        text: "Pour un régal absolu aujourd'hui à Niamey, je vous recommande vivement notre Thiéboudienne Penda Royal au mérou ou notre Dibi d'agneau grillé au feu de bois avec un grand verre de Bissap frais !",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Recommande-moi un plat pour 2 personnes",
    "Quel plat doux sans trop de piment ?",
    "Que boire avec le Dibi d'agneau ?",
    "Comment utiliser les Box Sauces Khady ?"
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-[#181615] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col h-[75vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#201814] via-[#2A1D16] to-[#201814] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#181614] rounded-[14px] flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Conseillère Culinaire Khady (IA)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  En ligne
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Accords mets, boissons fraîches, piments & recettes personnalisées
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-orange-600 text-white'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
              </div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-orange-600 text-white rounded-tr-none'
                    : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none shadow-md'
                }`}
              >
                <p>{m.text}</p>
                <span className="text-[10px] opacity-60 block mt-1.5 text-right">
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 text-xs rounded-tl-none flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Khady réfléchit à votre suggestion...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#141211] border-t border-stone-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#141211] border-t border-stone-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez votre question à Khady..."
            className="flex-1 px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white disabled:opacity-40 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
