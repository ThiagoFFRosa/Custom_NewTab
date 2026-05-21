import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, X, Trash2, Plus, RotateCcw, Save } from 'lucide-react';
import { DashboardConfig, Shortcut, Category, Widget } from '../types';
import { GlassCard } from './GlassCard';
import { IconPicker } from './IconPicker';
import { ColorPickerField } from './ColorPickerField';
import { deleteBackground, deleteIcon, listBackgrounds, listIcons, uploadBackground, uploadIcon } from '../services/api';

interface EditPanelProps {
  config: DashboardConfig;
  updateConfig: (updater: Partial<DashboardConfig> | ((prev: DashboardConfig) => DashboardConfig)) => void;
  resetConfig: () => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export function EditPanel({ config, updateConfig, resetConfig, isOpen, setIsOpen }: EditPanelProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'shortcuts' | 'categories' | 'widgets'>('appearance');
  const [highlightedShortcutId, setHighlightedShortcutId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleOpenEditPanel = (e: any) => {
      const { tab, id } = e.detail;
      if (tab) setActiveTab(tab);
      if (id) {
        setHighlightedShortcutId(id);
        // We defer scrolling because the DOM needs time to render the ShortcutsTab
        setTimeout(() => {
          const el = document.getElementById(`edit-shortcut-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect by injecting a class
            el.classList.add('ring-2', 'ring-white/80', 'bg-white/10');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-white/80', 'bg-white/10');
            }, 1500);
          }
        }, 100);
      }
    };
    window.addEventListener('open-edit-panel-tab', handleOpenEditPanel);
    return () => window.removeEventListener('open-edit-panel-tab', handleOpenEditPanel);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-50 flex animate-in slide-in-from-right duration-300">
      <GlassCard className="w-full h-full rounded-none border-y-0 border-r-0 border-l-white/20 bg-black/80 flex flex-col shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-medium text-white flex items-center gap-2">
            <SettingsIcon size={20} />
            Settings
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto shrink-0 border-b border-white/10 custom-scrollbar">
          {['appearance', 'shortcuts', 'categories', 'widgets'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'text-white border-b-2 border-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === 'appearance' && (
            <AppearanceTab config={config} updateConfig={updateConfig} resetConfig={resetConfig} />
          )}
          {activeTab === 'shortcuts' && (
            <ShortcutsTab config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'categories' && (
            <CategoriesTab config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'widgets' && (
            <WidgetsTab config={config} updateConfig={updateConfig} />
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// --- Tabs Implementation ---

function AppearanceTab({ config, updateConfig, resetConfig }: any) {
  const { appearance, search } = config.settings;
  const [backgrounds, setBackgrounds] = useState<Array<{filename:string;url:string}>>([]);

  const refreshBackgrounds = async () => {
    try { setBackgrounds(await listBackgrounds()); } catch (e) { console.error(e); }
  };

  useEffect(() => { refreshBackgrounds(); }, []);
  const updateAppearance = (changes: any) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      settings: { ...prev.settings, appearance: { ...prev.settings.appearance, ...changes } }
    }));
  };
  const updateSearch = (changes: any) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      settings: { ...prev.settings, search: { ...prev.settings.search, ...changes } }
    }));
  };

  return (
    <div className="space-y-8 text-white text-sm">
      <div className="space-y-4 border-b border-white/10 pb-6">
        <label className="block text-white/70 font-medium">Search Bar Placeholder</label>
        <input 
          type="text" 
          value={search.placeholder || ''} 
          onChange={e => updateSearch({ placeholder: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-white/30 text-white"
          placeholder="Search placeholder..."
        />
      </div>

      <div className="space-y-4">
        <label className="block text-white/70 font-medium">Background Type</label>
        <div className="flex bg-black/40 rounded-lg p-1">
          {['url', 'color', 'random'].map(t => (
            <button
              key={t}
              onClick={() => updateAppearance({ backgroundType: t })}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                appearance.backgroundType === t ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {appearance.backgroundType === 'url' && (
        <div className="space-y-4">
          <label className="block text-white/70 font-medium">Background Image</label>
          <input 
            type="text"
            value={appearance.backgroundUrl}
            onChange={e => updateAppearance({ backgroundUrl: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-white/30 text-white mb-2"
            placeholder="Image URL..."
          />
          <input
             type="file"
             accept="image/png,image/jpeg,image/webp"
             onChange={async (e) => {
               const file = e.target.files?.[0];
               if (!file) return;
               try {
                 const uploaded = await uploadBackground(file);
                 await refreshBackgrounds();
                 updateAppearance({ backgroundType: 'url', backgroundUrl: uploaded.url });
               } catch (err) {
                 console.error('Falha no upload de background', err);
               }
             }}
             className="w-full text-xs text-white/50 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 mb-4 cursor-pointer"
          />
          <div className="grid grid-cols-2 gap-2">
            {backgrounds.map((bg) => (
              <button
                key={bg.filename}
                onClick={() => updateAppearance({ backgroundType: 'url', backgroundUrl: bg.url })}
                className={`h-24 rounded-lg bg-cover bg-center border-2 transition-all ${
                  appearance.backgroundUrl === bg.url ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                style={{ backgroundImage: `url(${bg.url})` }}
              >
                <span
                  onClick={(e) => { e.stopPropagation(); if (confirm('Deletar imagem?')) deleteBackground(bg.filename).then(refreshBackgrounds).catch(console.error); }}
                  className="inline-flex text-[10px] bg-black/60 px-2 py-1 rounded ml-1 mt-1"
                >del</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-white/10 space-y-6">
        <ColorPickerField 
          label="Background Color (Fallback)" 
          value={appearance.backgroundColor || '#050505'}
          onChange={val => updateAppearance({ backgroundColor: val })}
        />
        <ColorPickerField 
          label="Overlay Color" 
          value={appearance.overlayColor || '#000000'}
          onChange={val => updateAppearance({ overlayColor: val })}
        />
        <ColorPickerField 
          label="Overall Accent Color" 
          value={appearance.accentColor || '#ffffff'}
          onChange={val => updateAppearance({ accentColor: val })}
        />
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-white/70 font-medium">
          <span>Overlay Opacity</span>
          <span>{Math.round(appearance.overlayOpacity * 100)}%</span>
        </label>
        <input 
          type="range" min="0" max="1" step="0.05"
          value={appearance.overlayOpacity}
          onChange={e => updateAppearance({ overlayOpacity: parseFloat(e.target.value) })}
          className="w-full accent-white"
        />
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-white/70 font-medium">
          <span>Blur</span>
          <span>{appearance.blur}px</span>
        </label>
        <input 
          type="range" min="0" max="20" step="1"
          value={appearance.blur}
          onChange={e => updateAppearance({ blur: parseInt(e.target.value) })}
          className="w-full accent-white"
        />
      </div>

      <div className="space-y-2">
        <label className="flex justify-between text-white/70 font-medium">
          <span>Vignette Intesity</span>
          <span>{appearance.vignette}%</span>
        </label>
        <input 
          type="range" min="0" max="150" step="10"
          value={appearance.vignette}
          onChange={e => updateAppearance({ vignette: parseInt(e.target.value) })}
          className="w-full accent-white"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-white/70 font-medium">Density</label>
        <div className="flex bg-black/40 rounded-lg p-1">
          {['compact', 'comfortable', 'spacious'].map(d => (
            <button
              key={d}
              onClick={() => updateAppearance({ density: d })}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                appearance.density === d ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-white/10">
        <button 
          onClick={resetConfig}
          className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors py-2 px-4 rounded-lg bg-rose-500/10 hover:bg-rose-500/20"
        >
          <RotateCcw size={16} />
          Reset to Factory Defaults
        </button>
      </div>
    </div>
  );
}

function ShortcutsTab({ config, updateConfig }: any) {
  const [icons, setIcons] = useState<Array<{filename:string;url:string}>>([]);
  const refreshIcons = async () => { try { setIcons(await listIcons()); } catch (e) { console.error(e); } };
  useEffect(() => { refreshIcons(); }, []);
  const toggleShortcut = (id: string) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      shortcuts: prev.shortcuts.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  const updateShortcut = (id: string, updates: any) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      shortcuts: prev.shortcuts.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const removeShortcut = (id: string) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      shortcuts: prev.shortcuts.filter(s => s.id !== id)
    }));
  };

  const addShortcut = () => {
    const id = 's_' + Date.now();
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      shortcuts: [...prev.shortcuts, {
        id,
        title: 'New Shortcut',
        url: 'https://',
        categoryId: prev.categories[0]?.id || '',
        iconType: 'lucide',
        iconValue: 'Link',
        enabled: true,
        openInNewTab: false,
        sortOrder: prev.shortcuts.length + 1
      }]
    }));
  };

  return (
    <div className="space-y-4">
      {config.shortcuts.map((s: Shortcut) => (
        <div id={`edit-shortcut-${s.id}`} key={s.id} className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-4 relative group transition-colors duration-500">
          <button 
            onClick={() => removeShortcut(s.id)}
            className="absolute top-4 right-14 text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove Shortcut"
          >
            <Trash2 size={16} />
          </button>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-medium">{s.title || 'Untitled'}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-10">
              <input type="checkbox" className="sr-only peer" checked={s.enabled} onChange={() => toggleShortcut(s.id)} />
              <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/80"></div>
            </label>
          </div>
          
          {s.enabled && (
             <div className="space-y-3 pt-3 border-t border-white/10">
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1" title="Name shown on the card">Title</label>
                    <input 
                      type="text" 
                      value={s.title}
                      onChange={e => updateShortcut(s.id, { title: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                      placeholder="Short Title"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1" title="Optional small text below title">Subtitle</label>
                    <input 
                      type="text" 
                      value={s.subtitle || ''}
                      onChange={e => updateShortcut(s.id, { subtitle: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                      placeholder="Optional text"
                    />
                 </div>
               </div>
               <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">URL</label>
                  <input 
                    type="text" 
                    value={s.url}
                    onChange={e => updateShortcut(s.id, { url: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                    placeholder="https://"
                  />
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Category</label>
                    <select 
                      value={s.categoryId}
                      onChange={e => updateShortcut(s.id, { categoryId: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                    >
                      {config.categories.map((c: Category) => (
                        <option key={c.id} value={c.id} className="bg-black/80">{c.name}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Icon Type</label>
                    <select 
                      value={s.iconType}
                      onChange={e => updateShortcut(s.id, { iconType: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                    >
                      <option value="lucide" className="bg-black/80">Lucide</option>
                      <option value="favicon" className="bg-black/80">Favicon</option>
                      <option value="text" className="bg-black/80">Text</option>
                      <option value="image" className="bg-black/80">Image</option>
                    </select>
                 </div>
               </div>
               {s.iconType !== 'favicon' && (
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">
                      {s.iconType === 'lucide' ? 'Icon Name (e.g. Github)' : s.iconType === 'text' ? 'Short Text (1-2 chars)' : 'Image URL'}
                    </label>
                    {s.iconType === 'lucide' ? (
                      <IconPicker 
                        value={s.iconValue}
                        onChange={v => updateShortcut(s.id, { iconValue: v })}
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                      />
                    ) : (
                      <>
                      <input 
                        type="text" 
                        value={s.iconValue}
                        onChange={e => updateShortcut(s.id, { iconValue: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                      />
                      {s.iconType === 'image' && (<>
                        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e)=>{const f=e.target.files?.[0]; if(!f) return; try {const up=await uploadIcon(f); updateShortcut(s.id,{iconValue:up.url}); await refreshIcons();} catch(err){console.error(err);}}} className="w-full text-xs text-white/50 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-white/10" />
                        <div className="grid grid-cols-4 gap-1 mt-2">{icons.map((ic)=> <button key={ic.filename} onClick={()=>updateShortcut(s.id,{iconValue:ic.url, iconType:'image'})} className="h-10 rounded bg-white/5 relative"><img src={ic.url} className="w-full h-full object-contain"/><span onClick={(e)=>{e.stopPropagation(); if(confirm('Deletar ícone?')) deleteIcon(ic.filename).then(refreshIcons);}} className="absolute top-0 right-0 text-[9px]">x</span></button>)}</div>
                      </>)}
                      </>
                    )}
                 </div>
               )}
               <div className="pt-2 space-y-4">
                 <ColorPickerField 
                   label="Icon Color" 
                   value={s.iconColor || '#ffffff'}
                   onChange={val => updateShortcut(s.id, { iconColor: val })}
                 />
                 <ColorPickerField 
                   label="Accent Color" 
                   value={s.accentColor || ''}
                   onChange={val => updateShortcut(s.id, { accentColor: val })}
                 />
               </div>
               <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" className="sr-only peer" checked={s.showLabel ?? true} onChange={(e) => updateShortcut(s.id, { showLabel: e.target.checked })} />
                   <div className="w-7 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white/80"></div>
                 </label>
                 <span className="text-[10px] uppercase tracking-widest text-white/60">Show Label</span>
               </div>
             </div>
          )}
        </div>
      ))}
      <button onClick={addShortcut} className="w-full py-4 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} />
        Add Shortcut
      </button>
    </div>
  );
}

function CategoriesTab({ config, updateConfig }: any) {
  const toggleCategory = (id: string) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    }));
  };
  const updateCategory = (id: string, updates: any) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };
  const deleteCategory = (id: string) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };
  const addCategory = () => {
    const newId = 'cat_' + Math.random().toString(36).substr(2, 9);
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: newId, name: 'New Category', slug: 'new-category', enabled: true, sortOrder: prev.categories.length + 1 }
      ]
    }));
  };

  return (
    <div className="space-y-4">
      {config.categories.map((c: Category) => (
        <div key={c.id} className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-3 relative group">
          <div className="flex items-start justify-between gap-4">
           <div className="flex-1 space-y-2">
             <div className="flex items-center gap-2">
               {c.color && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />}
               <input
                 type="text"
                 value={c.name}
                 onChange={e => updateCategory(c.id, { name: e.target.value })}
                 className="bg-transparent border-none outline-none text-white font-medium w-full placeholder-white/30"
                 placeholder="Category Name"
               />
             </div>
           </div>
           <div className="flex items-center gap-3 shrink-0">
             <label className="relative inline-flex items-center cursor-pointer" title="Toggle Visibility">
               <input type="checkbox" className="sr-only peer" checked={c.enabled} onChange={() => toggleCategory(c.id)} />
               <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/80"></div>
             </label>
             <button 
               onClick={() => deleteCategory(c.id)}
               className="text-white/30 hover:text-red-400 transition-colors p-1"
               title="Delete Category"
             >
               <Trash2 size={16} />
             </button>
           </div>
          </div>
          {c.enabled && (
             <div className="pt-2 border-t border-white/10">
                <ColorPickerField 
                  label="Category Color" 
                  value={c.color || '#ffffff'}
                  onChange={val => updateCategory(c.id, { color: val })}
                />
             </div>
          )}
        </div>
      ))}
      
      <button 
        onClick={addCategory} 
        className="w-full py-4 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Category
      </button>
    </div>
  );
}

function WidgetsTab({ config, updateConfig }: any) {
  const toggleWidget = (id: string) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      widgets: prev.widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    }));
  };

  const updateWidget = (id: string, updates: any) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      widgets: prev.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  };

  const addWidget = () => {
    const id = 'w_' + Date.now();
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      widgets: [...prev.widgets, {
        id,
        type: 'linksSection',
        title: 'New Links',
        icon: 'Link2',
        enabled: true,
        position: 'left',
        size: 'small',
        config: {},
        sortOrder: prev.widgets.length + 1
      }]
    }));
  };

  const removeWidget = (id: string) => {
    updateConfig((prev: DashboardConfig) => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== id)
    }));
  };

  return (
    <div className="space-y-4">
      {config.widgets.map((w: Widget) => (
        <div key={w.id} className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-4 relative group">
          <button 
            onClick={() => removeWidget(w.id)}
            className="absolute top-4 right-14 text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove Widget"
          >
            <Trash2 size={16} />
          </button>
          <div className="flex items-center justify-between">
            <span className="text-white font-medium capitalize">{w.type.replace(/([A-Z])/g, ' $1').trim()} Widget</span>
            <label className="relative inline-flex items-center cursor-pointer ml-10">
              <input type="checkbox" className="sr-only peer" checked={w.enabled} onChange={() => toggleWidget(w.id)} />
              <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/80"></div>
            </label>
          </div>
          {w.enabled && (
             <div className="space-y-3 pt-3 border-t border-white/10">
               <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Type</label>
                  <select 
                    value={w.type}
                    onChange={e => updateWidget(w.id, { type: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                  >
                    <option value="clock" className="bg-black/80">Clock</option>
                    <option value="quickNotes" className="bg-black/80">Notes</option>
                    <option value="serviceStatus" className="bg-black/80">Service Status</option>
                    <option value="systemInfo" className="bg-black/80">System Info</option>
                    <option value="linksSection" className="bg-black/80">Links Section</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={w.title}
                    onChange={e => updateWidget(w.id, { title: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                  />
               </div>
               {w.type !== 'clock' && (
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Icon (Lucide name)</label>
                    <IconPicker 
                      value={w.icon || ''}
                      onChange={v => updateWidget(w.id, { icon: v })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                    />
                 </div>
               )}
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Position</label>
                    <select 
                      value={w.position}
                      onChange={e => updateWidget(w.id, { position: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                    >
                      <option value="left" className="bg-black/80">Left Sidebar</option>
                      <option value="right" className="bg-black/80">Right Sidebar</option>
                      <option value="bottom" className="bg-black/80">Bottom Footer</option>
                    </select>
                 </div>
               </div>
               
               {/* Widget Specific Configs */}
               {w.type === 'clock' && (
                 <div className="space-y-2 pt-2 border-t border-white/10">
                   <div className="flex items-center gap-2">
                     <input type="checkbox" checked={w.config.showSeconds ?? true} onChange={e => updateWidget(w.id, { config: { ...w.config, showSeconds: e.target.checked } })} />
                     <span className="text-xs text-white/60">Show Seconds</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <input type="checkbox" checked={w.config.format24h ?? true} onChange={e => updateWidget(w.id, { config: { ...w.config, format24h: e.target.checked } })} />
                     <span className="text-xs text-white/60">24-hour Format</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <input type="checkbox" checked={w.config.showDate ?? true} onChange={e => updateWidget(w.id, { config: { ...w.config, showDate: e.target.checked } })} />
                     <span className="text-xs text-white/60">Show Date</span>
                   </div>
                 </div>
               )}
               {w.type === 'quickNotes' && (
                 <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Placeholder Text</label>
                    <input 
                      type="text" 
                      value={w.config.placeholder || ''}
                      onChange={e => updateWidget(w.id, { config: { ...w.config, placeholder: e.target.value } })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 outline-none focus:border-white/30 text-white text-xs"
                    />
                 </div>
               )}
             </div>
          )}
        </div>
      ))}
      <button onClick={addWidget} className="w-full py-4 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} />
        Add Widget
      </button>
    </div>
  );
}
