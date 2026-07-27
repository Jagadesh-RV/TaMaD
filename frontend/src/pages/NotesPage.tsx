import { useState, useEffect } from 'react';
import { FileText, Plus, Search, MoreVertical, Bold, Italic, List, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useNoteStore } from '../store/noteStore';
import { useAuthStore } from '../store/authStore';
import NoteModal from '../components/notes/NoteModal';

export default function NotesPage() {
  const workspace = useAuthStore(s => s.workspace);
  const { notes, fetchNotes, createNote, updateNote } = useNoteStore() as any;
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const workspaceId = workspace?._id || '';

  useEffect(() => {
    if (workspaceId) fetchNotes(workspaceId);
  }, [fetchNotes, workspaceId]);

  // Handle auto-selecting the first note after notes are loaded
  useEffect(() => {
    if (!activeDoc && notes?.length > 0) {
      setActiveDoc(notes[0]);
    }
  }, [notes, activeDoc]);

  const handleSaveNote = async (data: any) => {
    const newNote = await createNote({ ...data, workspaceId });
    if (newNote) {
      setActiveDoc(newNote);
    }
  };

  const handleUpdateContent = (content: string) => {
    if (!activeDoc) return;
    const updated = { ...activeDoc, content };
    setActiveDoc(updated);
    updateNote(activeDoc._id, { content }); // Auto save
  };
  
  const handleUpdateTitle = (title: string) => {
    if (!activeDoc) return;
    const updated = { ...activeDoc, title };
    setActiveDoc(updated);
    updateNote(activeDoc._id, { title }); // Auto save
  };

  return (
    <div className="page flex h-[calc(100vh-80px)] overflow-hidden p-0 bg-white border border-gray-200 rounded-3xl shadow-sm my-6 mr-6">
      
      {/* Sidebar: Document List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              Knowledge Base
            </h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search docs..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {notes?.length === 0 ? (
            <div className="text-center p-4 text-sm text-gray-400 font-medium">
              No notes yet. Click + to create one.
            </div>
          ) : notes?.map((doc: any) => (
            <button
              key={doc._id}
              onClick={() => setActiveDoc(doc)}
              className={clsx(
                'w-full text-left p-3 rounded-xl transition-all',
                activeDoc?._id === doc._id
                  ? 'bg-blue-50 border border-blue-100 shadow-sm'
                  : 'hover:bg-gray-100 border border-transparent'
              )}
            >
              <h3 className={clsx('font-medium text-sm truncate', activeDoc?._id === doc._id ? 'text-blue-900' : 'text-gray-700')}>
                {doc.title || 'Untitled Document'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Updated {doc.updatedAt ? format(new Date(doc.updatedAt), 'MMM d, yyyy') : 'Just now'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 relative">
        {activeDoc ? (
          <>
            {/* Editor Toolbar */}
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><Bold size={18} /></button>
                <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><Italic size={18} /></button>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><List size={18} /></button>
                <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><CheckSquare size={18} /></button>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400">Auto-saved</span>
                <button className="p-2 text-gray-400 hover:text-gray-800 rounded-lg transition-colors"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto flex justify-center p-8 pt-24">
              <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-sm p-10 min-h-[800px]">
                <input
                  type="text"
                  value={activeDoc.title || ''}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="w-full text-4xl font-bold text-gray-900 mb-8 border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 bg-transparent"
                  placeholder="Untitled Document"
                />
                
                <textarea
                  value={activeDoc.content || ''}
                  onChange={(e) => handleUpdateContent(e.target.value)}
                  className="w-full h-full min-h-[500px] text-gray-700 border-none focus:outline-none focus:ring-0 resize-none leading-relaxed bg-transparent"
                  placeholder="Start writing..."
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
            Select a note or create a new one
          </div>
        )}
      </div>

      <NoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  );
}
