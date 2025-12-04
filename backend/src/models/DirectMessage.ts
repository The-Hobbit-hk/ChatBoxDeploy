import mongoose, { Document, Schema } from 'mongoose';

export interface IDirectMessage extends Document {
    conversation: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const directMessageSchema = new Schema<IDirectMessage>({
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    readBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Index for efficient queries
directMessageSchema.index({ conversation: 1, createdAt: -1 });

export const DirectMessage = mongoose.model<IDirectMessage>('DirectMessage', directMessageSchema);
