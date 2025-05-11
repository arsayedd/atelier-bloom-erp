
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RevenueChart from '@/components/dashboard/RevenueChart';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import PendingPayments from '@/components/dashboard/PendingPayments';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import WelcomeMessage from '@/components/dashboard/WelcomeMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/DashboardService';

const Dashboard = () => {
  const { profile } = useAuth();
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  
  // Fetch today's appointments
  const { 
    data: todayAppointments, 
    isLoading: isLoadingAppointments 
  } = useQuery({
    queryKey: ['todayAppointments'],
    queryFn: DashboardService.getTodayAppointments
  });
  
  // Fetch pending payments
  const { 
    data: pendingPayments, 
    isLoading: isLoadingPayments 
  } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: DashboardService.getPendingPayments
  });
  
  // Fetch monthly revenue data
  const { 
    data: revenueData, 
    isLoading: isLoadingRevenue 
  } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: DashboardService.getMonthlyRevenue
  });

  // Fetch dashboard summary data
  const {
    data: dashboardSummary,
    isLoading: isLoadingSummary
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: DashboardService.getDashboardSummary
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-2">مرحباً بك في نظام هبة عوف الإداري</p>
      </div>

      {/* Add welcome message at the top */}
      <WelcomeMessage />
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 mb-4 md:w-[400px]">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>عدد العملاء</CardTitle>
                <CardDescription>إجمالي عدد العملاء المسجلين</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? (
                  <div className="animate-pulse h-6 w-16 bg-muted rounded"></div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{dashboardSummary?.clientsCount || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {dashboardSummary?.clientsGrowthPercentage > 0 ? (
                        `+${dashboardSummary?.clientsGrowthPercentage}% من الشهر الماضي`
                      ) : (
                        `${dashboardSummary?.clientsGrowthPercentage}% من الشهر الماضي`
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>الطلبات الشهرية</CardTitle>
                <CardDescription>إجمالي الطلبات هذا الشهر</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? (
                  <div className="animate-pulse h-6 w-16 bg-muted rounded"></div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{dashboardSummary?.monthlyOrdersCount || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {dashboardSummary?.ordersGrowthPercentage > 0 ? (
                        `+${dashboardSummary?.ordersGrowthPercentage}% من الشهر الماضي`
                      ) : (
                        `${dashboardSummary?.ordersGrowthPercentage}% من الشهر الماضي`
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>الإيرادات</CardTitle>
                <CardDescription>إجمالي الإيرادات هذا الشهر</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? (
                  <div className="animate-pulse h-6 w-16 bg-muted rounded"></div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">
                      {dashboardSummary?.monthlyRevenue ? 
                        `${dashboardSummary.monthlyRevenue.toLocaleString('ar-EG')} ج.م` : 
                        '0 ج.م'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {dashboardSummary?.revenueGrowthPercentage > 0 ? (
                        `+${dashboardSummary?.revenueGrowthPercentage}% من الشهر الماضي`
                      ) : (
                        `${dashboardSummary?.revenueGrowthPercentage}% من الشهر الماضي`
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>المواعيد اليوم</CardTitle>
                <CardDescription>مواعيد اليوم المحجوزة</CardDescription>
              </CardHeader>
              <CardContent>
                <TodayAppointments 
                  appointments={todayAppointments} 
                  isLoading={isLoadingAppointments} 
                />
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>المدفوعات المعلقة</CardTitle>
                <CardDescription>قائمة الدفعات المستحقة</CardDescription>
              </CardHeader>
              <CardContent>
                <PendingPayments 
                  payments={pendingPayments} 
                  isLoading={isLoadingPayments} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات الشهرية</CardTitle>
              <CardDescription>تحليل الإيرادات على مدار العام الحالي</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <RevenueChart 
                data={revenueData} 
                isLoading={isLoadingRevenue} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>التقويم</CardTitle>
              <CardDescription>عرض المواعيد والأحداث</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardCalendar 
                date={calendarDate}
                setDate={setCalendarDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
