
import React, { useState } from 'react';
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

// Mock data for reports
const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// Revenue data
const revenueData = [
  { category: "ميكب زفاف", amount: 45000 },
  { category: "ميكب مناسبات", amount: 15000 },
  { category: "ميكب سواريه", amount: 18000 },
  { category: "تنظيف بشرة", amount: 12000 },
  { category: "إيجار فساتين", amount: 40000 },
  { category: "بيع فساتين", amount: 35000 },
];

// Monthly data for 2023
const monthlyData = [
  { month: 'يناير', revenue: 23000, expenses: 10000, profit: 13000 },
  { month: 'فبراير', revenue: 25000, expenses: 11000, profit: 14000 },
  { month: 'مارس', revenue: 32000, expenses: 13000, profit: 19000 },
  { month: 'أبريل', revenue: 30000, expenses: 12500, profit: 17500 },
  { month: 'مايو', revenue: 35000, expenses: 14000, profit: 21000 },
];

// Expenses data
const expensesData = [
  { category: "مرتبات", amount: 18000 },
  { category: "إيجار", amount: 10000 },
  { category: "مواد خام", amount: 8000 },
  { category: "مرافق", amount: 3000 },
  { category: "تسويق", amount: 5000 },
  { category: "أخرى", amount: 2000 },
];

// Top clients
const topClients = [
  { id: 'C1001', name: 'سارة أحمد', totalOrders: 5, totalSpent: 12500, lastVisit: '2023-05-15' },
  { id: 'C1002', name: 'نور محمد', totalOrders: 4, totalSpent: 9800, lastVisit: '2023-05-10' },
  { id: 'C1003', name: 'فاطمة علي', totalOrders: 3, totalSpent: 7500, lastVisit: '2023-04-25' },
  { id: 'C1005', name: 'مريم محمود', totalOrders: 3, totalSpent: 6800, lastVisit: '2023-05-05' },
  { id: 'C1008', name: 'هدى سامي', totalOrders: 2, totalSpent: 5500, lastVisit: '2023-04-20' },
];

// Upcoming appointments (within 72 hours)
const upcomingAppointments = [
  { 
    id: 'APP1001', 
    clientId: 'C1001', 
    clientName: 'سارة أحمد',
    clientPhone: '01012345678', 
    date: '2023-05-25T10:00:00', 
    service: 'ميكب زفاف + فستان',
    notificationSent: true,
  },
  { 
    id: 'APP1002', 
    clientId: 'C1002', 
    clientName: 'نور محمد',
    clientPhone: '01112345678', 
    date: '2023-05-26T14:30:00', 
    service: 'ميكب سواريه',
    notificationSent: false,
  },
  { 
    id: 'APP1003', 
    clientId: 'C1003', 
    clientName: 'فاطمة علي',
    clientPhone: '01212345678', 
    date: '2023-05-27T12:00:00', 
    service: 'تنظيف بشرة عميق',
    notificationSent: false,
  },
];

// Top selling/renting dresses
const topDresses = [
  { id: 'D101', name: 'فستان زفاف ساتان', type: 'wedding', rentCount: 8, revenue: 16000 },
  { id: 'D103', name: 'فستان خطوبة', type: 'engagement', rentCount: 6, revenue: 7200 },
  { id: 'D104', name: 'فستان سواريه', type: 'evening', rentCount: 5, revenue: 4000 },
  { id: 'D107', name: 'فستان كتب كتاب', type: 'engagement', rentCount: 4, revenue: 6000 },
  { id: 'D102', name: 'فستان زفاف دانتيل', type: 'wedding', rentCount: 3, revenue: 7500 },
];

const ReportsPage = () => {
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedMonth, setSelectedMonth] = useState('5'); // May
  
  // Send WhatsApp notification
  const sendNotification = (appointment: any) => {
    console.log(`Sending notification to ${appointment.clientName} at ${appointment.clientPhone}`);
    // In a real app, this would use an API to send a WhatsApp message
    alert(`تم إرسال رسالة تذكيرية إلى ${appointment.clientName}`);
    
    // Update the appointment's notification status
    appointment.notificationSent = true;
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
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
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
                <div className="text-4xl font-bold">165,000 ج.م</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>إجمالي المصروفات</CardTitle>
                <CardDescription>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">46,000 ج.م</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>صافي الربح</CardTitle>
                <CardDescription>{monthNames[parseInt(selectedMonth) - 1]} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">119,000 ج.م</div>
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
                <BarChart data={revenueData}>
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
                <BarChart data={monthlyData}>
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
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
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
                <BarChart data={expensesData}>
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
                  {expensesData.map((expense, index) => {
                    const totalExpenses = expensesData.reduce((acc, curr) => acc + curr.amount, 0);
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
              <CardTitle>أكثر العملاء إنفاقًا</CardTitle>
              <CardDescription>العملاء الأكثر إنفاقًا خلال الفترة الماضية</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>كود العميل</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                    <TableHead>إجمالي الإنفاق</TableHead>
                    <TableHead>آخر زيارة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.id}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.totalOrders}</TableCell>
                      <TableCell>{client.totalSpent} ج.م</TableCell>
                      <TableCell>{new Date(client.lastVisit).toLocaleDateString('ar-EG')}</TableCell>
                    </TableRow>
                  ))}
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
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.clientName}</div>
                          <div className="text-sm text-muted-foreground">{appointment.clientPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(appointment.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                          {getDayDifference(appointment.date)}
                        </Badge>
                      </TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>
                        {appointment.notificationSent ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            تم الإرسال
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            في الانتظار
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant={appointment.notificationSent ? "outline" : "default"}
                          disabled={appointment.notificationSent}
                          className={!appointment.notificationSent ? "bg-bloom-primary" : ""}
                          onClick={() => sendNotification(appointment)}
                        >
                          إرسال تذكير
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {upcomingAppointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
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
                <p className="text-3xl font-bold">120</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">متاح</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">80</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">مؤجر</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">25</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">صيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">15</p>
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
                    <TableHead>كود</TableHead>
                    <TableHead>اسم الفستان</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>عدد مرات التأجير</TableHead>
                    <TableHead>إجمالي الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDresses.map((dress) => (
                    <TableRow key={dress.id}>
                      <TableCell>{dress.id}</TableCell>
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
                  ))}
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
                  { category: "فساتين زفاف", count: 45 },
                  { category: "فساتين خطوبة", count: 30 },
                  { category: "فساتين سواريه", count: 25 },
                  { category: "فساتين كتب كتاب", count: 20 },
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
