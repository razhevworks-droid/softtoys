import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, ShoppingBag } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onMenuAction: (action: string) => void;
  cartCount: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onMenuAction, cartCount }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="bg-white border-t border-gray-200 p-2">
      {/* Quick Action Buttons (Simulating Persistent Menu) */}
      <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide pb-1">
        <button 
          onClick={() => onMenuAction('/catalog')}
          className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-blue-500 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
        >
          🎁 Каталог
        </button>
        <button 
          onClick={() => onMenuAction('/cart')}
          className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-blue-500 font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
        >
          🛒 Корзина {cartCount > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{cartCount}</span>}
        </button>
        <button 
          onClick={() => onMenuAction('/help')}
          className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-blue-500 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
        >
          ℹ️ Помощь
        </button>
         <button 
          onClick={() => onMenuAction('/clear')}
          className="flex-shrink-0 bg-gray-100 hover:bg-red-100 text-red-500 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
        >
          🗑️ Очистить
        </button>
      </div>

      <div className="flex items-end gap-2 bg-gray-100 rounded-3xl p-2 px-4 relative">
        <div className="p-2 text-gray-400 cursor-pointer hover:text-gray-600">
             <Menu size={24} />
        </div>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          className="flex-1 bg-transparent border-none outline-none resize-none py-3 max-h-[120px] text-[16px]"
          rows={1}
        />

        <button 
          onClick={handleSend}
          disabled={!text.trim()}
          className={`p-2 rounded-full mb-1 transition-colors ${
            text.trim() ? 'text-blue-500 hover:bg-blue-100' : 'text-gray-400'
          }`}
        >
          <Send size={24} className={text.trim() ? 'fill-blue-500' : ''} />
        </button>
      </div>
    </div>
  );
};