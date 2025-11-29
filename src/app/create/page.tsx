'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCampaign() {
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [opener, setOpener] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleKeywordAdd = () => {
    if (keywordsInput.trim()) {
      setKeywords([...keywords, keywordsInput.trim()]);
      setKeywordsInput('');
    }
  };

  async function handleSubmit() {
    setLoading(true);
    // هنا نستدعي الـ API
    const res = await fetch('/api/campaigns/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, niche, location, keywords, opener }),
    });
    const data = await res.json();
    setLoading(false);
    
    if (res.ok && data.campaign_id) {
        router.push(`/campaigns/${data.campaign_id}`);
    } else {
        alert(data.error || 'فشل الإطلاق');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🚀 إطلاق حملة صيد جديدة</h1>
          <p className="text-gray-500 mt-2">املأ البيانات لبدء البحث عن عملاء جدد</p>
        </div>

        <div className="space-y-6">
          
          {/* الصف الأول */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحملة</label>
              <input 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="مثال: عقارات التجمع" 
                value={name} onChange={e => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المجال (Niche)</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={niche} onChange={e => setNiche(e.target.value)}
              >
                <option value="">اختر المجال...</option>
                <option value="real_estate">🏠 عقارات</option>
                <option value="dentist">🦷 طب أسنان</option>
                <option value="broker">💰 استثمار</option>
                <option value="general">🔍 عام</option>
              </select>
            </div>
          </div>

          {/* المنطقة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة المستهدفة</label>
            <input 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="القاهرة، الجيزة، التجمع الخامس" 
              value={location} onChange={e => setLocation(e.target.value)} 
            />
          </div>

          {/* الكلمات المفتاحية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الكلمات المفتاحية</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="اكتب كلمة واضغط إضافة (مثال: مطلوب شقة)" 
                value={keywordsInput} 
                onChange={e => setKeywordsInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleKeywordAdd()}
              />
              <button 
                onClick={handleKeywordAdd}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                إضافة
              </button>
            </div>
            
            {/* عرض الكلمات المضافة */}
            <div className="flex flex-wrap gap-2 mt-3">
              {keywords.map((k, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center border border-blue-100">
                  {k}
                  <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="mr-2 text-blue-400 hover:text-blue-600">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* الرسالة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة الافتتاحية (Opener)</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition h-24 resize-none"
              placeholder="الرسالة التي سيتم إرسالها للعميل..."
              value={opener} onChange={e => setOpener(e.target.value)} 
            />
            <div className="text-left text-xs text-gray-400 mt-1">{opener.length}/150</div>
          </div>

          {/* زر الإطلاق */}
          <button 
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition transform hover:-translate-y-0.5 ${
              !name || !niche || keywords.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'
            }`}
            disabled={!name || !niche || keywords.length === 0 || loading} 
            onClick={handleSubmit}
          >
            {loading ? '⏳ جاري البحث وتجهيز العملاء...' : '🚀 إطلاق الحملة الآن'}
          </button>

        </div>
      </div>
    </div>
  );
}
