import React from 'react';
import { Shortcut, Category } from '../types';
import { ShortcutCard } from './ShortcutCard';
import { sortByOrder } from '../utils/sort';

interface ShortcutGridProps {
  categories: Category[];
  shortcuts: Shortcut[];
  density?: 'compact' | 'comfortable' | 'spacious';
  onReorder?: (sourceId: string, targetId: string) => void;
  onMoveToCategory?: (sourceId: string, categoryId: string) => void;
  onEditShortcut?: (id: string) => void;
}

export function ShortcutGrid({ 
  categories, 
  shortcuts, 
  density = 'comfortable',
  onReorder,
  onMoveToCategory,
  onEditShortcut
}: ShortcutGridProps) {
  const enabledCategories = categories.filter(c => c.enabled).sort(sortByOrder);
  const enabledShortcuts = shortcuts.filter(s => s.enabled).sort(sortByOrder);

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const gapClass = density === 'compact' ? 'gap-2' : density === 'spacious' ? 'gap-8' : 'gap-4';
  const sectionSpacingClass = density === 'compact' ? 'space-y-6' : density === 'spacious' ? 'space-y-14' : 'space-y-10';
  const gridColsClass = density === 'compact' 
    ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8'
    : density === 'spacious' 
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
      : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

  return (
    <div className={`w-full max-w-5xl mx-auto ${sectionSpacingClass}`}>
      {enabledCategories.map(category => {
        const categoryShortcuts = enabledShortcuts.filter(s => s.categoryId === category.id);
        
        if (categoryShortcuts.length === 0) return null;

        return (
          <div 
             key={category.id} 
             className="animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-2xl transition-colors border-2 border-transparent"
             onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
             onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                const sourceId = e.dataTransfer.getData('text/plain');
                if (sourceId && onMoveToCategory) {
                   onMoveToCategory(sourceId, category.id);
                }
             }}
          >
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 ml-1 mb-4 flex items-center gap-2">
              {category.color && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
              )}
              {category.name}
            </h3>
            <div className={`grid ${gridColsClass} ${gapClass} min-h-[60px] rounded-xl`}>
              {categoryShortcuts.map(shortcut => (
                <div 
                  key={shortcut.id}
                  className={`transition-all duration-300 ${draggedId === shortcut.id ? 'opacity-30 scale-95' : ''} ${dragOverId === shortcut.id && draggedId !== shortcut.id ? 'scale-105 opacity-60 z-10' : ''}`}
                  onDragStart={(e) => handleDragStart(e, shortcut.id)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (draggedId && draggedId !== shortcut.id) {
                      setDragOverId(shortcut.id);
                    }
                  }}
                  onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDragLeave={(e) => {
                    if (dragOverId === shortcut.id) setDragOverId(null);
                  }}
                  onDrop={e => {
                     e.preventDefault();
                     e.stopPropagation();
                     const sourceId = e.dataTransfer.getData('text/plain');
                     if (sourceId && sourceId !== shortcut.id && onReorder) {
                        onReorder(sourceId, shortcut.id);
                     }
                  }}
                >
                  <ShortcutCard 
                    shortcut={shortcut} 
                    density={density} 
                    onEdit={() => onEditShortcut?.(shortcut.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
