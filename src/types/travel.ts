export type AgentRole = "Scout" | "Logician" | "Auditor" | "Negotiator";

export type TravelOption = {
  id: string;
  airline: string;
  priceUsd: number;
  currency?: string;
  stops: string;
  duration: string;
  origin: { label: string; lat: number | null; lng: number | null };
  destination: { label: string; lat: number | null; lng: number | null };
};

export type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  kind?: "status" | "result" | "location-prompt";
};

export type TripHistoryItem = {
  id: string;
  createdAt: string;
  prompt: string;
  messages: ChatMessage[];
  options: TravelOption[];
  selected: TravelOption | null;
  confirmation: { confirmationId: string; receiptEmailSentTo: string } | null;
  /** Enriched fields populated from MongoDB */
  selectedOptionId?: string;
  confirmationId?: string;
  airline?: string;
  route?: string;
  priceUsd?: number;
  currency?: string;
  stops?: string;
  duration?: string;
  passengerName?: string;
  status?: "confirmed" | "pending" | "cancelled";
};

export type BookingDetails = {
  fullLegalName: string;
  dateOfBirth: string;
  gender: "M" | "F" | "X";
  email: string;
  phone: string;
  residentialAddress: string;
};
