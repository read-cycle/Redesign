import type { Timestamp } from "firebase/firestore";

export interface UploadDoc {
  id?: string;
  isbn: { code: string; name: string } | null;
  title: { code: string; name: string } | null;
  grade: { code: string; name: string } | null;
  tags: { code: string; name: string }[];
  condition: { code: string; name: string } | null;
  priceMode: { code: string; name: string } | null;
  conditionDetails: { code: string; name: string }[];
  userLocation: string;
  shareLocation: boolean;
  deliveryPreference: { code: string; name: string }[];
  price: number;
  quantity: number;
  uploaderName: string;
  contactPreference: { code: string; name: string }[];
  extraInfo: string;
  listingImage: string;
  extraImages: string[];
  timestamp: Timestamp;
}