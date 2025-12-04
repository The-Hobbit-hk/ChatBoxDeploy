'use client';

import { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EmojiPickerButtonProps {
    onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
    const [showPicker, setShowPicker] = useState(false);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji);
        setShowPicker(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="p-2.5 rounded-xl text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--surface-light)] transition-all"
                title="Add emoji"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {showPicker && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPicker(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            width={350}
                            height={400}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
