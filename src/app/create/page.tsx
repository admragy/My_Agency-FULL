// Path: src/app/create/page.tsx
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
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();
  
  const handleKeywordAdd = () => {
    if (keywordsInput.trim()) {
      setKeywords([...keywords, keywordsInput.trim()]);
      setKeywordsInput('');
    }
  };

  async function handleSubmit() {
    setLoading(true);
    setStatusMsg('جاري الاتصال بالأقمار الصناعية... (Google API)');
    
    try {
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, niche, location, keywords, opener }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatusMsg(`✅ تم اصطياد ${data.leads_count} عميل! جاري التحويل...`);
        setTimeout(() => router.push(`/campaigns/${data.campaign_id}`), 1500);
      } else {
        setStatusMsg(`❌ خطأ: ${data.error || 'فشل غير معروف'}`);
      }
    } catch (e) {
      setStatusMsg('❌ خطأ في الاتصال بالسيرفر');
    }
    setLoading(false);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">🚀 غرفة عمليات الصيد</h1>
          <p className="text-gray-500">أنشئ حملة جديدة واستهدف عملاءك بدقة الليزر</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 grid gap-8 md:grid-cols-2">
            
            {/* Right Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الحملة</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="مثال: حملة عقارات التجمع"
                  value={name} onChange={e => setName(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المجال (Niche)</label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={niche} onChange={e => setNiche(e.target.value)}
                >
                  <option value="">اختر المجال...</option>
                  <option value="real_estate">🏠 عقارات</option>
                  <option value="dentist">🦷 طب أسنان</option>
                  <option value="cars">🚗 سيارات</option>
                  <option value="general">🔍 عام</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة المستهدفة</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="مثال: القاهرة الجديدة"
                  value={location} onChange={e => setLocation(e.target.value)} 
                />
              </div>
            </div>

            {/* Left Column: Keywords & Opener */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكلمات المفتاحية</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="أضف كلمة (مثال: مطلوب شقة)"
                    value={keywordsInput} 
                    onChange={e => setKeywordsInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleKeywordAdd()} 
                  />
                  <button 
                    onClick={handleKeywordAdd}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    أضف
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((k, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                      {k} <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="hover:text-blue-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رسالة الافتتاح (Opener)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition h-32 resize-none"
                  placeholder="اكتب الرسالة التي سيفتتح بها الـ AI المحادثة..."
                  value={opener} onChange={e => setOpener(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Status Bar & Action Button */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col items-center">
            {statusMsg && (
              <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-bold ${statusMsg.includes('خطأ') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {statusMsg}
              </div>
            )}
            
            <button 
              onClick={handleSubmit}
              disabled={loading || !name || keywords.length === 0}
              className={`w-full md:w-1/2 py-4 rounded-xl text-lg font-bold text-white shadow-lg transition transform hover:-translate-y-1 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'}`}
            >
              {loading ? '⏳ جاري البحث في الشبكة...' : '🔥 إطلاق الصياد الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
