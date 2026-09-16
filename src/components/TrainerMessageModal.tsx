import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrainerProfile } from '@/types/capacityConnect';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCheck, 
  Star, 
  Award, 
  X,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'trainee' | 'trainer';
  senderName: string;
  text: string;
  timestamp: string;
}

interface TrainerMessageModalProps {
  trainer: TrainerProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrainerMessageModal: React.FC<TrainerMessageModalProps> = ({
  trainer,
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storageKey = trainer ? `pf_trainer_chat_${trainer.id}` : '';

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!trainer) return [];
    try {
      const saved = localStorage.getItem(`pf_trainer_chat_${trainer.id}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'trainer',
        senderName: trainer.name,
        text: `Hello ${user?.name || 'there'}! I specialize in ${trainer.specialization}. Feel free to ask any questions about your technical roadmap, coursework doubts, or 1:1 mentorship schedule.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Reload messages whenever active trainer changes
  useEffect(() => {
    if (!trainer) return;
    try {
      const saved = localStorage.getItem(`pf_trainer_chat_${trainer.id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'trainer',
            senderName: trainer.name,
            text: `Hello ${user?.name || 'there'}! I specialize in ${trainer.specialization}. Feel free to ask any questions about your technical roadmap, coursework doubts, or 1:1 mentorship schedule.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      // ignore
    }
  }, [trainer?.id, user?.name]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!trainer) return null;

  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newMessages));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'trainee',
      senderName: user?.name || 'Trainee',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMessage];
    saveMessages(updated);
    setInputText('');

    toast.success(t(`Message delivered to ${trainer.name}`, `Message delivered to ${trainer.name}`));

    // Simulate trainer response after a short delay
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMessage: Message = {
        id: `msg-reply-${Date.now()}`,
        sender: 'trainer',
        senderName: trainer.name,
        text: `Thank you for reaching out! I've noted your inquiry regarding "${text.slice(0, 30)}...". I will review your recent module scores and provide guidance shortly. If urgent, feel free to book a 1:1 session slot!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveMessages([...updated, replyMessage]);
    }, 1200);
  };

  const quickPrompts = [
    t('I need guidance on mastering my core programming skills.', 'I need guidance on mastering my core programming skills.'),
    t('Can you review my recent course assignment and logic fixes?', 'Can you review my recent course assignment and logic fixes?'),
    t('What are the best topics to prepare for upcoming campus interviews?', 'What are the best topics to prepare for upcoming campus interviews?')
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header with Trainer Info */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={trainer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={trainer.name} 
                className="w-11 h-11 rounded-2xl object-cover border-2 border-white/20 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {trainer.name}
                </h3>
                <Badge className="bg-white/20 hover:bg-white/20 text-white text-[10px] font-semibold border-0">
                  {t('Verified Faculty', 'Verified Faculty')}
                </Badge>
              </div>
              <p className="text-[11px] text-blue-100 font-medium truncate max-w-xs mt-0.5">
                {trainer.specialization}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-blue-200 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  {trainer.rating} Rating
                </span>
                <span>•</span>
                <span>{trainer.yearsOfExperience} yrs exp</span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold">Active Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg) => {
            const isTrainee = msg.sender === 'trainee';
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isTrainee ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                  <span className="font-semibold">{msg.senderName}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div 
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                    isTrainee 
                      ? 'bg-blue-600 text-white rounded-tr-xs font-medium' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-100" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-200" />
              <span className="text-[11px] font-medium">{trainer.name} {t('is typing...', 'is typing...')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            {t('Quick Inquiries:', 'Quick Inquiries:')}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] text-left px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 whitespace-nowrap shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t(`Write your message to ${trainer.name}...`, `Write your message to ${trainer.name}...`)}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-3.5 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('Send', 'Send')}</span>
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default TrainerMessageModal;
