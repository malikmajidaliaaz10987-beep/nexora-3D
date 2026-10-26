import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  Box,
  Copy,
  Trash2,
  Download,
  Calendar,
  Layers,
  Edit2,
  Check,
  Upload,
} from 'lucide-react';
import { ProjectScene } from '../../types/project';
import {
  getSavedProjects,
  saveProject,
  deleteProject,
  duplicateProject,
} from '../../lib/storage/projectStorage';

interface ProjectsViewProps {
  onOpenProject: (project: ProjectScene) => void;
  onNewProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenProject,
  onNewProject,
}) => {
  const [projects, setProjects] = useState<ProjectScene[]>(getSavedProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const refreshList = () => {
    setProjects(getSavedProjects());
  };

  const handleDuplicate = (id: string) => {
    duplicateProject(id);
    refreshList();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProject(id);
      refreshList();
    }
  };

  const handleStartRename = (project: ProjectScene) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveRename = (project: ProjectScene) => {
    if (editName.trim()) {
      saveProject({ ...project, name: editName.trim() });
      refreshList();
    }
    setEditingId(null);
  };

  const handleExportJSON = (project: ProjectScene) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}.nexora3d.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.name && parsed.objects) {
          const importedProj: ProjectScene = {
            ...parsed,
            id: `proj_import_${Date.now()}`,
            name: `${parsed.name} (Imported)`,
            updatedAt: Date.now(),
          };
          saveProject(importedProj);
          refreshList();
        }
      } catch (err) {
        alert('Invalid project JSON file');
      }
    };
    reader.readAsText(file);
  };

  const allTags = ['all', ...Array.from(new Set(projects.flatMap((p) => p.tags || [])))];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || (p.tags && p.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold tracking-wider text-slate-100">PROJECT LIBRARY</h2>
            <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              {projects.length} Saved
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access, duplicate, edit, and export your 3D models and multi-object environments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer shadow-lg shadow-cyan-950"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Scene</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by name or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:border-cyan-500/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-24 text-center text-slate-500 space-y-3 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
          <Box className="w-12 h-12 mx-auto opacity-30 text-cyan-400" />
          <p className="text-sm">No projects matching your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('all');
            }}
            className="text-xs text-cyan-400 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isEditing = editingId === project.id;
            const updatedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all backdrop-blur-sm shadow-md hover:shadow-cyan-950/20"
              >
                {/* Card Top Preview / Banner */}
                <div
                  onClick={() => onOpenProject(project)}
                  className="h-36 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 flex flex-col justify-between relative cursor-pointer border-b border-slate-800/60 group-hover:brightness-105"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/60 text-cyan-400">
                      {(project.objects?.length || 1)} Parts
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {project.polyCount ? `${project.polyCount.toLocaleString()} Polys` : 'PBR Model'}
                    </span>
                  </div>

                  {/* Centered Graphic Silhouette Icon */}
                  <div className="flex items-center justify-center py-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
                      <Box className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(project.tags || []).slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950/80 border border-slate-800 text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-slate-950 border border-cyan-500/60 rounded px-2 py-1 text-xs text-slate-200 font-semibold w-full focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveRename(project)}
                          className="p-1 text-emerald-400 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3
                          onClick={() => onOpenProject(project)}
                          className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate cursor-pointer"
                        >
                          {project.name}
                        </h3>
                        <button
                          onClick={() => handleStartRename(project)}
                          title="Rename"
                          className="p-1 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {project.description || 'Custom interactive 3D model project.'}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {updatedDate}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleExportJSON(project)}
                        title="Download JSON Spec"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(project.id)}
                        title="Duplicate Project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        title="Delete Project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenProject(project)}
                        className="ml-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/60 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
