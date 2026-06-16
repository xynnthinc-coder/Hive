import React, { useRef, useState, useEffect } from 'react';
import { attachmentService } from '@/services/attachment';
import { Bold, Italic, Link, Code, Image as ImageIcon, FileUp, Loader2 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Tulis Markdown di sini...',
  minHeight = '150px',
  className = '',
  autoFocus = false,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleUpload = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    try {
      // Insert placeholder
      const placeholderText = `\n![Uploading ${file.name}...]()\n`;
      insertText(placeholderText, '');

      const res = await attachmentService.upload(file);
      
      // Replace placeholder with actual URL using backend MIME type
      const isImage = res.type?.startsWith('image/') || file.type.startsWith('image/');
      const currentVal = textareaRef.current?.value || '';
      const finalSyntax = isImage ? `\n![${file.name}](${res.url})\n` : `\n[${file.name}](${res.url})\n`;
      const newVal = currentVal.replace(placeholderText, finalSyntax);
      onChange(newVal);

    } catch (err) {
      alert('Gagal mengunggah file.');
      // Remove placeholder
      const currentVal = textareaRef.current?.value || '';
      onChange(currentVal.replace(`\n![Uploading ${file.name}...]()\n`, ''));
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleUpload(file);
          break;
        }
      }
    }
  };

  return (
    <div className={`flex flex-col rounded-xl border border-outline-variant/30 bg-surface-container overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-outline-variant/20 bg-surface-container-high/30 overflow-x-auto">
        <button type="button" onClick={() => insertText('**', '**')} className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertText('*', '*')} className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-outline-variant/30 mx-1" />
        <button type="button" onClick={() => insertText('[', '](url)')} className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" title="Link">
          <Link className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertText('`', '`')} className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors" title="Code">
          <Code className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-outline-variant/30 mx-1" />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors relative" 
          title="Upload File/Image"
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <FileUp className="w-4 h-4" />}
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }} 
        />
        <div className="ml-auto px-2 text-[0.65rem] text-on-surface-variant/50 hidden sm:block">
          Mendukung Markdown & Paste Gambar
        </div>
      </div>
      
      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="w-full bg-transparent p-3 text-sm text-on-surface placeholder-on-surface-variant/40 resize-y outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
