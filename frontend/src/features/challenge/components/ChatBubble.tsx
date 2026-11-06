import React from 'react';
import { motion } from 'motion/react';
import { FileCode, ExternalLink, AlertTriangle, CheckCheck } from 'lucide-react';
import type { DialogueMessage } from '../../../types/challenge';

interface ChatBubbleProps {
  message: DialogueMessage;
  characterAvatar?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  characterAvatar = '👤',
}) => {
  if (message.sender === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="my-3 mx-auto max-w-lg text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 text-xs sm:text-[13px] leading-relaxed shadow-xs text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      </motion.div>
    );
  }

  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex items-end gap-2.5 my-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center text-sm shrink-0 mb-0.5 shadow-xs">
          {characterAvatar}
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 shadow-xs space-y-2 ${
          isUser
            ? 'bg-[#143826] text-white rounded-br-xs'
            : 'bg-surface-container-lowest border border-surface-container text-on-surface rounded-bl-xs'
        }`}
      >
        <p className="text-xs sm:text-[13px] leading-relaxed break-words font-medium">
          {message.text}
        </p>

        {/* Attachment Mockup (APK or Suspicious Link) */}
        {message.attachment && (
          <div className="mt-2.5 p-3 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2 text-on-surface">
            <div className="flex items-center gap-2.5">
              {message.attachment.type === 'apk' ? (
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold font-mono truncate text-on-surface">
                  {message.attachment.filename}
                </span>
                {message.attachment.size && (
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    Ukuran: {message.attachment.size}
                  </span>
                )}
              </div>
            </div>

            {message.attachment.warningNote && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-1.5 text-[11px] text-amber-900 leading-tight">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{message.attachment.warningNote}</span>
              </div>
            )}
          </div>
        )}

        {/* Timestamp & read receipt */}
        <div
          className={`flex items-center justify-end gap-1 text-[10px] font-mono ${
            isUser ? 'text-gray-300' : 'text-on-surface-variant'
          }`}
        >
          <span>{message.timestamp || 'Baru saja'}</span>
          {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#E86A33]" />}
        </div>
      </div>
    </motion.div>
  );
};
