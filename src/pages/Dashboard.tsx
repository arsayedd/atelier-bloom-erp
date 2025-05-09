
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/DashboardService';
import { toast } from '@/components/ui/sonner';
import RevenueChart from '@/components/dashboard/RevenueChart';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import PendingPayments from '@/components/dashboard/PendingPayments';

const Dashboard = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // استعلام بيانات لوحة المعلومات
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: () => DashboardService.getMonthlyRevenue(),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching revenue data:', error);
        toast.error('فشل في تحميل بيانات الإيرادات');
      }
    }
  });
  
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['dashboard', 'appointments'],
    queryFn: () => DashboardService.getTodayAppointments(),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching appointments:', error);
        toast.error('فشل في تحميل بيانات المواعيد');
      }
    }
  });
  
  const { data: pendingPayments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['dashboard', 'payments'],
    queryFn: () => DashboardService.getPendingPayments(),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching pending payments:', error);
        toast.error('فشل في تحميل بيانات المدفوعات المعلقة');
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">لوحة المعلومات</h1>
        <Badge variant="outline" className="bg-bloom-primary text-white text-sm px-3 py-1">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RevenueChart data={revenueData} isLoading={isLoadingRevenue} />
        <DashboardCalendar date={date} setDate={setDate} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodayAppointments appointments={appointments} isLoading={isLoadingAppointments} />
        <PendingPayments payments={pendingPayments} isLoading={isLoadingPayments} />
      </div>
    </div>
  );
};

export default Dashboard;
