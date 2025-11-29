// Path: src/app/api/campaigns/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, niche, location, keywords, opener } = body;

    // 1. التأكد من المفاتيح
    if (!process.env.GOOGLE_KEY || !process.env.GOOGLE_CX || !process.env.SCRAPINGBEE_KEY) {
      return NextResponse.json({ error: 'مفاتيح API ناقصة في Vercel!' }, { status: 500 });
    }

    // 2. إنشاء الحملة
    const { data: camp, error: campError } = await supabase
      .from('campaigns')
      .insert({ name, niche, location, keywords, opener, status: 'running' })
      .select('id')
      .single();

    if (campError) throw new Error(`فشل إنشاء الحملة: ${campError.message}`);

    // 3. البحث في جوجل
    const query = `${keywords.join(' | ')} ${location} "010" OR "011" OR "012"`;
    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(query)}&num=10`;

    let searchResults = [];
    try {
      const gRes = await axios.get(googleUrl);
      searchResults = gRes.data.items || [];
    } catch (e: any) {
      return NextResponse.json({ error: `خطأ في جوجل: ${e.response?.data?.error?.message || e.message}` }, { status: 500 });
    }

    if (searchResults.length === 0) {
      return NextResponse.json({ error: 'جوجل لم يجد أي نتائج لهذا البحث!' }, { status: 404 });
    }

    // 4. استخراج الأرقام (Scraping)
    let phones: string[] = [];
    for (const item of searchResults) {
      try {
        const scrapeRes = await axios.get('https://app.scrapingbee.com/api/v1', {
          params: {
            api_key: process.env.SCRAPINGBEE_KEY,
            url: item.link,
            render_js: 'false', // توفير للرصيد وتسريع
          },
        });
        
        // Regex قوي للأرقام المصرية
        const matches = scrapeRes.data.match(/(010|011|012|015)\d{8}/g);
        if (matches) phones.push(...matches);
      } catch (e) {
        console.log(`Failed to scrape ${item.link}`);
      }
    }
    
    phones = [...new Set(phones)]; // إزالة التكرار

    // 5. الحفظ
    if (phones.length > 0) {
      const rows = phones.map(p => ({ phone_number: p, campaign_id: camp.id, status: 'new' }));
      await supabase.from('leads').insert(rows);
    } else {
      return NextResponse.json({ error: 'تم البحث ولكن لم نجد أرقام هواتف في الصفحات!' }, { status: 200 });
    }

    return NextResponse.json({ campaign_id: camp.id, leads_count: phones.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ خادم داخلي' }, { status: 500 });
  }
}
