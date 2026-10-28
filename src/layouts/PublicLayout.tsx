import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, User, LogIn, ArrowRight, LogOut, Phone, MessageCircle, Facebook, BookOpen, Landmark, Building2, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HELPLINE = '01771522503';
const WHATSAPP = '8801771522503';
const FACEBOOK_URL = 'https://www.facebook.com/bdjobapply.site';

const publicLinks = [
  { to: '/', label: 'হোম' },
  { to: '/jobs', label: 'সকল চাকরি' },
  { to: '/jobs?category=govt', label: 'সরকারি চাকরি', icon: Landmark },
  { to: '/jobs?category=private', label: 'বেসরকারি চাকরি', icon: Building2 },
  { to: '/prep', label: 'প্রস্তুতি', icon: BookOpen },
  { to: '/how-to-apply', label: 'আবেদনের নিয়ম', icon: HelpCircle },
  { to: '/about', label: 'আমাদের সম্পর্কে', icon: Info },
  { to: '/contact', label: 'যোগাযোগ', icon: Phone },
];

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, mobile, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <a href="#main-content" className="skip-link">মূল কনটেন্টে যান</a>
      <div className="bg-emerald-950 text-emerald-50 text-xs py-2 px-4 text-center" role="note">
        সরকারি ও বেসরকারি চাকরির অনলাইন আবেদন ও টেলিটক আবেদন সার্ভিস
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 min-h-16 py-2 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="চাকরি আবেদন সার্ভিস হোম">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 flex items-center justify-center text-white shadow-sm" aria-hidden="true"><Briefcase className="w-5 h-5" /></div>
            <div><span className="font-bold text-gray-950 text-lg leading-tight block">চাকরি আবেদন সার্ভিস</span><span className="text-[11px] text-emerald-800 font-bold tracking-wide">সহজ • দ্রুত • নিরাপদ</span></div>
          </Link>

          <nav className="hidden xl:flex items-center gap-3" aria-label="প্রধান নেভিগেশন">
            {publicLinks.map(({ to, label, icon: Icon }) => <Link key={label} to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-emerald-800 px-2 py-2 rounded-lg hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">{Icon && <Icon className="w-4 h-4" aria-hidden="true" />}{label}</Link>)}
            {user ? <div className="flex items-center gap-2 ml-1">
              <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"><User className="w-4 h-4" aria-hidden="true" /><span>{role === 'admin' ? 'অ্যাডমিন' : 'ড্যাশবোর্ড'}</span></Link>
              <button onClick={async () => { await logout(); navigate('/'); }} className="inline-flex items-center gap-1.5 px-2.5 py-2 text-sm text-rose-800 hover:bg-rose-50 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200" title="লগআউট"><LogOut className="w-4 h-4" aria-hidden="true" /><span>লগআউট</span></button>
            </div> : <div className="flex items-center gap-2 ml-1"><Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50 px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"><LogIn className="w-4 h-4" aria-hidden="true" />লগইন</Link><Link to="/register" className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">রেজিস্ট্রেশন <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link></div>}
          </nav>

          <div className="xl:hidden flex items-center gap-2">
            {user && <button onClick={() => navigate(role === 'admin' ? '/admin' : '/dashboard')} className="px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">প্যানেল</button>}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-800 hover:bg-gray-100 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200" aria-label={mobileMenuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'} aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>

        {mobileMenuOpen && <div className="xl:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1" aria-label="মোবাইল নেভিগেশন">
          {publicLinks.map(({ to, label, icon: Icon }) => <Link key={label} to={to} onClick={closeMenu} className="flex items-center gap-2 py-2.5 px-2 text-sm font-bold text-gray-800 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">{Icon && <Icon className="w-4 h-4 text-emerald-700" aria-hidden="true" />}{label}</Link>)}
          {user ? <div className="space-y-2 pt-2 border-t border-gray-200"><Link to={role === 'admin' ? '/admin' : '/dashboard'} onClick={closeMenu} className="block py-2.5 text-center bg-emerald-700 text-white rounded-lg text-sm font-bold">{role === 'admin' ? 'অ্যাডমিন প্যানেল' : 'আমার ড্যাশবোর্ড'}</Link><button onClick={async () => { await logout(); closeMenu(); navigate('/'); }} className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-800 hover:bg-rose-50 rounded-lg text-sm font-bold border border-rose-200"><LogOut className="w-4 h-4" aria-hidden="true" />লগআউট</button></div> : <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200"><Link to="/login" onClick={closeMenu} className="py-2.5 text-center border border-emerald-700 text-emerald-800 rounded-lg text-sm font-bold">লগইন</Link><Link to="/register" onClick={closeMenu} className="py-2.5 text-center bg-emerald-700 text-white rounded-lg text-sm font-bold">রেজিস্ট্রেশন</Link></div>}
        </div>}
      </header>

      <main id="main-content" className="flex-1"><Outlet /></main>

      <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('আসসালামু আলাইকুম, চাকরির আবেদন সম্পর্কে সাহায্য চাই।')}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-[#128C7E] px-4 py-3 text-sm font-bold text-white shadow-xl hover:bg-[#075E54] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200" aria-label="WhatsApp-এ যোগাযোগ করুন" title="WhatsApp-এ যোগাযোগ করুন"><MessageCircle className="h-5 w-5" aria-hidden="true" /><span className="hidden sm:inline">WhatsApp</span></a>

      <footer className="bg-gray-950 text-gray-300 text-sm mt-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white" aria-hidden="true"><Briefcase className="w-4 h-4" /></div><span className="font-bold text-white text-base">চাকরি আবেদন সার্ভিস</span></div><p className="text-sm text-gray-300 leading-7">সরকারি ও বেসরকারি চাকরির নির্ভুল অনলাইন আবেদন সহায়তা।</p></div>
            <div><h2 className="text-white font-bold mb-3 text-sm">গুরুত্বপূর্ণ লিংক</h2><ul className="space-y-2 text-sm"><li><Link to="/how-to-apply" className="hover:text-emerald-300">আবেদনের নিয়ম</Link></li><li><Link to="/about" className="hover:text-emerald-300">আমাদের সম্পর্কে</Link></li><li><Link to="/contact" className="hover:text-emerald-300">যোগাযোগ</Link></li><li><Link to="/register" className="hover:text-emerald-300">নতুন অ্যাকাউন্ট তৈরি</Link></li></ul></div>
            <div><h2 className="text-white font-bold mb-3 text-sm">সরাসরি যোগাযোগ</h2><div className="flex items-center gap-3"><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp" className="w-11 h-11 rounded-full bg-[#128C7E] hover:bg-[#075E54] flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200"><MessageCircle className="w-5 h-5" aria-hidden="true" /></a><a href={`tel:${HELPLINE}`} aria-label="অফিশিয়াল হেল্পলাইন" title="অফিশিয়াল হেল্পলাইন" className="w-11 h-11 rounded-full bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"><Phone className="w-5 h-5" aria-hidden="true" /></a><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook Page" title="Facebook Page" className="w-11 h-11 rounded-full bg-[#1877F2] hover:bg-[#0d5dc1] flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><Facebook className="w-5 h-5" aria-hidden="true" /></a></div><p className="mt-3 text-sm text-gray-300">হেল্পলাইন: {HELPLINE}</p></div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">© {new Date().getFullYear()} চাকরি আবেদন সার্ভিস প্ল্যাটফর্ম। সর্বস্বত্ব সংরক্ষিত।</div>
        </div>
      </footer>
    </div>
  );
};
