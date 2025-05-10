
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from '@/components/ui/sonner';
import { 
  ReportService, 
  RevenueReport, 
  StaffCommission, 
  ClientUpcomingEvent,
  MonthlyRevenue 
} from '@/services/ReportService';
import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '@/services/InventoryService';

const ReportsPage = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  
  // Get monthly revenue data
  const { data: monthlyRevenueData } = useQuery({
    queryKey: ['monthlyRevenueData', selectedYear],
    queryFn: () => ReportService.getMonthlyRevenueData(parseInt(selectedYear)),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching monthly revenue data:', error);
        toast.error('فشل في تحميل بيانات الإيرادات الشهرية');
      }
    }
  });
  
  // Get monthly revenue report
  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthlyRevenue', selectedYear, selectedMonth],
    queryFn: () => ReportService.getMonthlyRevenue(parseInt(selectedYear), parseInt(selectedMonth)),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching monthly revenue report:', error);
        toast.error('فشل في تحميل تقرير الإيرادات الشهري');
      }
    }
  });
  
  // Get staff commissions
  const { data: staffCommissions } = useQuery({
    queryKey: ['staffCommissions', selectedYear, selectedMonth],
    queryFn: () => ReportService.getStaffCommissions(parseInt(selectedYear), parseInt(selectedMonth)),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching staff commissions:', error);
        toast.error('فشل في تحميل عمولات الموظفين');
      }
    }
  });
  
  // Get upcoming client events
  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => ReportService.getUpcomingClientEvents(72),
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching upcoming events:', error);
        toast.error('فشل في تحميل المواعيد القادمة');
      }
    }
  });
  
  // Get top referrers
  const { data: topReferrers } = useQuery({
    queryKey: ['topReferrers'],
    queryFn: () => ReportService.getTopReferrers(5),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching top referrers:', error);
        toast.error('فشل في تحميل قائمة أفضل المحيلين');
      }
    }
  });
  
  // Get inventory summary
  const { data: inventorySummary } = useQuery({
    queryKey: ['inventorySummary'],
    queryFn: () => ReportService.getInventorySummary(),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching inventory summary:', error);
        toast.error('فشل في تحميل ملخص المخزون');
      }
    }
  });
  
  // Get top dresses
  const { data: topDresses } = useQuery({
    queryKey: ['topDresses'],
    queryFn: () => ReportService.getTopDresses(5),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching top dresses:', error);
        toast.error('فشل في تحميل قائمة أفضل الفساتين');
      }
    }
  });
  
  // Send WhatsApp notification
  const sendNotification = (appointment: ClientUpcomingEvent) => {
    // In a real app, this would use an API to send a WhatsApp message
    toast.success(`تم إرسال رسالة تذكيرية إلى ${appointment.client_name}`);
  };
  
  // Format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString('ar-EG')} ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get day difference from now
  const getDayDifference = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'غدًا';
    if (diffDays === 2) return 'بعد غد';
    return `بعد ${diffDays} أيام`;
  };
  
  // Month names in Arabic
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">التقارير</h1>
      </div>
      
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-[600px]">
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          <TabsTrigger value="expenses">المصروفات</TabsTrigger>
          <TabsTrigger value="clients">العملاء</TabsTrigger>
          <TabsTrigger value="appointments">المواعيد القادمة</TabsTrigger>
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
        </TabsList>
        
        {/* Revenue Reports Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="flex space-x-4">
            <div className="w-48">
              <Label htmlFor="year">السنة</Label>
              <Select 
                value={selectedYear} 
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                  <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                  <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-48">
              <Label htmlFor="month">الشهر</Label>
              <Select 
                value={selectedMonth} 
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>إجمالي الإيرادات</CardTitle>
                <CardDescription>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {monthlyRevenue ? (monthlyRevenue.booking + monthlyRevenue.completion).toLocaleString() : 0} ج.م
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>إجمالي المصروفات</CardTitle>
                <CardDescription>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {monthlyRevenue ? monthlyRevenue.expenses.toLocaleString() : 0} ج.م
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>صافي الربح</CardTitle>
                <CardDescription>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {monthlyRevenue ? monthlyRevenue.net.toLocaleString() : 0} ج.م
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات حسب القسم</CardTitle>
              <CardDescription>توزيع الإيرادات على أقسام العمل المختلفة</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { category: "ميكب زفاف", amount: monthlyRevenue ? monthlyRevenue.booking * 0.4 : 0 },
                  { category: "ميكب مناسبات", amount: monthlyRevenue ? monthlyRevenue.booking * 0.2 : 0 },
                  { category: "ميكب سواريه", amount: monthlyRevenue ? monthlyRevenue.booking * 0.1 : 0 },
                  { category: "تنظيف بشرة", amount: monthlyRevenue ? monthlyRevenue.booking * 0.1 : 0 },
                  { category: "إيجار فساتين", amount: monthlyRevenue ? monthlyRevenue.completion * 0.6 : 0 },
                  { category: "بيع فساتين", amount: monthlyRevenue ? monthlyRevenue.completion * 0.4 : 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      border: '1px solid #e2b8ff' 
                    }} 
                    formatter={(value) => [`${value} ج.م`, 'الإيرادات']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#9b55d3" 
                    radius={[4, 4, 0, 0]}
                    name="الإيرادات (ج.م)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>أداء الإيرادات الشهرية</CardTitle>
              <CardDescription>مقارنة بين الإيرادات والمصروفات والأرباح</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      border: '1px solid #e2b8ff' 
                    }} 
                    formatter={(value) => [`${value} ج.م`, '']}
                  />
                  <Bar dataKey="revenue" fill="#9b55d3" name="الإيرادات" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ff7b7b" name="المصروفات" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#4ade80" name="الأرباح" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Expenses Reports Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex space-x-4">
            <div className="w-48">
              <Label htmlFor="expenses-year">السنة</Label>
              <Select 
                value={selectedYear} 
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                  <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                  <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-48">
              <Label htmlFor="expenses-month">الشهر</Label>
              <Select 
                value={selectedMonth} 
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>المصروفات حسب الفئة</CardTitle>
              <CardDescription>توزيع المصروفات على الفئات المختلفة</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { category: "مرتبات", amount: 18000 },
                  { category: "إيجار", amount: 10000 },
                  { category: "مواد خام", amount: 8000 },
                  { category: "مرافق", amount: 3000 },
                  { category: "تسويق", amount: 5000 },
                  { category: "أخرى", amount: 2000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      border: '1px solid #e2b8ff' 
                    }} 
                    formatter={(value) => [`${value} ج.م`, 'المصروفات']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#ff7b7b" 
                    radius={[4, 4, 0, 0]}
                    name="المصروفات (ج.م)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المصروفات</CardTitle>
              <CardDescription>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفئة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>النسبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { category: "مرتبات", amount: 18000 },
                    { category: "إيجار", amount: 10000 },
                    { category: "مواد خام", amount: 8000 },
                    { category: "مرافق", amount: 3000 },
                    { category: "تسويق", amount: 5000 },
                    { category: "أخرى", amount: 2000 },
                  ].map((expense, index) => {
                    const totalExpenses = 46000;
                    const percentage = ((expense.amount / totalExpenses) * 100).toFixed(1);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.amount} ج.م</TableCell>
                        <TableCell>{percentage}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Clients Reports Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أفضل العملاء</CardTitle>
              <CardDescription>العملاء الأكثر إنفاقًا خلال الفترة الماضية</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>عدد الإحالات</TableHead>
                    <TableHead>إجمالي الخصم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topReferrers && topReferrers.length > 0 ? (
                    topReferrers.map((referrer, index) => (
                      <TableRow key={index}>
                        <TableCell>{referrer.client_name}</TableCell>
                        <TableCell>{referrer.client_phone}</TableCell>
                        <TableCell>{referrer.referrals_count}</TableCell>
                        <TableCell>{referrer.total_discount} ج.م</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        لا يوجد بيانات متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات العملاء</CardTitle>
                <CardDescription>مؤشرات أداء العملاء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">عدد العملاء الجدد هذا الشهر</h4>
                    <p className="text-2xl font-bold">27 عميل</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">متوسط قيمة الطلب</h4>
                    <p className="text-2xl font-bold">2,500 ج.م</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">نسبة العملاء المكررين</h4>
                    <p className="text-2xl font-bold">65%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>تصنيف العملاء حسب المصدر</CardTitle>
                <CardDescription>كيف عرف العملاء عن المتجر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                    <span>فيسبوك</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>45%</span>
                    <div className="w-32 h-2 rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-pink-500"></div>
                    <span>إنستجرام</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>32%</span>
                    <div className="w-32 h-2 rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-pink-500" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                    <span>ترشيح من صديقة</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>18%</span>
                    <div className="w-32 h-2 rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <span>أخرى</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>5%</span>
                    <div className="w-32 h-2 rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-green-500" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Upcoming Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المواعيد القادمة خلال 72 ساعة</CardTitle>
              <CardDescription>مواعيد تحتاج إلى تأكيد وإرسال رسائل تذكيرية</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميلة</TableHead>
                    <TableHead>الموعد</TableHead>
                    <TableHead>متى؟</TableHead>
                    <TableHead>الخدمة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingEvents && upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.client_name}</div>
                            <div className="text-sm text-muted-foreground">{event.client_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(event.event_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                            {getDayDifference(event.event_date)}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.event_type}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            className="bg-bloom-primary hover:bg-bloom-primary/90"
                            onClick={() => sendNotification(event)}
                          >
                            إرسال تذكير
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        لا يوجد مواعيد قادمة خلال 72 ساعة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inventory Reports Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">إجمالي الفساتين</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{inventorySummary?.total || 0}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">متاح</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{inventorySummary?.available || 0}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">مؤجر</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{inventorySummary?.rented || 0}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">صيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{inventorySummary?.maintenance || 0}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>أكثر الفساتين تأجيرًا</CardTitle>
              <CardDescription>الفساتين الأكثر طلبًا من العملاء</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفستان</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>عدد مرات التأجير</TableHead>
                    <TableHead>إجمالي الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDresses && topDresses.length > 0 ? (
                    topDresses.map((dress, index) => (
                      <TableRow key={index}>
                        <TableCell>{dress.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            dress.type === 'wedding' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            dress.type === 'engagement' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }>
                            {dress.type === 'wedding' ? 'زفاف' :
                             dress.type === 'engagement' ? 'خطوبة' : 'سواريه'}
                          </Badge>
                        </TableCell>
                        <TableCell>{dress.rentCount}</TableCell>
                        <TableCell>{dress.revenue} ج.م</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        لا يوجد بيانات متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>توزيع المخزون</CardTitle>
              <CardDescription>توزيع الفساتين حسب النوع</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { category: "فساتين زفاف", count: inventorySummary?.total ? Math.round(inventorySummary.total * 0.35) : 0 },
                  { category: "فساتين خطوبة", count: inventorySummary?.total ? Math.round(inventorySummary.total * 0.25) : 0 },
                  { category: "فساتين سواريه", count: inventorySummary?.total ? Math.round(inventorySummary.total * 0.2) : 0 },
                  { category: "فساتين كتب كتاب", count: inventorySummary?.total ? Math.round(inventorySummary.total * 0.15) : 0 },
                  { category: "أخرى", count: inventorySummary?.total ? Math.round(inventorySummary.total * 0.05) : 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      border: '1px solid #e2b8ff' 
                    }} 
                    formatter={(value) => [`${value} فستان`, 'العدد']}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#9b55d3" 
                    radius={[4, 4, 0, 0]}
                    name="عدد الفساتين" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
