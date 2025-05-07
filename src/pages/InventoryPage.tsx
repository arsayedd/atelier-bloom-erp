
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Search, Plus, Pencil, Trash2, History, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for dresses
const mockDresses = [
  {
    id: 'D101',
    name: 'فستان زفاف ساتان',
    type: 'wedding',
    size: '38',
    color: 'أبيض',
    purchasePrice: 5000,
    rentalPrice: 2000,
    salePrice: 8000,
    status: 'available', // available, rented, sold, maintenance
    location: 'المعرض الرئيسي',
    notes: 'فستان مميز بذيل طويل',
    history: [
      { id: '1', date: '2023-04-15', type: 'rent', client: 'سارة أحمد', amount: 2000 },
      { id: '2', date: '2023-03-10', type: 'rent', client: 'نور محمد', amount: 2000 },
      { id: '3', date: '2023-01-05', type: 'maintenance', client: '', amount: 0, notes: 'تنظيف وكي' },
    ],
    totalRentals: 2,
    totalRevenue: 4000,
    lastCleaningDate: '2023-01-05',
  },
  {
    id: 'D102',
    name: 'فستان زفاف دانتيل',
    type: 'wedding',
    size: '40',
    color: 'أوف وايت',
    purchasePrice: 6000,
    rentalPrice: 2500,
    salePrice: 9000,
    status: 'rented', // available, rented, sold, maintenance
    location: 'المعرض الرئيسي',
    notes: 'فستان بأكمام طويلة',
    history: [
      { id: '1', date: '2023-05-20', type: 'rent', client: 'فاطمة علي', amount: 2500 },
    ],
    totalRentals: 1,
    totalRevenue: 2500,
    lastCleaningDate: '2023-04-10',
  },
  {
    id: 'D103',
    name: 'فستان خطوبة',
    type: 'engagement',
    size: '36',
    color: 'وردي',
    purchasePrice: 3500,
    rentalPrice: 1200,
    salePrice: 5500,
    status: 'available', // available, rented, sold, maintenance
    location: 'المعرض الفرعي',
    notes: '',
    history: [
      { id: '1', date: '2023-04-02', type: 'rent', client: 'مريم محمود', amount: 1200 },
      { id: '2', date: '2023-02-15', type: 'rent', client: 'هدى سامي', amount: 1200 },
      { id: '3', date: '2023-01-20', type: 'maintenance', client: '', amount: 0, notes: 'تنظيف وإصلاح سحاب' },
    ],
    totalRentals: 2,
    totalRevenue: 2400,
    lastCleaningDate: '2023-01-20',
  },
  {
    id: 'D104',
    name: 'فستان سواريه',
    type: 'evening',
    size: '38',
    color: 'أسود',
    purchasePrice: 2800,
    rentalPrice: 800,
    salePrice: 4500,
    status: 'maintenance', // available, rented, sold, maintenance
    location: 'المغسلة',
    notes: 'تم إرساله للتنظيف',
    history: [
      { id: '1', date: '2023-05-10', type: 'maintenance', client: '', amount: 0, notes: 'تنظيف' },
      { id: '2', date: '2023-05-05', type: 'rent', client: 'رنا أحمد', amount: 800 },
      { id: '3', date: '2023-04-20', type: 'rent', client: 'سلمى محمد', amount: 800 },
    ],
    totalRentals: 2,
    totalRevenue: 1600,
    lastCleaningDate: '2023-05-10',
  },
  {
    id: 'D105',
    name: 'فستان كتب كتاب',
    type: 'engagement',
    size: '42',
    color: 'أزرق فاتح',
    purchasePrice: 4000,
    rentalPrice: 1500,
    salePrice: 6500,
    status: 'sold', // available, rented, sold, maintenance
    location: 'غير متاح',
    notes: 'تم بيعه',
    history: [
      { id: '1', date: '2023-03-15', type: 'sale', client: 'داليا محمود', amount: 6500 },
    ],
    totalRentals: 0,
    totalRevenue: 6500,
    lastCleaningDate: '2023-02-20',
  },
];

// Dress types
const dressTypes = [
  { value: 'wedding', label: 'فستان زفاف' },
  { value: 'engagement', label: 'فستان خطوبة' },
  { value: 'evening', label: 'فستان سواريه' },
  { value: 'katbKetab', label: 'فستان كتب كتاب' },
];

// Dress sizes
const dressSizes = ['34', '36', '38', '40', '42', '44', '46', '48', '50'];

// Dress statuses
const dressStatuses = [
  { value: 'available', label: 'متاح', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'rented', label: 'مؤجر', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'sold', label: 'مباع', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'maintenance', label: 'صيانة', color: 'bg-amber-100 text-amber-800 border-amber-200' },
];

// Dress locations
const dressLocations = [
  'المعرض الرئيسي',
  'المعرض الفرعي',
  'المخزن',
  'المغسلة',
  'غير متاح',
];

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dresses, setDresses] = useState(mockDresses);
  const [isAddDressOpen, setIsAddDressOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedDress, setSelectedDress] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Form state for new dress
  const [newDress, setNewDress] = useState({
    id: '',
    name: '',
    type: '',
    size: '',
    color: '',
    purchasePrice: 0,
    rentalPrice: 0,
    salePrice: 0,
    status: 'available',
    location: 'المعرض الرئيسي',
    notes: '',
    history: [],
    totalRentals: 0,
    totalRevenue: 0,
    lastCleaningDate: '',
  });
  
  // Form state for maintenance entry
  const [maintenanceForm, setMaintenanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    cost: 0,
  });
  
  // Filter dresses based on search term and active tab
  const filteredDresses = dresses.filter(dress => {
    const matchesSearch = 
      dress.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dress.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'available' && dress.status === 'available') ||
      (activeTab === 'rented' && dress.status === 'rented') ||
      (activeTab === 'maintenance' && dress.status === 'maintenance') ||
      (activeTab === 'sold' && dress.status === 'sold');
    
    return matchesSearch && matchesTab;
  });
  
  // Count dresses by status
  const countByStatus = {
    all: dresses.length,
    available: dresses.filter(d => d.status === 'available').length,
    rented: dresses.filter(d => d.status === 'rented').length,
    maintenance: dresses.filter(d => d.status === 'maintenance').length,
    sold: dresses.filter(d => d.status === 'sold').length,
  };
  
  // Handle add new dress
  const handleAddDress = () => {
    // Generate a new dress ID
    const newId = `D${101 + dresses.length}`;
    const dressToAdd = {
      ...newDress,
      id: newId,
      history: [],
      totalRentals: 0,
      totalRevenue: 0,
      lastCleaningDate: '',
    };
    
    setDresses([...dresses, dressToAdd]);
    setIsAddDressOpen(false);
    resetDressForm();
  };
  
  // Handle edit dress
  const handleEditDress = (dress: any) => {
    setSelectedDress(dress);
    setNewDress(dress);
    setIsAddDressOpen(true);
  };
  
  // Handle delete dress
  const handleDeleteDress = (id: string) => {
    setDresses(dresses.filter(dress => dress.id !== id));
  };
  
  // Reset dress form
  const resetDressForm = () => {
    setNewDress({
      id: '',
      name: '',
      type: '',
      size: '',
      color: '',
      purchasePrice: 0,
      rentalPrice: 0,
      salePrice: 0,
      status: 'available',
      location: 'المعرض الرئيسي',
      notes: '',
      history: [],
      totalRentals: 0,
      totalRevenue: 0,
      lastCleaningDate: '',
    });
    setSelectedDress(null);
  };
  
  // View dress history
  const handleViewHistory = (dress: any) => {
    setSelectedDress(dress);
    setIsHistoryOpen(true);
  };
  
  // Add maintenance record
  const handleAddMaintenance = () => {
    if (!selectedDress) return;
    
    const updatedDress = {
      ...selectedDress,
      status: 'maintenance',
      location: 'المغسلة',
      lastCleaningDate: maintenanceForm.date,
      history: [
        {
          id: Date.now().toString(),
          date: maintenanceForm.date,
          type: 'maintenance',
          client: '',
          amount: 0,
          notes: maintenanceForm.notes,
        },
        ...selectedDress.history,
      ],
    };
    
    setDresses(dresses.map(d => d.id === selectedDress.id ? updatedDress : d));
    setIsMaintenanceOpen(false);
    setMaintenanceForm({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      cost: 0,
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    const statusObj = dressStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  // Get status label
  const getStatusLabel = (status: string) => {
    const statusObj = dressStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };
  
  // Get dress type label
  const getDressTypeLabel = (type: string) => {
    const typeObj = dressTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">إدارة المخزون</h1>
        <Dialog open={isAddDressOpen} onOpenChange={(open) => {
          setIsAddDressOpen(open);
          if (!open) resetDressForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-bloom-primary hover:bg-bloom-primary/90">
              <Plus className="mr-2 h-4 w-4" /> إضافة فستان جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedDress ? 'تعديل بيانات فستان' : 'إضافة فستان جديد'}</DialogTitle>
              <DialogDescription>
                أدخل بيانات الفستان بالكامل ثم اضغط على حفظ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الفستان</Label>
                  <Input 
                    id="name" 
                    value={newDress.name} 
                    onChange={(e) => setNewDress({...newDress, name: e.target.value})} 
                    placeholder="اسم الفستان"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">نوع الفستان</Label>
                  <Select 
                    value={newDress.type} 
                    onValueChange={(value) => setNewDress({...newDress, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      {dressTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">المقاس</Label>
                  <Select 
                    value={newDress.size} 
                    onValueChange={(value) => setNewDress({...newDress, size: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المقاس" />
                    </SelectTrigger>
                    <SelectContent>
                      {dressSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">اللون</Label>
                  <Input 
                    id="color" 
                    value={newDress.color} 
                    onChange={(e) => setNewDress({...newDress, color: e.target.value})} 
                    placeholder="وصف اللون"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">سعر الشراء</Label>
                  <Input 
                    id="purchasePrice" 
                    type="number" 
                    value={newDress.purchasePrice} 
                    onChange={(e) => setNewDress({...newDress, purchasePrice: Number(e.target.value)})} 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentalPrice">سعر التأجير</Label>
                  <Input 
                    id="rentalPrice" 
                    type="number" 
                    value={newDress.rentalPrice} 
                    onChange={(e) => setNewDress({...newDress, rentalPrice: Number(e.target.value)})} 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">سعر البيع</Label>
                  <Input 
                    id="salePrice" 
                    type="number" 
                    value={newDress.salePrice} 
                    onChange={(e) => setNewDress({...newDress, salePrice: Number(e.target.value)})} 
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select 
                    value={newDress.status} 
                    onValueChange={(value) => setNewDress({...newDress, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {dressStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">الموقع</Label>
                  <Select 
                    value={newDress.location} 
                    onValueChange={(value) => setNewDress({...newDress, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموقع" />
                    </SelectTrigger>
                    <SelectContent>
                      {dressLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input 
                  id="notes" 
                  value={newDress.notes} 
                  onChange={(e) => setNewDress({...newDress, notes: e.target.value})} 
                  placeholder="أي ملاحظات إضافية"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDressOpen(false);
                  resetDressForm();
                }}
              >
                إلغاء
              </Button>
              <Button 
                className="bg-bloom-primary hover:bg-bloom-primary/90" 
                onClick={handleAddDress}
                disabled={!newDress.name || !newDress.type || !newDress.size}
              >
                {selectedDress ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(countByStatus).map(([status, count]) => (
          <Card key={status} className="text-center" onClick={() => setActiveTab(status)} style={{ cursor: 'pointer' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {status === 'all' ? 'الإجمالي' : 
                 status === 'available' ? 'متاح' :
                 status === 'rented' ? 'مؤجر' :
                 status === 'maintenance' ? 'صيانة' : 'مباع'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>قائمة الفساتين</CardTitle>
              <CardDescription>
                {activeTab === 'all' ? 'جميع الفساتين' : 
                 activeTab === 'available' ? 'الفساتين المتاحة' :
                 activeTab === 'rented' ? 'الفساتين المؤجرة' :
                 activeTab === 'maintenance' ? 'الفساتين في الصيانة' : 'الفساتين المباعة'}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="بحث عن فستان..." 
                className="pl-10 pr-4" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المقاس</TableHead>
                <TableHead>اللون</TableHead>
                <TableHead>سعر التأجير</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDresses.map((dress) => (
                <TableRow key={dress.id}>
                  <TableCell>{dress.id}</TableCell>
                  <TableCell>{dress.name}</TableCell>
                  <TableCell>{getDressTypeLabel(dress.type)}</TableCell>
                  <TableCell>{dress.size}</TableCell>
                  <TableCell>{dress.color}</TableCell>
                  <TableCell>{dress.rentalPrice} ج.م</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(dress.status)}>
                      {getStatusLabel(dress.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{dress.location}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewHistory(dress)}
                        title="سجل الفستان"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedDress(dress);
                          setIsMaintenanceOpen(true);
                        }}
                        title="إرسال للصيانة"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditDress(dress)}
                        title="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteDress(dress.id)}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDresses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    لا يوجد فساتين مطابقة لبحثك
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dress History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>سجل الفستان {selectedDress?.id} - {selectedDress?.name}</DialogTitle>
            <DialogDescription>
              تاريخ الحجوزات والصيانة للفستان
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold">إجمالي الإيجارات</h3>
                <p className="text-2xl">{selectedDress?.totalRentals || 0}</p>
              </div>
              <div>
                <h3 className="font-semibold">إجمالي الإيرادات</h3>
                <p className="text-2xl">{selectedDress?.totalRevenue || 0} ج.م</p>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDress?.history.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        entry.type === 'rent' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        entry.type === 'maintenance' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        entry.type === 'sale' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }>
                        {entry.type === 'rent' ? 'تأجير' :
                         entry.type === 'maintenance' ? 'صيانة' :
                         entry.type === 'sale' ? 'بيع' : entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.client || '-'}</TableCell>
                    <TableCell>{entry.amount ? `${entry.amount} ج.م` : '-'}</TableCell>
                    <TableCell>{entry.notes || '-'}</TableCell>
                  </TableRow>
                ))}
                {(!selectedDress?.history || selectedDress.history.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      لا يوجد سجلات لهذا الفستان
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Maintenance Dialog */}
      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إرسال للصيانة - {selectedDress?.id}</DialogTitle>
            <DialogDescription>
              أدخل بيانات الصيانة ثم اضغط على حفظ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceDate">تاريخ الصيانة</Label>
              <Input 
                id="maintenanceDate" 
                type="date" 
                value={maintenanceForm.date} 
                onChange={(e) => setMaintenanceForm({...maintenanceForm, date: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenanceNotes">ملاحظات الصيانة</Label>
              <Input 
                id="maintenanceNotes" 
                value={maintenanceForm.notes} 
                onChange={(e) => setMaintenanceForm({...maintenanceForm, notes: e.target.value})} 
                placeholder="مثل: تنظيف، إصلاح، تعديل، إلخ."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenanceCost">تكلفة الصيانة (اختياري)</Label>
              <Input 
                id="maintenanceCost" 
                type="number" 
                value={maintenanceForm.cost} 
                onChange={(e) => setMaintenanceForm({...maintenanceForm, cost: Number(e.target.value)})} 
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsMaintenanceOpen(false)}>إلغاء</Button>
            <Button 
              className="bg-bloom-primary hover:bg-bloom-primary/90" 
              onClick={handleAddMaintenance}
            >
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
