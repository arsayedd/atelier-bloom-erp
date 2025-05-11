
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
import { Search, Plus, Pencil, Trash2, History, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService, Dress } from '@/services/InventoryService';

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
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDressOpen, setIsAddDressOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch dresses from database
  const { data: dresses = [], isLoading } = useQuery({
    queryKey: ['dresses'],
    queryFn: () => InventoryService.getDresses(),
    meta: {
      onError: () => {
        toast.error('فشل في تحميل بيانات الفساتين');
      }
    }
  });
  
  // Form state for new dress
  const [newDress, setNewDress] = useState<Partial<Dress>>({
    name: '',
    category: '',
    size: '',
    color: '',
    rental_price: 0,
    sale_price: 0,
    is_available: true,
    condition: 'good',
    description: ''
  });
  
  // Form state for maintenance entry
  const [maintenanceForm, setMaintenanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    cost: 0,
  });
  
  // Mutations for CRUD operations
  const createDressMutation = useMutation({
    mutationFn: (dress: Omit<Dress, 'id' | 'created_at' | 'updated_at'>) => 
      InventoryService.createDress(dress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dresses'] });
      setIsAddDressOpen(false);
      toast.success('تم إضافة الفستان بنجاح');
      resetDressForm();
    },
    onError: () => {
      toast.error('فشل في إضافة الفستان');
    }
  });
  
  const updateDressMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Dress> }) => 
      InventoryService.updateDress(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dresses'] });
      setIsAddDressOpen(false);
      toast.success('تم تحديث الفستان بنجاح');
      resetDressForm();
    },
    onError: () => {
      toast.error('فشل في تحديث الفستان');
    }
  });
  
  const deleteDressMutation = useMutation({
    mutationFn: (id: string) => InventoryService.deleteDress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dresses'] });
      toast.success('تم حذف الفستان بنجاح');
    },
    onError: () => {
      toast.error('فشل في حذف الفستان');
    }
  });
  
  const maintenanceMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string, notes: string }) => 
      InventoryService.sendDressToMaintenance(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dresses'] });
      setIsMaintenanceOpen(false);
      toast.success('تم إرسال الفستان للصيانة');
      setMaintenanceForm({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        cost: 0,
      });
    },
    onError: () => {
      toast.error('فشل في إرسال الفستان للصيانة');
    }
  });

  // Filter dresses based on search term and active tab
  const filteredDresses = dresses.filter(dress => {
    const matchesSearch = 
      dress.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dress.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'available' && dress.is_available && dress.condition !== 'maintenance') ||
      (activeTab === 'rented' && !dress.is_available && dress.condition !== 'maintenance') ||
      (activeTab === 'maintenance' && dress.condition === 'maintenance') ||
      (activeTab === 'sold' && dress.condition === 'sold');
    
    return matchesSearch && matchesTab;
  });
  
  // Count dresses by status
  const countByStatus = {
    all: dresses.length,
    available: dresses.filter(d => d.is_available && d.condition !== 'maintenance').length,
    rented: dresses.filter(d => !d.is_available && d.condition !== 'maintenance' && d.condition !== 'sold').length,
    maintenance: dresses.filter(d => d.condition === 'maintenance').length,
    sold: dresses.filter(d => d.condition === 'sold').length,
  };
  
  // Handle add new dress
  const handleAddDress = () => {
    if (selectedDress && selectedDress.id) {
      updateDressMutation.mutate({
        id: selectedDress.id,
        updates: newDress
      });
    } else {
      createDressMutation.mutate(newDress as Omit<Dress, 'id' | 'created_at' | 'updated_at'>);
    }
  };
  
  // Handle edit dress
  const handleEditDress = (dress: Dress) => {
    setSelectedDress(dress);
    setNewDress({
      name: dress.name,
      category: dress.category || '',
      size: dress.size || '',
      color: dress.color || '',
      condition: dress.condition || 'good',
      rental_price: dress.rental_price,
      sale_price: dress.sale_price || 0,
      is_available: dress.is_available,
      description: dress.description || ''
    });
    setIsAddDressOpen(true);
  };
  
  // Handle delete dress
  const handleDeleteDress = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفستان؟')) {
      deleteDressMutation.mutate(id);
    }
  };
  
  // Reset dress form
  const resetDressForm = () => {
    setNewDress({
      name: '',
      category: '',
      size: '',
      color: '',
      rental_price: 0,
      sale_price: 0,
      is_available: true,
      condition: 'good',
      description: ''
    });
    setSelectedDress(null);
  };
  
  // View dress history
  const handleViewHistory = async (dress: Dress) => {
    setSelectedDress(dress);
    setIsHistoryOpen(true);
    
    // You can fetch additional history data here if needed
  };
  
  // Add maintenance record
  const handleAddMaintenance = () => {
    if (!selectedDress) return;
    
    maintenanceMutation.mutate({
      id: selectedDress.id,
      notes: maintenanceForm.notes
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };
  
  // Get status badge class
  const getStatusBadgeClass = (dress: Dress) => {
    if (!dress.is_available && dress.condition !== 'maintenance') {
      return 'bg-blue-100 text-blue-800 border-blue-200'; // rented
    } else if (dress.condition === 'maintenance') {
      return 'bg-amber-100 text-amber-800 border-amber-200'; // maintenance
    } else if (dress.condition === 'sold') {
      return 'bg-purple-100 text-purple-800 border-purple-200'; // sold
    } else {
      return 'bg-green-100 text-green-800 border-green-200'; // available
    }
  };
  
  // Get status label
  const getStatusLabel = (dress: Dress) => {
    if (!dress.is_available && dress.condition !== 'maintenance' && dress.condition !== 'sold') {
      return 'مؤجر';
    } else if (dress.condition === 'maintenance') {
      return 'صيانة';
    } else if (dress.condition === 'sold') {
      return 'مباع';
    } else {
      return 'متاح';
    }
  };
  
  // Get dress type label
  const getDressTypeLabel = (type: string | undefined) => {
    if (!type) return '';
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
                    value={newDress.category} 
                    onValueChange={(value) => setNewDress({...newDress, category: value})}
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
                  <Label htmlFor="rentalPrice">سعر التأجير</Label>
                  <Input 
                    id="rentalPrice" 
                    type="number" 
                    value={newDress.rental_price} 
                    onChange={(e) => setNewDress({...newDress, rental_price: Number(e.target.value)})} 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">سعر البيع</Label>
                  <Input 
                    id="salePrice" 
                    type="number" 
                    value={newDress.sale_price || 0} 
                    onChange={(e) => setNewDress({...newDress, sale_price: Number(e.target.value)})} 
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">الحالة</Label>
                  <Select 
                    value={newDress.condition} 
                    onValueChange={(value) => setNewDress({...newDress, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">جيدة</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="sold">مباع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isAvailable">متاح للتأجير</Label>
                <Select 
                  value={newDress.is_available ? "true" : "false"} 
                  onValueChange={(value) => setNewDress({...newDress, is_available: value === "true"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">نعم</SelectItem>
                    <SelectItem value="false">لا</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input 
                  id="notes" 
                  value={newDress.description || ''} 
                  onChange={(e) => setNewDress({...newDress, description: e.target.value})} 
                  placeholder="أي ملاحظات إضافية"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
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
                disabled={!newDress.name || !newDress.rental_price}
              >
                {selectedDress ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(countByStatus).map(([status, count]) => (
          <Card key={status} className={`text-center ${activeTab === status ? 'ring-2 ring-primary' : ''}`} onClick={() => setActiveTab(status)} style={{ cursor: 'pointer' }}>
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
          {isLoading ? (
            <div className="flex justify-center py-10">
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : (
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
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDresses.map((dress) => (
                  <TableRow key={dress.id}>
                    <TableCell>{dress.id.substring(0, 8)}</TableCell>
                    <TableCell>{dress.name}</TableCell>
                    <TableCell>{getDressTypeLabel(dress.category)}</TableCell>
                    <TableCell>{dress.size}</TableCell>
                    <TableCell>{dress.color}</TableCell>
                    <TableCell>{dress.rental_price} ج.م</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(dress)}>
                        {getStatusLabel(dress)}
                      </Badge>
                    </TableCell>
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
                          disabled={dress.condition === 'maintenance'}
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
                    <TableCell colSpan={8} className="text-center py-6">
                      لا يوجد فساتين مطابقة لبحثك
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Dress History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>سجل الفستان {selectedDress?.id?.substring(0, 8)} - {selectedDress?.name}</DialogTitle>
            <DialogDescription>
              تاريخ الحجوزات والصيانة للفستان
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="text-center py-8">
              <p className="text-gray-500">جاري العمل على هذه الميزة</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Maintenance Dialog */}
      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إرسال للصيانة - {selectedDress?.id?.substring(0, 8)}</DialogTitle>
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
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
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
