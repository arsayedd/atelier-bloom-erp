
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, CreditCard, Check, Plus, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Mock data for pending payments
const mockPendingPayments = [
  {
    id: 'PAY1001',
    orderId: 'ORD1001',
    clientId: 'C1001',
    clientName: 'سارة أحمد',
    clientPhone: '01012345678',
    date: '2023-05-25',
    dueDate: '2023-05-30',
    total: 3500,
    paid: 1500,
    remaining: 2000,
    service: 'ميكب زفاف',
    type: 'makeup',
    status: 'pending', // pending, overdue, completed
    notes: 'تم دفع العربون، باقي التسوية بعد الخدمة',
  },
  {
    id: 'PAY1002',
    orderId: 'ORD1004',
    clientId: 'C1001',
    clientName: 'سارة أحمد',
    clientPhone: '01012345678',
    date: '2023-05-25',
    dueDate: '2023-05-30',
    total: 5000,
    paid: 2500,
    remaining: 2500,
    service: 'إيجار فستان زفاف',
    type: 'atelier',
    status: 'pending',
    notes: 'مرتبط بطلب الميكب',
  },
  {
    id: 'PAY1003',
    orderId: 'ORD1002',
    clientId: 'C1002',
    clientName: 'نور محمد',
    clientPhone: '01112345678',
    date: '2023-05-20',
    dueDate: '2023-05-25',
    total: 1800,
    paid: 1000,
    remaining: 800,
    service: 'ميكب سواريه',
    type: 'makeup',
    status: 'overdue',
    notes: 'متأخر عن موعد السداد',
  },
  {
    id: 'PAY1004',
    orderId: 'ORD1005',
    clientId: 'C1005',
    clientName: 'مريم محمود',
    clientPhone: '01512345678',
    date: '2023-05-18',
    dueDate: '2023-06-01',
    total: 6500,
    paid: 3000,
    remaining: 3500,
    service: 'بيع فستان خطوبة',
    type: 'atelier',
    status: 'pending',
    notes: 'تقسيط على دفعتين',
  },
  {
    id: 'PAY1005',
    orderId: 'ORD1006',
    clientId: 'C1003',
    clientName: 'فاطمة علي',
    clientPhone: '01212345678',
    date: '2023-05-10',
    dueDate: '2023-05-20',
    total: 2200,
    paid: 1200,
    remaining: 1000,
    service: 'تنظيف بشرة عميق + عناية',
    type: 'skincare',
    status: 'overdue',
    notes: 'متأخر عن موعد السداد بأكثر من 5 أيام',
  },
];

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingPayments, setPendingPayments] = useState(mockPendingPayments);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'cash', // cash, card, transfer
    notes: '',
  });
  
  // Filter payments based on search term and active tab
  const filteredPayments = pendingPayments.filter(payment => {
    const matchesSearch = 
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'overdue' && payment.status === 'overdue') ||
      (activeTab === payment.type);
    
    return matchesSearch && matchesTab && payment.status !== 'completed';
  });
  
  // Calculate total remaining amount
  const totalRemaining = filteredPayments.reduce((acc, payment) => acc + payment.remaining, 0);
  
  // Calculate overdue amount
  const overdueAmount = filteredPayments
    .filter(payment => payment.status === 'overdue')
    .reduce((acc, payment) => acc + payment.remaining, 0);
  
  // Handle payment submission
  const handlePayment = () => {
    if (!selectedPayment) return;
    
    // Validate payment amount
    if (paymentForm.amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }
    
    if (paymentForm.amount > selectedPayment.remaining) {
      toast.error('المبلغ المدخل أكبر من المبلغ المتبقي');
      return;
    }
    
    // Update payment record
    const newRemaining = selectedPayment.remaining - paymentForm.amount;
    const newPaid = selectedPayment.paid + paymentForm.amount;
    const newStatus = newRemaining === 0 ? 'completed' : selectedPayment.status;
    
    const updatedPayments = pendingPayments.map(payment => {
      if (payment.id === selectedPayment.id) {
        return {
          ...payment,
          remaining: newRemaining,
          paid: newPaid,
          status: newStatus,
        };
      }
      return payment;
    });
    
    setPendingPayments(updatedPayments);
    
    // Show success message
    if (newRemaining === 0) {
      toast.success(`تم تسديد كامل المبلغ بنجاح (${paymentForm.amount} ج.م)`);
    } else {
      toast.success(`تم تسديد ${paymentForm.amount} ج.م بنجاح. المتبقي: ${newRemaining} ج.م`);
    }
    
    // Reset the form and close the dialog
    resetPaymentForm();
    setIsAddPaymentOpen(false);
  };
  
  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentForm({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      notes: '',
    });
    setSelectedPayment(null);
  };
  
  // Get payment status badge
  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'completed') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          مدفوع بالكامل
        </Badge>
      );
    }
    
    if (status === 'overdue') {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          متأخر
        </Badge>
      );
    }
    
    // Check if due date is approaching (within 3 days)
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3 && diffDays > 0) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
          يستحق قريبًا
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
        قيد الانتظار
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">المبالغ المستحقة</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>إجمالي المستحقات</CardTitle>
            <CardDescription>مجموع المبالغ المتبقية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalRemaining.toLocaleString()} ج.م</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>المستحقات المتأخرة</CardTitle>
            <CardDescription>مبالغ تجاوزت تاريخ الاستحقاق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-500">{overdueAmount.toLocaleString()} ج.م</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>قائمة المدفوعات المستحقة</CardTitle>
              <CardDescription>
                المبالغ المتبقية التي تحتاج إلى تحصيل
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="بحث عن عميل أو طلب..." 
                className="pl-10 pr-4" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mt-4" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="overdue">متأخر</TabsTrigger>
              <TabsTrigger value="makeup">ميكب</TabsTrigger>
              <TabsTrigger value="skincare">تنظيف بشرة</TabsTrigger>
              <TabsTrigger value="atelier">أتيليه</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الخدمة</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المدفوع</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.orderId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.clientName}</div>
                      <div className="text-sm text-muted-foreground">{payment.clientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      payment.type === 'makeup' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      payment.type === 'skincare' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-pink-100 text-pink-800 border-pink-200'
                    }>
                      {payment.service}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(payment.dueDate).toLocaleDateString('ar-EG')}
                    </div>
                  </TableCell>
                  <TableCell>{payment.total} ج.م</TableCell>
                  <TableCell>{payment.paid} ج.م</TableCell>
                  <TableCell className="font-medium text-red-500">
                    {payment.remaining} ج.م
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status, payment.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      className="bg-bloom-primary hover:bg-bloom-primary/90" 
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setPaymentForm({...paymentForm, amount: payment.remaining});
                        setIsAddPaymentOpen(true);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      تسديد
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    {activeTab === 'all' 
                      ? 'لا توجد مدفوعات مستحقة' 
                      : activeTab === 'overdue'
                        ? 'لا توجد مدفوعات متأخرة'
                        : 'لا توجد مدفوعات مستحقة في هذا القسم'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={(open) => {
        setIsAddPaymentOpen(open);
        if (!open) resetPaymentForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تسديد دفعة</DialogTitle>
            <DialogDescription>
              تسديد دفعة من المبلغ المستحق للطلب {selectedPayment?.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>العميل</Label>
                <div className="font-medium">{selectedPayment?.clientName}</div>
              </div>
              <div className="space-y-1">
                <Label>المستحق</Label>
                <div className="font-medium text-red-500">{selectedPayment?.remaining} ج.م</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">المبلغ المراد تسديده</Label>
              <Input 
                id="paymentAmount" 
                type="number" 
                value={paymentForm.amount} 
                onChange={(e) => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} 
                placeholder="أدخل المبلغ"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentDate">تاريخ السداد</Label>
              <Input 
                id="paymentDate" 
                type="date" 
                value={paymentForm.date} 
                onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className={`border rounded-lg p-2 text-center cursor-pointer ${paymentForm.method === 'cash' ? 'border-bloom-primary bg-bloom-primary/10' : 'border-gray-200'}`}
                  onClick={() => setPaymentForm({...paymentForm, method: 'cash'})}
                >
                  <div className="flex justify-center mb-1">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="text-sm">نقدي</div>
                </div>
                <div 
                  className={`border rounded-lg p-2 text-center cursor-pointer ${paymentForm.method === 'card' ? 'border-bloom-primary bg-bloom-primary/10' : 'border-gray-200'}`}
                  onClick={() => setPaymentForm({...paymentForm, method: 'card'})}
                >
                  <div className="flex justify-center mb-1">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="text-sm">بطاقة</div>
                </div>
                <div 
                  className={`border rounded-lg p-2 text-center cursor-pointer ${paymentForm.method === 'transfer' ? 'border-bloom-primary bg-bloom-primary/10' : 'border-gray-200'}`}
                  onClick={() => setPaymentForm({...paymentForm, method: 'transfer'})}
                >
                  <div className="flex justify-center mb-1">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="text-sm">تحويل</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentNotes">ملاحظات</Label>
              <Input 
                id="paymentNotes" 
                value={paymentForm.notes} 
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} 
                placeholder="أي ملاحظات إضافية"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>إلغاء</Button>
            <Button 
              className="bg-bloom-primary hover:bg-bloom-primary/90" 
              onClick={handlePayment}
              disabled={paymentForm.amount <= 0 || paymentForm.amount > (selectedPayment?.remaining || 0)}
            >
              <Check className="mr-2 h-4 w-4" />
              تأكيد السداد
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
