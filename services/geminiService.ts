import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

// Prepare context string about products for the AI
const productsContext = PRODUCTS.map(p => 
  `- ${p.name}: ${p.price} руб. (${p.description})`
).join('\n');

const SYSTEM_INSTRUCTION = `
Ты — дружелюбный и милый бот-консультант магазина мягких игрушек «Плюшевый Рай» (Telegram Bot).
Твоя задача — помогать пользователям выбирать игрушки, отвечать на вопросы о наличии и ценах.

Список товаров в наличии:
${productsContext}

Правила:
1. Отвечай кратко и емко, как в чате.
2. Используй милые эмодзи (🧸, ✨, 💖).
3. Если пользователь хочет купить или посмотреть каталог, подскажи ему нажать на кнопки или напиши "/catalog".
4. Цены называй только в рублях.
5. Ты не можешь сам оформить заказ, только подсказать, что добавить в корзину.
6. Будь вежливым и позитивным.
`;

// Fixed: Changed parts type from tuple [{ text: string }] to array { text: string }[] to fix assignment error in App.tsx
export const getGeminiResponse = async (userMessage: string, history: {role: 'user' | 'model', parts: { text: string }[]}[] = []) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Извините, сейчас я немного занят (API Key not found). Попробуйте позже! 🤕";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We create a chat session to keep context
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        // Removed maxOutputTokens to avoid issues with thinking budget per guidelines
      },
      history: history
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text ?? "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ой, что-то пошло не так с моей плюшевой головой... 😵 Попробуйте еще раз!";
  }
};