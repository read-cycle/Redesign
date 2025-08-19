import type { Timestamp } from "firebase/firestore";

export interface CodeName {
  code: string;
  name: string;
}

export interface UploadDoc {
  id?: string;
  isbn: CodeName | null;
  title: CodeName | null;
  grade: CodeName | null;
  tags: CodeName[];
  condition: CodeName | null;
  priceMode: CodeName | null;
  conditionDetails: CodeName[];
  userLocation: string;
  shareLocation: boolean;
  deliveryPreference: CodeName[];
  price: number;
  quantity: number;
  uploaderName: string;
  contactPreference: CodeName[];
  extraInfo: string;
  listingImage: string;
  extraImages: string[];
  timestamp: Timestamp;
  uploaderEmail: string;
}

export interface BuyerRequestedDoc {
  id?: string;
  buyerName: string;
  buyerContactPreference: CodeName[];
  buyerDeliveryPreference: CodeName[];
  shareBuyerLocation: boolean;
  buyerLocation: string;
  buyerQuantity: number;
  isbn: CodeName | null;
  title: CodeName | null;
  grade: CodeName | null;
  tags: CodeName[];
  condition: CodeName | null;
  priceMode: CodeName | null;
  conditionDetails: CodeName[];
  userLocation: string;
  shareLocation: boolean;
  deliveryPreference: CodeName[];
  price: number;
  quantity: number;
  uploaderName: string;
  contactPreference: CodeName[];
  extraInfo: string;
  listingImage: string;
  extraImages: string[];
  timestamp: Timestamp;
  uploaderEmail: string;
}

export interface Message {
  text?: string;         
  imageUrl?: string;     
  sender: string;  
  timestamp: Timestamp;        
  type: 'text' | 'image' | 'text+image';
  senderID: string;
}

export interface DayMarker {
  text: string
}

export interface ChatDisplayItem {
  message?: Message,
  dayMarker?: DayMarker,
  type: 'message' | 'daymarker'
}

export interface WatchlistDoc {
  buyerName: string;
  buyerContactPreference: string;
  buyerDeliveryPreference: string;
  shareBuyerLocation: boolean;
  buyerLocation: string;
  buyerQuantity: number;
  buyerID: string;
  title: string;
  tags: string[];      
  isbn: string;
  grade: string;
  timestamp: Timestamp;
  buyerEmail: string;
}