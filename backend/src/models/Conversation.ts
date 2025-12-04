import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage?: {
        content: string;
        sender: mongoose.Types.ObjectId;
        createdAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        content: String,
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: Date
    }
}, {
    timestamps: true
});

// Index for quick lookups
conversationSchema.index({ participants: 1 });

// Method to check if user is participant
conversationSchema.methods.hasParticipant = function (userId: string) {
    return this.participants.some(p => p.toString() === userId);
};

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
