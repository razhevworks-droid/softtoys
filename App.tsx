import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageType, Product, CartItem, MessageButton } from './types';
import { PRODUCTS, INITIAL_GREETING } from './constants';
import { getGeminiResponse } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    // Only add greeting if empty
    if (messages.length === 0) {
      addBotMessage(INITIAL_GREETING, [
        { label: "Посмотреть каталог", action: "/catalog" }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addBotMessage = (text: string, buttons?: MessageButton[]) => {
    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.TEXT,
      text,
      sender: 'bot',
      timestamp: new Date(),
      buttons
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.TEXT,
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addProductMessage = (product: Product) => {
    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.PRODUCT_CARD,
      product,
      sender: 'bot',
      timestamp: new Date(),
      buttons: [
        { label: `Купить за ${product.price} ₽`, action: `add_to_cart:${product.id}` }
      ]
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleCommand = async (command: string) => {
    if (command === '/catalog') {
      addBotMessage("Вот наши самые популярные игрушки! 👇");
      // Simulate sequential sending of cards
      for (const product of PRODUCTS) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for effect
        addProductMessage(product);
      }
      return true;
    }

    if (command === '/cart') {
      if (cart.length === 0) {
        addBotMessage("Ваша корзина пуста 🕸️. Давайте добавим туда что-нибудь мягкое!");
      } else {
        const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const cartText = cart.map(item => 
          `▫️ ${item.product.name} (x${item.quantity}) — ${item.product.price * item.quantity} ₽`
        ).join('\n');
        
        addBotMessage(`🛒 *Ваша корзина:*\n\n${cartText}\n\n*Итого: ${total} ₽*`, [
           { label: "✅ Оформить заказ", action: "/checkout" },
           { label: "🗑️ Очистить корзину", action: "/clear_cart", variant: 'secondary' }
        ]);
      }
      return true;
    }

    if (command === '/clear_cart') {
      setCart([]);
      addBotMessage("Корзина очищена! ✨");
      return true;
    }

     if (command === '/clear') {
      setMessages([]); // Clear chat history visually
      addBotMessage(INITIAL_GREETING, [
        { label: "Посмотреть каталог", action: "/catalog" }
      ]);
      return true;
    }

    if (command === '/checkout') {
      if (cart.length === 0) return true;
      addBotMessage("🎉 Спасибо за заказ! В реальности здесь открылась бы форма оплаты. А пока — держите виртуальный чек! 🧾\n\nМенеджер свяжется с вами (нет).");
      setCart([]);
      return true;
    }

    if (command === '/help') {
      addBotMessage("Я умею:\n\n🔹 Показывать каталог (/catalog)\n🔹 Считать сумму в корзине (/cart)\n🔹 Болтать о плюшевых мишках (просто напиши мне!)\n\nПопробуй спросить: «Есть что-то с ушками?»");
      return true;
    }

    if (command.startsWith('add_to_cart:')) {
      const productId = command.split(':')[1];
      const product = PRODUCTS.find(p => p.id === productId);
      if (product) {
        setCart(prev => {
          const existing = prev.find(item => item.product.id === productId);
          if (existing) {
            return prev.map(item => 
              item.product.id === productId 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...prev, { product, quantity: 1 }];
        });
        
        // Use a subtle notification instead of a full message sometimes, but for bot simulation a message is good
        // Using `showNotification` simulated by a quick bot message
        addBotMessage(`✅ Добавлено: ${product.name}`, [
          { label: "Перейти в корзину", action: "/cart", variant: 'secondary' }
        ]);
      }
      return true;
    }

    return false; // Not a local command
  };

  const handleSend = async (text: string) => {
    addUserMessage(text);
    setIsTyping(true);

    // Check if it's a command first
    if (text.startsWith('/') || await handleCommand(text)) {
      setIsTyping(false);
      return;
    }

    // Heuristic: If user asks for "katalog" or "cart" naturally
    const lowerText = text.toLowerCase();
    if (lowerText.includes("каталог") || lowerText.includes("товар") || lowerText.includes("купить")) {
         // We can mix Gemini + Commands. Let Gemini answer, then show catalog.
         // Or just intercept. Let's intercept specific phrases for better UX.
         if (lowerText === 'каталог' || lowerText === 'товары') {
            await handleCommand('/catalog');
            setIsTyping(false);
            return;
         }
    }

    // Call Gemini
    try {
      // Build history for Gemini
      const history = messages
        .filter(m => m.type === MessageType.TEXT && m.text)
        .map(m => ({
          role: m.sender === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.text! }]
        }))
        .slice(-10); // Keep last 10 messages for context

      const response = await getGeminiResponse(text, history);
      
      setIsTyping(false);
      addBotMessage(response);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      addBotMessage("Ой, я немного устал. Попробуй позже!");
    }
  };

  return (
    <div className="tg-bg h-screen w-full flex flex-col items-center justify-center">
      {/* Main Container - constrained width on desktop to simulate mobile app */}
      <div className="w-full h-full md:max-w-[450px] md:h-[90vh] md:rounded-xl md:shadow-2xl md:border md:border-gray-300 flex flex-col bg-[#8daec4] overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white p-3 flex items-center shadow-sm z-10 shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mr-3 shrink-0">
            🧸
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-900 leading-tight">PlushieBot</h1>
            <span className="text-xs text-blue-500 font-medium">bot</span>
          </div>
          <div className="ml-auto">
             {/* Optional header actions */}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
          <div className="flex flex-col gap-1 pb-2">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onAction={(action) => handleCommand(action)} 
              />
            ))}
            {isTyping && (
               <div className="flex w-full mb-2 justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 z-10">
          <ChatInput 
            onSend={handleSend} 
            onMenuAction={(action) => handleCommand(action)}
            cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
          />
        </div>

      </div>
      
      <div className="hidden md:block absolute bottom-4 text-white text-opacity-70 text-sm">
        Simulated Telegram Bot Interface • React + Gemini
      </div>
    </div>
  );
};

export default App;