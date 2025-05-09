
import { supabase } from '@/integrations/supabase/client';

export interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  commission_rates?: {
    new_bookings?: number;
    additions?: number;
    laundry?: number;
    outdoor?: number;
    exemplary?: number;
  };
}

export interface CommissionRecord {
  id: string;
  staff_id: string;
  month: string; // Format: "YYYY-MM" 
  new_bookings_amount: number;
  additions_amount: number;
  laundry_amount: number;
  outdoor_amount: number;
  exemplary_amount: number;
  other_allowances: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export const CommissionService = {
  async getStaff(): Promise<StaffMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff');
      
      if (error) throw error;
      
      return (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || '',
        role: profile.role || 'staff',
        commission_rates: {
          new_bookings: 0.05, // 5%
          additions: 0.03, // 3% 
          laundry: 0.02, // 2%
          outdoor: 0.07, // 7%
          exemplary: 0.01 // 1%
        }
      }));
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },
  
  async calculateCommission(staffId: string, year: number, month: number): Promise<CommissionRecord | null> {
    try {
      // تنسيق التواريخ للترشيح
      const startDate = new Date(year, month - 1, 1); // month is 1-indexed
      const endDate = new Date(year, month, 0);
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      // الحصول على جميع الحجوزات التي تعامل معها هذا الموظف في الشهر المحدد
      const { data: bookings, error: bookingsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('created_by', staffId)
        .gte('date', startDateStr)
        .lte('date', endDateStr);
      
      if (bookingsError) throw bookingsError;
      
      // الحصول على المدفوعات/الإضافات التي تعامل معها هذا الموظف في الشهر المحدد
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('created_by', staffId)
        .gte('payment_date', startDateStr)
        .lte('payment_date', endDateStr);
      
      if (paymentsError) throw paymentsError;
      
      // الحصول على بيانات الموظف لمعدلات العمولة
      const { data: staffMember, error: staffError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', staffId)
        .single();
      
      if (staffError) throw staffError;
      
      // حساب مبالغ العمولة بناءً على البيانات الفعلية
      // بالنسبة للحجوزات الجديدة: عدد المواعيد التي تم إنشاؤها * متوسط معدل العمولة
      const newBookingsAmount = (bookings?.length || 0) * 100; // 100 لكل حجز
      
      // بالنسبة للإضافات: مجموع مبالغ الدفع * معدل العمولة
      const additionsAmount = (payments || []).reduce((sum, payment) => {
        return sum + (parseFloat(String(payment.amount)) * 0.03); // 3% عمولة على المدفوعات
      }, 0);
      
      // الحصول على خدمات الغسيل التي يتعامل معها هذا الموظف
      const { data: laundryServices, error: laundryError } = await supabase
        .from('order_items')
        .select('*, orders(*)')
        .eq('item_type', 'laundry')
        .eq('orders.created_by', staffId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);
      
      const laundryAmount = (laundryServices || []).reduce((sum, item) => {
        return sum + (parseFloat(String(item.price || 0)) * 0.02);
      }, 0);
      
      // الحصول على المواعيد الخارجية التي يتعامل معها هذا الموظف
      const { data: outdoorAppointments, error: outdoorError } = await supabase
        .from('appointments')
        .select('*')
        .eq('created_by', staffId)
        .eq('status', 'outdoor')
        .gte('date', startDateStr)
        .lte('date', endDateStr);
      
      // بما أن "السعر" قد لا يوجد مباشرة في جدول المواعيد
      // سنقوم بحساب مبلغ ثابت لكل موعد خارجي
      const outdoorAmount = (outdoorAppointments?.length || 0) * 150; // 150 لكل موعد خارجي
      
      // للأداء المثالي - بناءً على عدد المراجعات الإيجابية
      let exemplaryAmount = 0;
      
      // نحتاج إلى التحقق مما إذا كان جدول "المراجعات" موجودًا
      const { count, error: tableError } = await supabase
        .from('profiles')  // استخدام جدول موجود للتحقق مما إذا كان هناك موظفون ذوو أداء جيد
        .select('*', { count: 'exact', head: true })
        .eq('role', 'staff')
        .eq('id', staffId);
        
      // إذا كان الموظف موجودًا، فخصص مكافأة أداء مثالي إذا كان لديهم مقاييس جيدة
      if (!tableError && count && count > 0) {
        // يمكن أن نعتمد على مقاييس مثل نسبة الحجز:الدفع، واحتفاظ العملاء، إلخ
        // في الوقت الحالي، امنح مكافأة إذا كانوا قد عالجوا أكثر من 5 حجوزات أو مدفوعات
        if ((bookings?.length || 0) > 5 || (payments?.length || 0) > 5) {
          exemplaryAmount = 200; // مكافأة ثابتة للموظفين المثاليين
        }
      }
      
      const otherAllowances = 0; // يمكن تعيينها يدويًا إذا لزم الأمر
      
      const totalAmount = newBookingsAmount + additionsAmount + laundryAmount + 
                        outdoorAmount + exemplaryAmount + otherAllowances;
      
      // إرجاع بيانات العمولة المحسوبة
      return {
        id: `comm_${staffId}_${year}_${month}`,
        staff_id: staffId,
        month: `${year}-${month.toString().padStart(2, '0')}`,
        new_bookings_amount: newBookingsAmount,
        additions_amount: additionsAmount,
        laundry_amount: laundryAmount,
        outdoor_amount: outdoorAmount,
        exemplary_amount: exemplaryAmount,
        other_allowances: otherAllowances,
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error calculating commission for staff ${staffId}:`, error);
      return null;
    }
  }
};
