import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const MessageSchema = z.object({
  content: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['PENDING', 'SENT', 'FAILED']),
  sentBy: z.string(),
  messageId: z.string().optional(),
  error: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MessageType = z.infer<typeof MessageSchema>;

interface MessageDocument extends MessageType, Document {}

const messageSchema = new Schema<MessageDocument>(
  {
    content: { type: String, required: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      required: true,
      default: 'PENDING',
    },
    sentBy: { type: String, required: true },
    messageId: String,
    error: String,
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'messages',
  }
);

messageSchema.index({ status: 1 });
messageSchema.index({ priority: 1 });
messageSchema.index({ sentBy: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<MessageDocument>('Message', messageSchema);