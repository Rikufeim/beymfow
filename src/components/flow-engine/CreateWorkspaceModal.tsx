import React, { useState } from "react";
import { X, Plus } from "lucide-react";


interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim() || undefined);
    setName("");
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Create new workspace</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  Workspace name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Solutions, Websites, Marketing..."
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-600 focus:border-blue-500 focus:outline-none text-white placeholder-neutral-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What kind of projects will this workspace contain?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-600 focus:border-blue-500 focus:outline-none text-white placeholder-neutral-500 resize-none transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create workspace
                </button>
              </div>
            </form>
      </div>
    </div>
  );
};
