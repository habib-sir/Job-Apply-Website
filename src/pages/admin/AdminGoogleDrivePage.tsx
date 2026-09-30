import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  Check,
  RefreshCw,
  Search,
  AlertCircle,
  Copy,
  FolderOpen,
  PieChart,
} from 'lucide-react';
import {
  isDriveConnected,
  connectGoogleDrive,
  disconnectGoogleDrive,
  getDriveUser,
  listDriveFiles,
  uploadFileToGoogleDrive,
  deleteDriveFile,
  getDriveStorageInfo,
  DriveFileItem,
  DriveStorageInfo,
} from '../../services/googleDrive';
import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../components/common/Toast';

export const AdminGoogleDrivePage: React.FC = () => {
  const [connected, setConnected] = useState(isDriveConnected());
  const [driveUser, setDriveUser] = useState(getDriveUser());
  const [storageInfo, setStorageInfo] = useState<DriveStorageInfo | null>(null);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'images'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    const isConn = isDriveConnected();
    setConnected(isConn);
    setDriveUser(getDriveUser());
    if (isConn) {
      loadData();
    }
  }, [filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [filesList, info] = await Promise.all([
        listDriveFiles({
          pageSize: 50,
          mimeFilter: filterType,
          searchQuery,
        }),
        getDriveStorageInfo().catch(() => null),
      ]);
      setFiles(filesList);
      if (info) setStorageInfo(info);
    } catch (err: any) {
      toastError(err.message || 'Google Drive তথ্য লোড করা যায়নি');
      if (err.message?.includes('কানেক্ট') || err.message?.includes('মেয়াদোত্তীর্ণ')) {
        setConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectGoogleDrive();
      setConnected(true);
      setDriveUser(getDriveUser());
      await loadData();
      success('Google Drive সফলভাবে সংযুক্ত হয়েছে!');
    } catch (err: any) {
      toastError(err.message || 'Google Drive কানেক্ট করতে ব্যর্থ হয়েছে');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleDrive();
    setConnected(false);
    setDriveUser(null);
    setFiles([]);
    setStorageInfo(null);
    success('Google Drive ডিসকানেক্ট করা হয়েছে');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadFileToGoogleDrive(file, file.name, { makePublic: true });
      success(`"${file.name}" সফলভাবে ড্রাইভে আপলোড হয়েছে!`);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'ফাইল আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (file: DriveFileItem) => {
    try {
      const ok = await deleteDriveFile(file.id, file.name);
      if (ok) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        success(`"${file.name}" মুছে ফেলা হয়েছে`);
      }
    } catch (err: any) {
      toastError(err.message || 'ফাইল মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    success('Google Drive লিঙ্ক কপি হয়েছে!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return '0 B';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPercentUsed = () => {
    if (!storageInfo?.limit || !storageInfo?.usage) return 0;
    const limit = parseInt(storageInfo.limit, 10);
    const usage = parseInt(storageInfo.usage, 10);
    if (isNaN(limit) || isNaN(usage) || limit === 0) return 0;
    return Math.min(100, Math.round((usage / limit) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Google Drive স্টোরেজ ব্যবস্থাপনা</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              চাকরির সার্কুলার ফাইল, সফট কপি এবং পেইড কপির ক্লাউড স্টোরেজ
            </p>
          </div>
        </div>

        {connected ? (
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
              {uploading ? <Spinner size="sm" /> : <UploadCloud className="w-4 h-4" />}
              <span>নতুন ফাইল আপলোড</span>
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              ডিসকানেক্ট
            </Button>
          </div>
        ) : (
          <GoogleSignInButton
            onClick={handleConnect}
            loading={connecting}
            text="Google Drive সংযুক্ত করুন"
          />
        )}
      </div>

      {!connected ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-xs text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <FolderOpen className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Google Drive কানেক্ট করা নেই</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Google Drive সংযুক্ত করলে চাকরির বড় বড় সার্কুলার PDF, আবেদনকারীদের সফট কপি এবং পেইড কপি
            সরাসরি গুগল ড্রাইভে আনলিমিটেড স্টোর করতে পারবেন এবং সহজেই শেয়ারেবল লিঙ্ক তৈরি হবে।
          </p>
          <GoogleSignInButton
            onClick={handleConnect}
            loading={connecting}
            text="Google Drive সংযুক্ত করুন"
          />
        </div>
      ) : (
        <>
          {/* Storage Quota Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500">মোট ব্যবহৃত স্টোরেজ</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatBytes(storageInfo?.usage)}
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    / {formatBytes(storageInfo?.limit)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${getPercentUsed()}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HardDrive className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">কানেক্টেড অ্যাকাউন্ট</div>
                <div className="text-sm font-bold text-gray-900 truncate">
                  {driveUser?.name || 'Google Drive'}
                </div>
                <div className="text-xs text-gray-400 truncate">{driveUser?.email}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">লোড করা ফাইল</div>
                <div className="text-lg font-bold text-gray-900">{files.length} টি</div>
                <div className="text-xs text-emerald-600 font-medium">সরাসরি অ্যাক্সেসযোগ্য</div>
              </div>
            </div>
          </div>

          {/* Files List Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {(['all', 'pdf', 'images'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'সকল ফাইল' : type === 'pdf' ? 'PDF ডকুমেন্টস' : 'ছবিসমূহ'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="ফাইল সার্চ করুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadData()}
                    className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  loading={loading}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  রিফ্রেশ
                </Button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                <Spinner size="md" />
                <p className="text-xs mt-2">Google Drive থেকে ফাইল তালিকা আনা হচ্ছে...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">কোনো ফাইল পাওয়া যায়নি</p>
                <p className="text-xs text-gray-400 mt-1">
                  উপরে "নতুন ফাইল আপলোড" বাটনে ক্লিক করে ফাইল যোগ করুন।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">ফাইলের নাম</th>
                      <th className="px-4 py-3">সাইজ</th>
                      <th className="px-4 py-3">আপডেটের সময়</th>
                      <th className="px-4 py-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {files.map((file) => {
                      const isPdf = file.mimeType === 'application/pdf';
                      const link =
                        file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
                      return (
                        <tr key={file.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isPdf
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-blue-50 text-blue-600'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="font-medium text-gray-900 truncate max-w-xs sm:max-w-md">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatBytes(file.size)}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString('bn-BD', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => copyLink(link, file.id)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="লিঙ্ক কপি করুন"
                              >
                                {copiedId === file.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="ড্রাইভে প্রিভিউ দেখুন"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleDelete(file)}
                                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
