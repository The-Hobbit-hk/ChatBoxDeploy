import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    channel: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient pagination queries
messageSchema.index({ channel: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
