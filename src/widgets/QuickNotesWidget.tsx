import React, { useState, useEffect } from 'react';
import { WidgetCard } from '../components/WidgetCard';

interface QuickNotesWidgetProps {
  title?: string;
  icon?: string;
  placeholder?: string;
}

export function QuickNotesWidget({ title = "Quick Note", icon = "PenLine", placeholder = "Type something here..." }: QuickNotesWidgetProps) {
  const [note, setNote] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fuzzy_quick_note');
    if (saved) {
      setNote(saved);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    localStorage.setItem('fuzzy_quick_note', val);
    setLastSaved(new Date());
  };

  const statusNode = (
    <div className="flex items-center gap-2">
      {lastSaved && (
        <span className="text-white/30 text-[9px] lowercase" title={lastSaved.toLocaleTimeString()}>
          saved
        </span>
      )}
      <span className="text-white/20 text-[9px]">
        {note.length}c
      </span>
    </div>
  );

  return (
    <WidgetCard title={title} iconName={icon} statusNode={statusNode} contentClassName="h-[120px]">
      <textarea
        className="w-full h-full bg-transparent border-none outline-none text-xs font-mono resize-none text-white/70 leading-relaxed custom-scrollbar focus:text-white transition-colors"
        placeholder={placeholder}
        value={note}
        onChange={handleChange}
        spellCheck="false"
      />
    </WidgetCard>
  );
}

