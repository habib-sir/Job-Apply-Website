import React from 'react';
import { JobPostItem } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { BD_DISTRICTS } from '../../data/districts';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  posts: JobPostItem[];
  onAddPost: () => void;
  onUpdatePost: (idx: number, field: keyof JobPostItem, val: any) => void;
  onRemovePost: (idx: number) => void;
}

export const JobPostsTableSection: React.FC<Props> = ({
  posts,
  onAddPost,
  onUpdatePost,
  onRemovePost,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h3 className="text-sm font-bold text-gray-900">পদের তালিকা ও জেলা যোগ্যতা</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddPost}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          পদ যোগ করুন
        </Button>
      </div>

      <div className="space-y-3">
        {posts.map((post, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1 sm:flex-2">
              <Input
                placeholder="পদের নাম (যেমন: সহকারী স্টেশন মাস্টার)"
                value={post.name}
                onChange={(e) => onUpdatePost(idx, 'name', e.target.value)}
                className="w-full"
                requiredStar
              />
            </div>
            <div className="w-full sm:w-28">
              <Input
                placeholder="পদসংখ্যা"
                type="number"
                value={post.count}
                onChange={(e) => onUpdatePost(idx, 'count', Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="w-full sm:flex-1">
              <select
                value={post.district}
                onChange={(e) => onUpdatePost(idx, 'district', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">সারাদেশ (ALL Districts)</option>
                {BD_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            {posts.length > 1 && (
              <button
                type="button"
                onClick={() => onRemovePost(idx)}
                className="self-end sm:self-center p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
