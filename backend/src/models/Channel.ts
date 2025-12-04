import mongoose, { Document, Schema } from 'mongoose';

export interface IChannel extends Document {
    name: string;
    description: string;
    creator: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const channelSchema = new Schema<IChannel>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    description: {
        type: String,
        default: '',
        maxlength: 200
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Automatically add creator to members
channelSchema.pre('save', function (next) {
    if (this.isNew && !this.members.includes(this.creator)) {
        this.members.push(this.creator);
    }
    next();
});

export default mongoose.model<IChannel>('Channel', channelSchema);
