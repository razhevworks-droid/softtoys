import React from 'react';
import { Message, MessageType } from '../types';
import { ShoppingCart } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onAction: (action: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAction }) => {
  const isUser = message.sender === 'user';
  
  // Base classes for the bubble
  const bubbleClass = isUser
    ? 'bg-[#EEFFDE] text-black ml-auto rounded-tr-none' // Telegram user bubble color
    : 'bg-white text-black mr-auto rounded-tl-none'; // Telegram bot bubble color

  const containerClass = `flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`;
  const maxWidthClass = message.type === MessageType.PRODUCT_CARD ? 'max-w-[85%]' : 'max-w-[80%]';

  // Format time
  const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={containerClass}>
      <div 
        className={`relative p-2 rounded-2xl shadow-sm ${bubbleClass} ${maxWidthClass}`}
        style={{ minWidth: '4rem' }}
      >
        {/* Product Card Rendering */}
        {message.type === MessageType.PRODUCT_CARD && message.product && (
          <div className="flex flex-col mb-2">
             <div className="w-full h-48 mb-2 rounded-lg overflow-hidden bg-gray-100 relative">
               <img 
                 src={message.product.imageUrl} 
                 alt={message.product.name}
                 className="w-full h-full object-cover"
               />
             </div>
             <h3 className="font-bold text-lg mb-1">{message.product.name}</h3>
             <p className="text-sm text-gray-600 mb-2 leading-snug">{message.product.description}</p>
             <p className="font-bold text-blue-600 text-lg mb-3">{message.product.price} ₽</p>
          </div>
        )}

        {/* Text Rendering */}
        {message.text && (
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </div>
        )}

        {/* Buttons Rendering */}
        {message.buttons && message.buttons.length > 0 && (
          <div className="flex flex-col gap-2 mt-3 mb-1">
            {message.buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => onAction(btn.action)}
                className={`
                  w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-200
                  ${btn.variant === 'secondary' 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' 
                    : 'bg-[#50A7EA] hover:bg-[#4096d9] text-white shadow-sm'
                  }
                  flex items-center justify-center gap-2
                `}
              >
                {btn.action.startsWith('add_to_cart') && <ShoppingCart size={16} />}
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-[11px] mt-1 text-right ${isUser ? 'text-[#4fae4e]' : 'text-gray-400'}`}>
           {timeString}
           {isUser && <span className="ml-1">✓✓</span>}
        </div>
      </div>
    </div>
  );
};