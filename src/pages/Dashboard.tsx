
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/DashboardService';
import { toast } from '@/components/ui/sonner';

const Dashboard = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // Fetch dashboard data
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: () => DashboardService.getMonthlyRevenue(),
    onError: (error) => {
      console.error('Error fetching revenue data:', error);
      toast.error('فشل في تحميل بيانات الإيرادات');
    }
  });
  
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['dashboard', 'appointments'],
    queryFn: () => DashboardService.getTodayAppointments(),
    onError: (error) => {
      console.error('Error fetching appointments:', error);
      toast.error('فشل في تحميل بيانات المواعيد');
    }
  });
  
  const { data: pendingPayments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['dashboard', 'payments'],
    queryFn: () => DashboardService.getPendingPayments(),
    onError: (error) => {
      console.error('Error fetching pending payments:', error);
      toast.error('فشل في تحميل بيانات المدفوعات المعلقة');
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
        <Card className="bloom-card md:col-span-2">
          <CardHeader>
            <CardTitle className="bloom-heading">نظرة عامة على الإيرادات</CardTitle>
            <CardDescription>الإيرادات الشهرية للسنة الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoadingRevenue ? (
                <div className="flex items-center justify-center h-full">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : (
                revenueData && revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px', 
                          border: '1px solid #e2b8ff' 
                        }}
                        formatter={(value) => [`${value} جنيه`, 'الإيرادات']}
                      />
                      <Bar 
                        dataKey="total" 
                        fill="#9b55d3" 
                        radius={[4, 4, 0, 0]}
                        name="الإيرادات (جنيه)" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>لا توجد إيرادات مسجلة للعرض</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="bloom-heading">التقويم</CardTitle>
            <CardDescription>استعراض وإدارة المواعيد</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="bloom-heading">مواعيد اليوم</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center h-32">
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments && appointments.length > 0 ? appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center justify-between p-3 rounded-md bg-white border border-muted"
                  >
                    <div>
                      <p className="font-medium">{appointment.client?.full_name || 'عميل غير معروف'}</p>
                      <p className="text-sm text-muted-foreground">{appointment.notes || 'موعد'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{new Date(appointment.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                      <Badge 
                        variant="outline" 
                        className={`${
                          appointment.status === 'confirmed' || appointment.status === 'scheduled'
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {appointment.status === 'confirmed' ? 'مؤكد' : 
                         appointment.status === 'scheduled' ? 'مجدول' : 
                         appointment.status === 'pending' ? 'معلق' : appointment.status}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground">
                    لا توجد مواعيد لليوم
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="bloom-heading">المدفوعات المعلقة</CardTitle>
            <CardDescription>المدفوعات التي تتطلب متابعة</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <div className="flex items-center justify-center h-32">
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments && pendingPayments.length > 0 ? pendingPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-3 rounded-md bg-white border border-muted"
                  >
                    <div>
                      <p className="font-medium">{payment.order?.client?.full_name || 'عميل غير معروف'}</p>
                      <p className="text-sm text-muted-foreground">طلب #{payment.order_id.substring(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-destructive">{payment.amount} جنيه</p>
                      <p className="text-xs text-muted-foreground">تاريخ الاستحقاق: {new Date(payment.payment_date).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground">
                    لا توجد مدفوعات معلقة
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
