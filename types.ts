export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  PRODUCT_CARD = 'product_card',
  SYSTEM = 'system'
}

export interface MessageButton {
  label: string;
  action: string; // e.g., "add_to_cart:1", "view_catalog"
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface Message {
  id: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  product?: Product;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}