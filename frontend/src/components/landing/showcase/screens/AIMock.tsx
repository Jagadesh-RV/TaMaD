import { MockAvatar, MockCard, MockSidebar, MockTopbar, palette } from '../MockChrome';

const suggestions = [
  { text: 'Summarize the last sprint review', icon: '📋' },
  { text: 'Create tasks from meeting notes', icon: '✨' },
  { text: 'Draft a status update for the team', icon: '✍️' },
];

const messages = [
  { role: 'user', text: "What's blocking the mobile app release?" },
  { role: 'ai', text: "Three issues are blocking the release: the calendar sync bug (TAM-34), pending design tokens, and an incomplete auth flow. I can draft a plan to unblock these if you'd like.", suggestions: ['Draft a plan', 'Assign to team'] },
];

export function AIMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={4} items={['dashboard', 'tasks', 'ai', 'calendar', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="AI Assistant" />
        <div className="flex-1 space-y-3 overflow-hidden p-3.5">
          <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-[11px] font-bold text-white">✦</span>
            <span className="text-[10px] font-semibold text-violet-700">TaMaD AI — your work copilot</span>
          </div>

          <div className="space-y-2.5">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'ai' && <MockAvatar initials="AI" size={24} color={palette.violet} className="mr-2 mt-0.5" />}
                <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${message.role === 'user' ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700'}`}>
                  <p className="text-[10px] leading-relaxed">{message.text}</p>
                  {message.role === 'ai' && message.suggestions && (
                    <div className="mt-2 flex gap-1.5">
                      {message.suggestions.map((s) => (
                        <span key={s} className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[9px] font-semibold text-violet-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-1.5">
            {suggestions.map((s) => (
              <MockCard key={s.text} className="flex items-center gap-2 px-3 py-2">
                <span className="text-[11px]">{s.icon}</span>
                <span className="text-[10px] font-medium text-slate-600">{s.text}</span>
                <span className="ml-auto text-slate-300">↗</span>
              </MockCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
