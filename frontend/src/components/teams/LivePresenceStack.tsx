import { motion } from 'framer-motion';

export interface PresenceMember {
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  isTyping?: boolean;
}

interface LivePresenceStackProps {
  members: PresenceMember[];
  max?: number;
  showTypingLabel?: boolean;
}

/**
 * LivePresenceStack
 * -----------------
 * A living portrait of the team. Online members glow with a soft ring,
 * overlapping avatars create a sense of togetherness, and a typing
 * indicator whispers "someone is here, thinking with you."
 */
export default function LivePresenceStack({ members, max = 4, showTypingLabel = true }: LivePresenceStackProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;
  const typing = members.filter(m => m.isTyping);

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2.5">
        {visible.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, x: -8, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 24 }}
            title={`${member.name}${member.isOnline ? ' — online' : ''}`}
            className="relative"
          >
            <div className="avatar avatar-sm shadow-sm border-[color:var(--color-surface)]">
              {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} /> : member.name.charAt(0).toUpperCase()}
            </div>
            {member.isOnline && (
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-[color:var(--color-success)] ring-2 ring-[color:var(--color-surface)]" />
            )}
          </motion.div>
        ))}
        {overflow > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: visible.length * 0.06, type: 'spring', stiffness: 320, damping: 24 }}
            className="avatar avatar-sm bg-[color:var(--color-foreground)] text-[color:var(--color-background)] font-bold shadow-sm"
          >
            +{overflow}
          </motion.div>
        )}
      </div>

      {typing.length > 0 && showTypingLabel && (
        <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-border-light)] bg-[color:var(--color-surface)] px-3 py-1.5 shadow-xs">
          <span className="flex items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]"
                animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </span>
          <span className="text-[10px] font-bold text-[color:var(--color-foreground-secondary)]">
            {typing.length === 1 ? `${typing[0].name} is typing` : 'Team is typing'}
          </span>
        </div>
      )}
    </div>
  );
}
