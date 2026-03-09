import mongoose, { Schema, type Document, type Model } from "mongoose";

/* ── Sub-document types ──────────────────────────────────── */

export interface IMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  kind?: "status" | "result" | "location-prompt";
}

export interface ITravelOption {
  id: string;
  airline: string;
  priceUsd: number;
  currency?: string;
  stops: string;
  duration: string;
  origin: { label: string; lat: number | null; lng: number | null };
  destination: { label: string; lat: number | null; lng: number | null };
}

export interface IConfirmation {
  confirmationId: string;
  receiptEmailSentTo: string;
}

/* ── Root document type ──────────────────────────────────── */

export interface ITripSession extends Document {
  walletAddress: string;      // lowercased 0x address
  prompt: string;             // the original user prompt
  messages: IMessage[];       // full conversation
  options: ITravelOption[];   // flight offers shown
  selected: ITravelOption | null;
  confirmation: IConfirmation | null;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schemas ─────────────────────────────────────────────── */

const MessageSchema = new Schema<IMessage>(
  {
    id:   { type: String, required: true },
    role: { type: String, enum: ["user", "agent"], required: true },
    text: { type: String, required: true },
    kind: { type: String, enum: ["status", "result", "location-prompt"] },
  },
  { _id: false },
);

const CoordSchema = new Schema(
  {
    label: { type: String, default: "" },
    lat:   { type: Number, default: null },
    lng:   { type: Number, default: null },
  },
  { _id: false },
);

const TravelOptionSchema = new Schema<ITravelOption>(
  {
    id:          { type: String, required: true },
    airline:     { type: String, default: "" },
    priceUsd:    { type: Number, default: 0 },
    currency:    { type: String },
    stops:       { type: String, default: "" },
    duration:    { type: String, default: "" },
    origin:      { type: CoordSchema, default: () => ({}) },
    destination: { type: CoordSchema, default: () => ({}) },
  },
  { _id: false },
);

const ConfirmationSchema = new Schema<IConfirmation>(
  {
    confirmationId:     { type: String, required: true },
    receiptEmailSentTo: { type: String, required: true },
  },
  { _id: false },
);

const TripSessionSchema = new Schema<ITripSession>(
  {
    walletAddress: { type: String, required: true, lowercase: true, index: true },
    prompt:        { type: String, required: true },
    messages:      { type: [MessageSchema], default: [] },
    options:       { type: [TravelOptionSchema], default: [] },
    selected:      { type: TravelOptionSchema, default: null },
    confirmation:  { type: ConfirmationSchema, default: null },
  },
  { timestamps: true },
);

/* ── Model (singleton-safe for Next.js hot-reload) ───────── */

export const TripSession: Model<ITripSession> =
  (mongoose.models.TripSession as Model<ITripSession>) ||
  mongoose.model<ITripSession>("TripSession", TripSessionSchema);
