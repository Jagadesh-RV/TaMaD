import { useState } from 'react';
import { FileText, Plus, Search, MoreVertical, Bold, Italic, List, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const MOCK_DOCS = [
  { id: '1', title: 'Product Requirements', updated: new Date(), type: 'doc' },
  { id: '2', title: 'Meeting Notes - Q3', updated: new Date(Date.now() - 86400000), type: 'note' },
  { id: '3', title: 'API Architecture', updated: new Date(Date.now() - 172800000), type: 'doc' },
];

export default function NotesPage() {
  const [activeDoc, setActiveDoc] = useState(MOCK_DOCS[0]);
  const [content, setContent] = useState('# Product Requirements\n\nThis document outlines the core requirements for the new MVP...');

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
            <button className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
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
          {MOCK_DOCS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc)}
              className={clsx(
                'w-full text-left p-3 rounded-xl transition-all',
                activeDoc.id === doc.id
                  ? 'bg-blue-50 border border-blue-100 shadow-sm'
                  : 'hover:bg-gray-100 border border-transparent'
              )}
            >
              <h3 className={clsx('font-medium text-sm truncate', activeDoc.id === doc.id ? 'text-blue-900' : 'text-gray-700')}>
                {doc.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">Updated {format(doc.updated, 'MMM d, yyyy')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
            <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><Bold size={18} /></button>
            <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><Italic size={18} /></button>
          </div>
          <div className="flex items-center gap-2 pl-4">
            <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><List size={18} /></button>
            <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"><CheckSquare size={18} /></button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">Saved just now</span>
            <button className="p-2 text-gray-400 hover:text-gray-800 rounded-lg transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-50 flex justify-center p-8">
          <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-2xl shadow-sm p-10 min-h-full">
            <input
              type="text"
              value={activeDoc.title}
              onChange={(e) => setActiveDoc({ ...activeDoc, title: e.target.value })}
              className="w-full text-4xl font-bold text-gray-900 mb-8 border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 bg-transparent"
              placeholder="Untitled Document"
            />
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[500px] text-gray-700 border-none focus:outline-none focus:ring-0 resize-none leading-relaxed bg-transparent"
              placeholder="Start writing..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
