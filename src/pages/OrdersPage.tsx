
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for orders
const mockOrders = [
  {
    id: 'ORD1001',
    clientId: 'C1001',
    clientName: 'سارة أحمد',
    date: '2023-05-25',
    type: 'makeup',
    subtype: 'زفاف',
    specifics: 'زفاف حجاب كامل',
    status: 'confirmed',
    price: 3500,
    paidAmount: 1500,
    remainingAmount: 2000,
    notes: 'تم تحديد موعد التجربة',
  },
  {
    id: 'ORD1002',
    clientId: 'C1002',
    clientName: 'نور محمد',
    date: '2023-05-28',
    type: 'makeup',
    subtype: 'سواريه',
    specifics: 'هاي سواريه',
    status: 'pending',
    price: 1800,
    paidAmount: 1000,
    remainingAmount: 800,
    notes: '',
  },
  {
    id: 'ORD1003',
    clientId: 'C1003',
    clientName: 'فاطمة علي',
    date: '2023-06-05',
    type: 'skincare',
    subtype: 'تنظيف بشرة',
    specifics: 'عميق',
    status: 'confirmed',
    price: 950,
    paidAmount: 950,
    remainingAmount: 0,
    notes: 'تم الدفع بالكامل',
  },
  {
    id: 'ORD1004',
    clientId: 'C1001',
    clientName: 'سارة أحمد',
    date: '2023-05-25',
    type: 'atelier',
    subtype: 'زفاف',
    specifics: 'إيجار',
    status: 'confirmed',
    price: 5000,
    paidAmount: 2500,
    remainingAmount: 2500,
    notes: 'تم حجز الفستان رقم D105',
  },
];

// Options for order types
const orderTypes = [
  { value: 'makeup', label: 'ميكب' },
  { value: 'skincare', label: 'تنظيف بشرة' },
  { value: 'atelier', label: 'أتيليه' },
];

// Sub-options based on type
const typeOptions = {
  makeup: [
    { value: 'زفاف', label: 'زفاف' },
    { value: 'مناسبات', label: 'مناسبات' },
    { value: 'سواريه', label: 'سواريه' },
  ],
  skincare: [
    { value: 'تنظيف بشرة', label: 'تنظيف بشرة' },
  ],
  atelier: [
    { value: 'زفاف', label: 'زفاف' },
    { value: 'خطوبة', label: 'خطوبة' },
    { value: 'كتب كتاب', label: 'كتب كتاب' },
    { value: 'سواريه', label: 'سواريه' },
  ],
};

// Specifics based on type and subtype
const specificOptions = {
  makeup: {
    'زفاف': [
      { value: 'زفاف حجاب كامل', label: 'زفاف حجاب كامل' },
      { value: 'زفاف نصف حجاب', label: 'زفاف نصف حجاب' },
      { value: 'زفاف فورمة شعر', label: 'زفاف فورمة شعر' },
    ],
    'مناسبات': [
      { value: 'حنة', label: 'حنة' },
      { value: 'كتب كتاب', label: 'كتب كتاب' },
      { value: 'خطوبة', label: 'خطوبة' },
    ],
    'سواريه': [
      { value: 'عادي', label: 'عادي' },
      { value: 'هاي سواريه', label: 'هاي سواريه' },
    ],
  },
  skincare: {
    'تنظيف بشرة': [
      { value: 'سطحي', label: 'سطحي' },
      { value: 'عميق', label: 'عميق' },
      { value: 'VIP', label: 'VIP' },
    ],
  },
  atelier: {
    'زفاف': [
      { value: 'بيع', label: 'بيع' },
      { value: 'إيجار', label: 'إيجار' },
    ],
    'خطوبة': [
      { value: 'بيع', label: 'بيع' },
      { value: 'إيجار', label: 'إيجار' },
    ],
    'كتب كتاب': [
      { value: 'بيع', label: 'بيع' },
      { value: 'إيجار', label: 'إيجار' },
    ],
    'سواريه': [
      { value: 'بيع', label: 'بيع' },
      { value: 'إيجار', label: 'إيجار' },
    ],
  },
};

// Mock clients data
const mockClients = [
  { id: 'C1001', name: 'سارة أحمد' },
  { id: 'C1002', name: 'نور محمد' },
  { id: 'C1003', name: 'فاطمة علي' },
];

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState(mockOrders);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Form state for new order
  const [newOrder, setNewOrder] = useState({
    id: '',
    clientId: '',
    clientName: '',
    date: '',
    type: '',
    subtype: '',
    specifics: '',
    status: 'pending',
    price: 0,
    paidAmount: 0,
    remainingAmount: 0,
    notes: '',
  });
  
  // State for dynamic options
  const [availableSubtypes, setAvailableSubtypes] = useState<any[]>([]);
  const [availableSpecifics, setAvailableSpecifics] = useState<any[]>([]);
  
  // Filter orders based on search term and active tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.includes(searchTerm) ||
      order.clientName.includes(searchTerm);
    
    const matchesTab = 
      activeTab === 'all' || 
      activeTab === order.type;
    
    return matchesSearch && matchesTab;
  });
  
  // Handle type change
  const handleTypeChange = (value: string) => {
    setNewOrder({...newOrder, type: value, subtype: '', specifics: ''});
    
    // Update available subtypes based on selected type
    if (value && typeOptions[value as keyof typeof typeOptions]) {
      setAvailableSubtypes(typeOptions[value as keyof typeof typeOptions]);
    } else {
      setAvailableSubtypes([]);
    }
    
    setAvailableSpecifics([]);
  };
  
  // Handle subtype change
  const handleSubtypeChange = (value: string) => {
    setNewOrder({...newOrder, subtype: value, specifics: ''});
    
    // Update available specifics based on selected type and subtype
    if (
      newOrder.type && 
      value && 
      specificOptions[newOrder.type as keyof typeof specificOptions] && 
      specificOptions[newOrder.type as keyof typeof specificOptions][value as keyof typeof specificOptions[keyof typeof specificOptions]]
    ) {
      setAvailableSpecifics(specificOptions[newOrder.type as keyof typeof specificOptions][value as keyof typeof specificOptions[keyof typeof specificOptions]]);
    } else {
      setAvailableSpecifics([]);
    }
  };
  
  // Handle client change
  const handleClientChange = (value: string) => {
    const selectedClient = mockClients.find(client => client.id === value);
    setNewOrder({
      ...newOrder, 
      clientId: value,
      clientName: selectedClient ? selectedClient.name : ''
    });
  };
  
  // Handle paid amount change
  const handlePaidAmountChange = (value: string) => {
    const paidAmount = Number(value) || 0;
    const remainingAmount = newOrder.price - paidAmount;
    setNewOrder({...newOrder, paidAmount, remainingAmount});
  };
  
  // Handle price change
  const handlePriceChange = (value: string) => {
    const price = Number(value) || 0;
    const remainingAmount = price - newOrder.paidAmount;
    setNewOrder({...newOrder, price, remainingAmount});
  };
  
  // Handle add new order
  const handleAddOrder = () => {
    // Generate a new order ID
    const newId = `ORD${1000 + orders.length + 1}`;
    const orderToAdd = {...newOrder, id: newId};
    
    setOrders([...orders, orderToAdd]);
    setIsAddOrderOpen(false);
    resetOrderForm();
  };
  
  // Handle edit order
  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setNewOrder(order);
    
    // Set available options based on selected type and subtype
    handleTypeChange(order.type);
    handleSubtypeChange(order.subtype);
    
    setIsAddOrderOpen(true);
  };
  
  // Handle delete order
  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };
  
  // Reset order form
  const resetOrderForm = () => {
    setNewOrder({
      id: '',
      clientId: '',
      clientName: '',
      date: '',
      type: '',
      subtype: '',
      specifics: '',
      status: 'pending',
      price: 0,
      paidAmount: 0,
      remainingAmount: 0,
      notes: '',
    });
    setSelectedOrder(null);
    setAvailableSubtypes([]);
    setAvailableSpecifics([]);
  };
  
  // Get badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get badge text based on status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد';
      case 'pending':
        return 'قيد الانتظار';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">إدارة الطلبات</h1>
        <Dialog open={isAddOrderOpen} onOpenChange={(open) => {
          setIsAddOrderOpen(open);
          if (!open) resetOrderForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-bloom-primary hover:bg-bloom-primary/90">
              <Plus className="mr-2 h-4 w-4" /> طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedOrder ? 'تعديل طلب' : 'إضافة طلب جديد'}</DialogTitle>
              <DialogDescription>
                أدخل بيانات الطلب بالكامل ثم اضغط على حفظ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">العميل</Label>
                <Select 
                  value={newOrder.clientId} 
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={newOrder.date} 
                  onChange={(e) => setNewOrder({...newOrder, date: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع الخدمة</Label>
                  <Select 
                    value={newOrder.type} 
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtype">التصنيف</Label>
                  <Select 
                    value={newOrder.subtype} 
                    onValueChange={handleSubtypeChange}
                    disabled={!newOrder.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubtypes.map((subtype) => (
                        <SelectItem key={subtype.value} value={subtype.value}>
                          {subtype.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specifics">التفاصيل</Label>
                  <Select 
                    value={newOrder.specifics} 
                    onValueChange={(value) => setNewOrder({...newOrder, specifics: value})}
                    disabled={!newOrder.subtype}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التفاصيل" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecifics.map((specific) => (
                        <SelectItem key={specific.value} value={specific.value}>
                          {specific.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={newOrder.price} 
                    onChange={(e) => handlePriceChange(e.target.value)} 
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paidAmount">المدفوع</Label>
                  <Input 
                    id="paidAmount" 
                    type="number" 
                    value={newOrder.paidAmount} 
                    onChange={(e) => handlePaidAmountChange(e.target.value)} 
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remainingAmount">المتبقي</Label>
                  <Input 
                    id="remainingAmount" 
                    type="number" 
                    value={newOrder.remainingAmount} 
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select 
                  value={newOrder.status} 
                  onValueChange={(value) => setNewOrder({...newOrder, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input 
                  id="notes" 
                  value={newOrder.notes} 
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})} 
                  placeholder="أي ملاحظات إضافية"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddOrderOpen(false);
                  resetOrderForm();
                }}
              >
                إلغاء
              </Button>
              <Button 
                className="bg-bloom-primary hover:bg-bloom-primary/90" 
                onClick={handleAddOrder}
                disabled={!newOrder.clientId || !newOrder.type || !newOrder.subtype}
              >
                {selectedOrder ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
          <CardDescription>
            عرض وإدارة جميع الطلبات المسجلة
          </CardDescription>
          <div className="flex justify-between items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="بحث عن طلب..." 
                className="pl-10 pr-4" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="makeup">ميكب</TabsTrigger>
                <TabsTrigger value="skincare">تنظيف بشرة</TabsTrigger>
                <TabsTrigger value="atelier">أتيليه</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>التفاصيل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>
                    {order.type === 'makeup' ? 'ميكب' : 
                     order.type === 'skincare' ? 'تنظيف بشرة' : 
                     'أتيليه'}
                  </TableCell>
                  <TableCell>
                    {order.specifics}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.price} ج.م</TableCell>
                  <TableCell>
                    <span className={order.remainingAmount > 0 ? 'text-red-500' : 'text-green-500'}>
                      {order.remainingAmount} ج.م
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    لا يوجد طلبات مطابقة لبحثك
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
