// Path: src/app/campaigns/[id]/page.tsx

'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// أنواع البيانات (Schemas)
type Lead = {
  id: string;
  phone_number: string;
  status: string;
  intent_summary?: string;
};

type Interaction = {
  id: number;
  sender: string; // 'user' أو 'ai'
  message: string;
  created_at: string;
};

const STATUS_OPTIONS = ['new', 'تم الرد آلياً', 'مهتم', 'غير مهتم', 'موعد مؤكد', 'تم الإغلاق'];

export default function CampaignPage({ params }: { params: { id: string } }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [history, setHistory] = useState<Interaction[]>([]);
  const [message, setMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');

  // 1. جلب Leads
  const fetchLeads = useCallback(() => {
    supabase.from('leads').select('*').eq('campaign_id', params.id).order('created_at', { ascending: false })
      .then(({ data }) => {
        setLeads(data as Lead[] || []);
        if (!selectedLead && data && data.length > 0) {
            setSelectedLead(data[0] as Lead);
            setCurrentStatus(data[0].status);
        }
      });
  }, [params.id, selectedLead]);
  
  // 2. جلب تاريخ المحادثة للعميل المختار
  const fetchHistory = useCallback(() => {
    if (selectedLead?.phone_number) {
      supabase.from('interactions').select('id, sender, message, created_at').eq('phone_number', selectedLead.phone_number).order('created_at', { ascending: true })
        .then(({ data }) => setHistory(data as Interaction[] || []));
      const currentLeadData = leads.find(l => l.id === selectedLead.id);
      if (currentLeadData) setCurrentStatus(currentLeadData.status);
    }
  }, [selectedLead, leads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  
  // دالة الإرسال (للإرسال اليدوي أو الآلي - سنكملها عند إضافة AI)
  async function handleSendMessage() {
    if (!message.trim() || !selectedLead) return;

    // بما أننا ألغينا خطوة AI Closer مؤقتاً، هذا سيرسل الرسالة كـ "رد يدوي"
    
    setLoadingChat(true);
    const userMessage = message.trim();
    setMessage('');

    // حفظ رسالة المستخدم في الذاكرة
    await supabase.from('interactions').insert({
        phone_number: selectedLead.phone_number,
        message: userMessage,
        sender: 'user', // تعتبرها رسالة من الـ CRM
    });
    
    // تحديث الواجهة
    setHistory(prev => [...prev, { id: Date.now(), sender: 'user', message: userMessage, created_at: new Date().toISOString() }]);

    setLoadingChat(false);
    
    // ملاحظة: لو كنت نشرت AI Closer، كان الكود هنا هيستدعيه

  }
  
  // دالة تحديث الحالة يدوياً
  const handleStatusUpdate = async (newStatus: string) => {
      if (!selectedLead) return;
      setCurrentStatus(newStatus);
      await supabase.from('leads').update({ status: newStatus }).eq('id', selectedLead.id);
      alert(`تم تحديث حالة ${selectedLead.phone_number} إلى ${newStatus}`);
      fetchLeads();
  };


  return (
    <div className="flex h-screen bg-white">
      
      {/* Sidebar: قائمة الـ Leads & التحكم */}
      <div className="w-1/4 p-4 border-r overflow-y-auto bg-gray-50">
        <h1 className="text-xl font-bold mb-4">قائمة العملاء المحتملين</h1>
        <p className="text-sm mb-4">الحملة ID: {params.id.substring(0, 8)}...</p>

        {selectedLead && (
            <div className="mb-6 p-4 border rounded bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2">تحكم العميل: {selectedLead.phone_number}</h3>
                
                {/* حل مشكلة الاتصال */}
                <a href={`https://wa.me/${selectedLead.phone_number}`} target="_blank" className="block w-full text-center py-2 mb-3 text-white bg-green-500 rounded hover:bg-green-600">
                    📞 ابدأ محادثة WhatsApp
                </a>
                
                {/* تحديث الحالة يدوياً */}
                <label className="text-sm font-medium block mb-1">تحديث الحالة:</label>
                <select value={currentStatus} onChange={(e) => handleStatusUpdate(e.target.value)} 
                        className="w-full p-2 border rounded mb-3">
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                
                <p className="text-xs font-medium text-blue-700">النية المحللة: {selectedLead.intent_summary || 'جديد'}</p>
            </div>
        )}

        {leads.map(l => (
          <div key={l.id} className={`p-3 cursor-pointer mb-2 rounded border ${selectedLead?.id === l.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'}`} 
               onClick={() => setSelectedLead(l)}>
            <p className="font-semibold">{l.phone_number}</p>
            <span className={`text-sm ${l.status === 'مهتم' ? 'text-green-600' : 'text-gray-500'}`}>
                {l.status} | {l.intent_summary?.split('|')[0] || '..'}
            </span>
          </div>
        ))}
      </div>

      {/* Main Area: واجهة الدردشة */}
      <div className="flex-1 flex flex-col p-6">
        {selectedLead ? (
          <>
            <h2 className="text-2xl font-bold mb-4">المحادثة مع: {selectedLead.phone_number}</h2>
            
            {/* عرض الـ Chat History */}
            <div className="flex-1 overflow-y-auto p-4 mb-4 rounded border bg-white shadow-inner">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center p-10">لا يوجد سجل محادثات. أرسل الرسالة الافتتاحية.</p>
              ) : (
                history.map((h, index) => (
                  <div key={index} className={`mb-3 flex ${h.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs p-3 rounded-xl shadow ${h.sender === 'ai' ? 'bg-blue-100 text-left' : 'bg-green-100 text-right'}`}>
                      <span className="font-bold text-xs block mb-1">{h.sender === 'ai' ? '🤖 AI Closer' : '👤 أنت'}</span>
                      {h.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* إدخال رسالة */}
            <div className="flex">
              <input type="text" className="flex-1 p-3 border rounded-l-lg" placeholder="اكتب ردك اليدوي (هذا مجرد إدخال يدوي الآن)..." 
                     value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
              
              <button className="px-6 py-3 text-white bg-blue-600 rounded-r-lg disabled:opacity-50" onClick={handleSendMessage} disabled={loadingChat}>
                {loadingChat ? 'جاري الإرسال...' : 'إرسال (يدوي)'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 p-20">اختر عميلاً من القائمة الجانبية لبدء المتابعة.</div>
        )}
      </div>
    </div>
  );
}
