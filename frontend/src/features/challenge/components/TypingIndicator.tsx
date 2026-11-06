import React from 'react';

interface TypingIndicatorProps {
  senderName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  senderName = 'Pengirim',
}) => {
  return (
    <div className="flex items-center gap-2 py-1 px-2 animate-in fade-in duration-300">
      <div className="bg-surface-container-low border border-surface-container rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#143826] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-[#143826] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-[#143826] animate-bounce" />
      </div>
      <span className="text-[11px] text-on-surface-variant font-medium italic">
        {senderName} sedang mengetik...
      </span>
    </div>
  );
};

