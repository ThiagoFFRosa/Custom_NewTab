/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useDashboardConfig } from './hooks/useDashboardConfig';
import { BackgroundLayer } from './components/BackgroundLayer';
import { SearchBar } from './components/SearchBar';
import { ShortcutGrid } from './components/ShortcutGrid';
import { WidgetRenderer } from './widgets/WidgetRenderer';
import { EditPanel } from './components/EditPanel';
import { sortByOrder } from './utils/sort';

export default function App() {
  const { config, updateConfig, resetConfig } = useDashboardConfig();
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  const { settings, categories, shortcuts, widgets, wallpapers } = config;

  const leftWidgets = widgets.filter(w => w.position === 'left').sort(sortByOrder);
  const rightWidgets = widgets.filter(w => w.position === 'right').sort(sortByOrder);
  const bottomWidgets = widgets.filter(w => w.position === 'bottom').sort(sortByOrder);

  return (
    <div className="min-h-screen font-sans selection:bg-white/30 selection:text-white relative">
      <BackgroundLayer appearance={settings.appearance} wallpapers={wallpapers || []} />

      {/* Main Layout */}
      <div className="flex flex-col min-h-screen p-6 md:p-12 relative z-10 w-full max-w-[1920px] mx-auto">
        
        {/* Header Title (Optional, hidden on small screens) */}
        <header className="mb-8 flex flex-col justify-start items-start animate-in fade-in slide-in-from-top-4 duration-1000 delay-100">
          <h1 className="text-2xl font-light tracking-[0.2em] uppercase opacity-80">
            {settings.title}
          </h1>
          <p className="text-[10px] font-mono tracking-widest opacity-40 uppercase mt-1">
            USER-01-LOCAL-HUB
          </p>
        </header>

        <div className="flex w-full gap-8 flex-1">
          {/* Left Sidebar Widgets */}
          <aside className="hidden xl:flex flex-col gap-6 w-[280px] shrink-0 pt-[124px] animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
            {leftWidgets.map(w => <WidgetRenderer key={w.id} widget={w} />)}
          </aside>

          {/* Central Main Content */}
          <main className="flex-1 flex flex-col items-center">
            <div className="w-full animate-in fade-in zoom-in-95 duration-700 delay-200">
              <SearchBar 
                engineName={settings.search.engineName} 
                searchUrl={settings.search.searchUrl} 
                placeholder={settings.search.placeholder}
              />
            </div>
            
            <div className="w-full mt-4 flex-1 pb-16">
              <ShortcutGrid 
                categories={categories} 
                shortcuts={shortcuts} 
                density={settings.appearance.density} 
                onReorder={(sourceId, targetId) => {
                  updateConfig(prev => {
                    const srcIndex = prev.shortcuts.findIndex(s => s.id === sourceId);
                    const tgtIndex = prev.shortcuts.findIndex(s => s.id === targetId);
                    if (srcIndex === -1 || tgtIndex === -1) return prev;
                    
                    const newShortcuts = [...prev.shortcuts];
                    const [moved] = newShortcuts.splice(srcIndex, 1);
                    
                    const targetCategory = newShortcuts[tgtIndex >= srcIndex ? tgtIndex - 1 : tgtIndex].categoryId || prev.shortcuts[tgtIndex].categoryId;
                    moved.categoryId = targetCategory;
                    
                    newShortcuts.splice(tgtIndex, 0, moved);
                    
                    // Re-sort within the target category
                    let order = 0;
                    return {
                      ...prev,
                      shortcuts: newShortcuts.map(s => {
                        if (s.categoryId === targetCategory) {
                          return { ...s, sortOrder: order++ };
                        }
                        return s;
                      })
                    };
                  });
                }}
                onMoveToCategory={(sourceId, categoryId) => {
                  updateConfig(prev => ({
                    ...prev,
                    shortcuts: prev.shortcuts.map(s => s.id === sourceId ? { ...s, categoryId, sortOrder: 999 } : s)
                  }));
                }}
                onEditShortcut={(id) => {
                  setIsEditPanelOpen(true);
                  // We can pass an event to window to tell EditPanel to open shortcuts tab
                  window.dispatchEvent(new CustomEvent('open-edit-panel-tab', { detail: { tab: 'shortcuts', id } }));
                }}
              />
            </div>
          </main>

          {/* Right Sidebar Widgets */}
          <aside className="hidden lg:flex flex-col gap-6 w-[280px] shrink-0 pt-[124px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
             {rightWidgets.map(w => <WidgetRenderer key={w.id} widget={w} />)}
          </aside>
        </div>

        {/* Bottom Widgets (visible on smaller screens too) */}
        {bottomWidgets.length > 0 && (
          <footer className="mt-8 flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
             {bottomWidgets.map(w => <WidgetRenderer key={w.id} widget={w} />)}
          </footer>
        )}
      </div>

      {/* Edit Button */}
      <button 
        onClick={() => setIsEditPanelOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-black/60 hover:border-white/30 transition-all duration-300 z-40 group"
      >
        <SettingsIcon size={24} className="group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Edit Panel Overlay */}
      {isEditPanelOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsEditPanelOpen(false)}
        />
      )}
      <EditPanel 
        config={config} 
        updateConfig={updateConfig} 
        resetConfig={resetConfig}
        isOpen={isEditPanelOpen} 
        setIsOpen={setIsEditPanelOpen} 
      />
    </div>
  );
}

