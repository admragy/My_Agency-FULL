import { createClient } from '@supabase/supabase-js';

// حط الرابط والمفتاح بتوعك هنا مباشرة بين علامات التنصيص ""
const url = "https://yhkpqivmgeqoiehrziog.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

export const supabase = createClient(url, key);
