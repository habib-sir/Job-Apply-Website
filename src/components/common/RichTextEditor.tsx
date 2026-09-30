import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Table,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export const RichTextEditor: React.FC<Props> = ({ value, onChange, label }) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const insertSnippet = (snippet: string) => {
    onChange((value || '') + snippet);
  };

  const handleInsertTable = () => {
    const tableTemplate = `
<table border="1" style="width:100%; border-collapse:collapse; margin:10px 0;">
  <thead>
    <tr style="background-color:#f3f4f6;">
      <th style="padding:8px; border:1px solid #d1d5db;">পদের নাম</th>
      <th style="padding:8px; border:1px solid #d1d5db;">পদসংখ্যা</th>
      <th style="padding:8px; border:1px solid #d1d5db;">শিক্ষাগত যোগ্যতা</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #d1d5db;">সহকারী অফিসার</td>
      <td style="padding:8px; border:1px solid #d1d5db;">০৫ জন</td>
      <td style="padding:8px; border:1px solid #d1d5db;">স্নাতক/সমমান</td>
    </tr>
  </tbody>
</table>
`;
    insertSnippet(tableTemplate);
  };

  const handleInsertImage = () => {
    const url = prompt('ছবির সরাসরি ইমেজ লিংক (URL) দিন:');
    if (url) {
      insertSnippet(`<p><img src="${url}" alt="Circular" style="max-width:100%; border-radius:8px; margin:10px 0;" /></p>`);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('লিংক (URL) লিখুন:');
    const text = prompt('লিংকের টেক্সট লিখুন:', 'এখানে ক্লিক করুন');
    if (url && text) {
      insertSnippet(`<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#059669; font-weight:bold;">${text}</a>`);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              tab === 'write' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>লিখুন</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              tab === 'preview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>প্রিভিউ</span>
          </button>
        </div>
      </div>

      <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
        {tab === 'write' ? (
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
              <button
                type="button"
                onClick={() => insertSnippet('<b>বোল্ড টেক্সট</b>')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('<i>ইটালিক টেক্সট</i>')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => insertSnippet('<h2>শিরোনাম ২</h2>')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('<h3>শিরোনাম ৩</h3>')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => insertSnippet('<ul>\n  <li>পয়েন্ট ১</li>\n  <li>পয়েন্ট ২</li>\n</ul>')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('<ol>\n  <li>ক্রম ১</li>\n  <li>ক্রম ২</li>\n</ol>')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={handleInsertTable}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Insert Table"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Insert Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
                title="Insert Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={12}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="চাকরির বিস্তারিত বিবরণ, পদের শর্তাবলী, আবেদনের নিয়ম ও অন্যান্য তথ্য এখানে লিখুন বা ফরম্যাট করুন..."
              className="w-full p-4 text-sm font-sans focus:outline-none resize-y"
            />
          </div>
        ) : (
          <div
            className="p-5 prose prose-sm max-w-none min-h-[300px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value || '<p className="text-gray-400">কোনো কনটেন্ট লেখা হয়নি</p>') }}
          />
        )}
      </div>
    </div>
  );
};
