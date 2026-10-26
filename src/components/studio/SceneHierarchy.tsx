import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Box,
  Plus,
  Compass,
  Cpu,
  PackageCheck,
} from 'lucide-react';

interface SceneObjectItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
}

interface SceneHierarchyProps {
  objects: SceneObjectItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const SceneHierarchy: React.FC<SceneHierarchyProps> = ({
  objects,
  selectedId,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onOpenAddModal,
}) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'composite':
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      case 'imported':
        return <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Box className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 w-64 select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-wider text-slate-200">SCENE HIERARCHY</span>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 rounded hover:bg-cyan-900/60 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Object Outliner List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {objects.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <Compass className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Scene is empty.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 text-cyan-400 text-xs hover:underline cursor-pointer"
            >
              Add a primitive or model
            </button>
          </div>
        ) : (
          objects.map((obj) => {
            const isSelected = selectedId === obj.id;
            return (
              <div
                key={obj.id}
                onClick={() => onSelect(obj.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getIconForType(obj.type)}
                  <span className="truncate font-mono text-[11px]">{obj.name}</span>
                </div>

                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(obj.id, !obj.visible);
                    }}
                    title={obj.visible ? 'Hide Object' : 'Show Object'}
                    className="p-1 hover:text-cyan-400 rounded cursor-pointer"
                  >
                    {obj.visible ? (
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(obj.id);
                    }}
                    title="Duplicate Object"
                    className="p-1 hover:text-cyan-400 rounded cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(obj.id);
                    }}
                    title="Delete Object"
                    className="p-1 hover:text-rose-400 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Outliner Summary Footer */}
      <div className="p-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between px-3">
        <span>Nodes: {objects.length}</span>
        <span className="text-slate-400">PBR Live</span>
      </div>
    </div>
  );
};
