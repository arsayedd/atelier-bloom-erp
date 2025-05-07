
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';

// Mock data for governorates and cities
const mockGovernorates = [
  { id: 1, name: 'الدقهلية', order: 1, cities: [
    { id: 101, name: 'المنصورة', order: 1 },
    { id: 102, name: 'طلخا', order: 2 },
    { id: 103, name: 'ميت غمر', order: 3 },
    { id: 104, name: 'السنبلاوين', order: 4 },
  ]},
  { id: 2, name: 'الغربية', order: 2, cities: [
    { id: 201, name: 'طنطا', order: 1 },
    { id: 202, name: 'المحلة الكبرى', order: 2 },
    { id: 203, name: 'زفتى', order: 3 },
    { id: 204, name: 'السنطة', order: 4 },
  ]},
  { id: 3, name: 'القليوبية', order: 3, cities: [
    { id: 301, name: 'بنها', order: 1 },
    { id: 302, name: 'شبين القناطر', order: 2 },
    { id: 303, name: 'طوخ', order: 3 },
    { id: 304, name: 'قليوب', order: 4 },
  ]},
  { id: 4, name: 'الشرقية', order: 4, cities: [
    { id: 401, name: 'الزقازيق', order: 1 },
    { id: 402, name: 'منيا القمح', order: 2 },
    { id: 403, name: 'بلبيس', order: 3 },
    { id: 404, name: 'أبو حماد', order: 4 },
  ]},
];

// Mock data for employees
const mockEmployees = [
  {
    id: 1,
    name: 'فاطمة محمد',
    role: 'خبيرة ميكب',
    phone: '01012345678',
    commissionRates: {
      newBookings: 10,
      additions: 5,
      cleaning: 2,
      outdoor: 15,
    },
    active: true,
  },
  {
    id: 2,
    name: 'نورا أحمد',
    role: 'أخصائية بشرة',
    phone: '01112345678',
    commissionRates: {
      newBookings: 12,
      additions: 8,
      cleaning: 0,
      outdoor: 0,
    },
    active: true,
  },
  {
    id: 3,
    name: 'سارة علي',
    role: 'مصممة أزياء',
    phone: '01212345678',
    commissionRates: {
      newBookings: 8,
      additions: 4,
      cleaning: 0,
      outdoor: 0,
    },
    active: true,
  },
];

// Mock data for referral coupons
const mockCoupons = [
  {
    id: 'CP1001',
    code: 'BLOOM800',
    amount: 800,
    type: 'fixed',
    validUntil: '2024-05-20',
    issuedTo: 'سارة أحمد',
    clientId: 'C1001',
    status: 'active',
    usageCount: 0,
  },
  {
    id: 'CP1002',
    code: 'REFER10',
    amount: 10,
    type: 'percentage',
    validUntil: '2024-04-15',
    issuedTo: 'نور محمد',
    clientId: 'C1002',
    status: 'active',
    usageCount: 1,
  },
  {
    id: 'CP1003',
    code: 'WELCOME500',
    amount: 500,
    type: 'fixed',
    validUntil: '2024-06-30',
    issuedTo: '',
    clientId: '',
    status: 'active',
    usageCount: 2,
  },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [governorates, setGovernorates] = useState(mockGovernorates);
  const [employees, setEmployees] = useState(mockEmployees);
  const [coupons, setCoupons] = useState(mockCoupons);
  
  // State for governorate form
  const [governorateForm, setGovernorateForm] = useState({
    id: 0,
    name: '',
    order: 0,
  });
  
  // State for city form
  const [cityForm, setCityForm] = useState({
    id: 0,
    name: '',
    order: 0,
    governorateId: 0,
  });
  
  // State for employee form
  const [employeeForm, setEmployeeForm] = useState({
    id: 0,
    name: '',
    role: '',
    phone: '',
    commissionRates: {
      newBookings: 0,
      additions: 0,
      cleaning: 0,
      outdoor: 0,
    },
    active: true,
  });
  
  // State for coupon form
  const [couponForm, setCouponForm] = useState({
    id: '',
    code: '',
    amount: 0,
    type: 'fixed',
    validUntil: new Date().toISOString().split('T')[0],
    issuedTo: '',
    clientId: '',
    status: 'active',
    usageCount: 0,
  });
  
  // State for selected governorate
  const [selectedGovernorate, setSelectedGovernorate] = useState<number | null>(null);
  
  // State for editing mode
  const [isEditingGovernorate, setIsEditingGovernorate] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  
  // Select governorate to view cities
  const handleSelectGovernorate = (id: number) => {
    setSelectedGovernorate(id);
  };
  
  // Add new governorate
  const handleAddGovernorate = () => {
    if (!governorateForm.name) {
      toast.error('يرجى إدخال اسم المحافظة');
      return;
    }
    
    const nextId = Math.max(...governorates.map(g => g.id), 0) + 1;
    const nextOrder = Math.max(...governorates.map(g => g.order), 0) + 1;
    
    const newGovernorate = {
      id: nextId,
      name: governorateForm.name,
      order: nextOrder,
      cities: [],
    };
    
    setGovernorates([...governorates, newGovernorate]);
    setGovernorateForm({ id: 0, name: '', order: 0 });
    
    toast.success('تم إضافة المحافظة بنجاح');
  };
  
  // Update governorate
  const handleUpdateGovernorate = () => {
    if (!governorateForm.name || governorateForm.id === 0) {
      toast.error('يرجى اختيار محافظة وإدخال اسمها');
      return;
    }
    
    const updatedGovernorates = governorates.map(g => {
      if (g.id === governorateForm.id) {
        return { ...g, name: governorateForm.name, order: governorateForm.order };
      }
      return g;
    });
    
    setGovernorates(updatedGovernorates);
    setGovernorateForm({ id: 0, name: '', order: 0 });
    setIsEditingGovernorate(false);
    
    toast.success('تم تحديث المحافظة بنجاح');
  };
  
  // Delete governorate
  const handleDeleteGovernorate = (id: number) => {
    const filteredGovernorates = governorates.filter(g => g.id !== id);
    setGovernorates(filteredGovernorates);
    
    if (selectedGovernorate === id) {
      setSelectedGovernorate(null);
    }
    
    toast.success('تم حذف المحافظة بنجاح');
  };
  
  // Edit governorate
  const handleEditGovernorate = (governorate: any) => {
    setGovernorateForm({
      id: governorate.id,
      name: governorate.name,
      order: governorate.order,
    });
    setIsEditingGovernorate(true);
  };
  
  // Add new city
  const handleAddCity = () => {
    if (!cityForm.name || cityForm.governorateId === 0) {
      toast.error('يرجى إدخال اسم المدينة واختيار المحافظة');
      return;
    }
    
    const governorate = governorates.find(g => g.id === cityForm.governorateId);
    if (!governorate) {
      toast.error('المحافظة غير موجودة');
      return;
    }
    
    const nextId = Math.max(...governorate.cities.map(c => c.id), 0) + 1;
    const nextOrder = Math.max(...governorate.cities.map(c => c.order), 0) + 1;
    
    const newCity = {
      id: nextId,
      name: cityForm.name,
      order: nextOrder,
    };
    
    const updatedGovernorates = governorates.map(g => {
      if (g.id === cityForm.governorateId) {
        return { ...g, cities: [...g.cities, newCity] };
      }
      return g;
    });
    
    setGovernorates(updatedGovernorates);
    setCityForm({ id: 0, name: '', order: 0, governorateId: cityForm.governorateId });
    setIsAddingCity(false);
    
    toast.success('تم إضافة المدينة بنجاح');
  };
  
  // Edit city
  const handleEditCity = (city: any, governorateId: number) => {
    setCityForm({
      id: city.id,
      name: city.name,
      order: city.order,
      governorateId,
    });
    setIsEditingCity(true);
  };
  
  // Update city
  const handleUpdateCity = () => {
    if (!cityForm.name || cityForm.id === 0 || cityForm.governorateId === 0) {
      toast.error('يرجى اختيار مدينة وإدخال اسمها');
      return;
    }
    
    const updatedGovernorates = governorates.map(g => {
      if (g.id === cityForm.governorateId) {
        const updatedCities = g.cities.map(c => {
          if (c.id === cityForm.id) {
            return { ...c, name: cityForm.name, order: cityForm.order };
          }
          return c;
        });
        return { ...g, cities: updatedCities };
      }
      return g;
    });
    
    setGovernorates(updatedGovernorates);
    setCityForm({ id: 0, name: '', order: 0, governorateId: 0 });
    setIsEditingCity(false);
    
    toast.success('تم تحديث المدينة بنجاح');
  };
  
  // Delete city
  const handleDeleteCity = (cityId: number, governorateId: number) => {
    const updatedGovernorates = governorates.map(g => {
      if (g.id === governorateId) {
        return { ...g, cities: g.cities.filter(c => c.id !== cityId) };
      }
      return g;
    });
    
    setGovernorates(updatedGovernorates);
    toast.success('تم حذف المدينة بنجاح');
  };
  
  // Add new employee
  const handleAddEmployee = () => {
    if (!employeeForm.name || !employeeForm.role || !employeeForm.phone) {
      toast.error('يرجى إدخال بيانات الموظف بالكامل');
      return;
    }
    
    const nextId = Math.max(...employees.map(e => e.id), 0) + 1;
    
    const newEmployee = {
      id: nextId,
      name: employeeForm.name,
      role: employeeForm.role,
      phone: employeeForm.phone,
      commissionRates: { ...employeeForm.commissionRates },
      active: employeeForm.active,
    };
    
    setEmployees([...employees, newEmployee]);
    setEmployeeForm({
      id: 0,
      name: '',
      role: '',
      phone: '',
      commissionRates: {
        newBookings: 0,
        additions: 0,
        cleaning: 0,
        outdoor: 0,
      },
      active: true,
    });
    
    toast.success('تم إضافة الموظف بنجاح');
  };
  
  // Update employee
  const handleUpdateEmployee = () => {
    if (!employeeForm.name || !employeeForm.role || !employeeForm.phone || employeeForm.id === 0) {
      toast.error('يرجى إدخال بيانات الموظف بالكامل');
      return;
    }
    
    const updatedEmployees = employees.map(e => {
      if (e.id === employeeForm.id) {
        return { ...employeeForm };
      }
      return e;
    });
    
    setEmployees(updatedEmployees);
    setEmployeeForm({
      id: 0,
      name: '',
      role: '',
      phone: '',
      commissionRates: {
        newBookings: 0,
        additions: 0,
        cleaning: 0,
        outdoor: 0,
      },
      active: true,
    });
    setIsEditingEmployee(false);
    
    toast.success('تم تحديث بيانات الموظف بنجاح');
  };
  
  // Edit employee
  const handleEditEmployee = (employee: any) => {
    setEmployeeForm({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      commissionRates: { ...employee.commissionRates },
      active: employee.active,
    });
    setIsEditingEmployee(true);
  };
  
  // Delete employee
  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter(e => e.id !== id));
    toast.success('تم حذف الموظف بنجاح');
  };
  
  // Toggle employee active status
  const handleToggleEmployeeStatus = (id: number) => {
    setEmployees(employees.map(e => {
      if (e.id === id) {
        return { ...e, active: !e.active };
      }
      return e;
    }));
    toast.success('تم تحديث حالة الموظف بنجاح');
  };
  
  // Generate random coupon code
  const generateCouponCode = () => {
    const prefix = 'BLOOM';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  };
  
  // Add new coupon
  const handleAddCoupon = () => {
    if (!couponForm.code || couponForm.amount <= 0 || !couponForm.validUntil) {
      toast.error('يرجى إدخال بيانات الكوبون بالكامل');
      return;
    }
    
    // Check if code already exists
    if (coupons.some(c => c.code === couponForm.code)) {
      toast.error('كود الكوبون موجود بالفعل');
      return;
    }
    
    const nextId = `CP${1000 + coupons.length + 1}`;
    
    const newCoupon = {
      id: nextId,
      code: couponForm.code,
      amount: couponForm.amount,
      type: couponForm.type,
      validUntil: couponForm.validUntil,
      issuedTo: couponForm.issuedTo,
      clientId: couponForm.clientId,
      status: couponForm.status,
      usageCount: 0,
    };
    
    setCoupons([...coupons, newCoupon]);
    setCouponForm({
      id: '',
      code: generateCouponCode(),
      amount: 0,
      type: 'fixed',
      validUntil: new Date().toISOString().split('T')[0],
      issuedTo: '',
      clientId: '',
      status: 'active',
      usageCount: 0,
    });
    setIsAddingCoupon(false);
    
    toast.success('تم إضافة الكوبون بنجاح');
  };
  
  // Delete coupon
  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast.success('تم حذف الكوبون بنجاح');
  };
  
  // Toggle coupon status
  const handleToggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'active' ? 'inactive' : 'active' };
      }
      return c;
    }));
    toast.success('تم تحديث حالة الكوبون بنجاح');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">الإعدادات</h1>
      </div>
      
      <Tabs defaultValue={activeTab} className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="locations">المحافظات والمدن</TabsTrigger>
          <TabsTrigger value="employees">الموظفون والعمولات</TabsTrigger>
          <TabsTrigger value="coupons">كوبونات الترشيح</TabsTrigger>
          <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
        </TabsList>
        
        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المحافظات</CardTitle>
                <CardDescription>إدارة المحافظات المتاحة في النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingGovernorate ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="governorateName">اسم المحافظة</Label>
                      <Input 
                        id="governorateName" 
                        value={governorateForm.name} 
                        onChange={(e) => setGovernorateForm({...governorateForm, name: e.target.value})} 
                        placeholder="اسم المحافظة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="governorateOrder">الترتيب</Label>
                      <Input 
                        id="governorateOrder" 
                        type="number" 
                        value={governorateForm.order} 
                        onChange={(e) => setGovernorateForm({...governorateForm, order: Number(e.target.value)})} 
                        placeholder="رقم الترتيب"
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setGovernorateForm({ id: 0, name: '', order: 0 });
                          setIsEditingGovernorate(false);
                        }}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        className="bg-bloom-primary hover:bg-bloom-primary/90" 
                        onClick={handleUpdateGovernorate}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        حفظ التغييرات
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="governorateName">اسم المحافظة</Label>
                      <Input 
                        id="governorateName" 
                        value={governorateForm.name} 
                        onChange={(e) => setGovernorateForm({...governorateForm, name: e.target.value})} 
                        placeholder="اسم المحافظة"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        className="bg-bloom-primary hover:bg-bloom-primary/90" 
                        onClick={handleAddGovernorate}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        إضافة محافظة
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الترتيب</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {governorates.sort((a, b) => a.order - b.order).map((governorate) => (
                        <TableRow 
                          key={governorate.id} 
                          className={selectedGovernorate === governorate.id ? 'bg-muted/50' : ''}
                          onClick={() => handleSelectGovernorate(governorate.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell>{governorate.name}</TableCell>
                          <TableCell>{governorate.order}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditGovernorate(governorate);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGovernorate(governorate.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {governorates.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6">
                            لا توجد محافظات
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>المدن</CardTitle>
                    <CardDescription>
                      {selectedGovernorate !== null 
                        ? `مدن محافظة ${governorates.find(g => g.id === selectedGovernorate)?.name}`
                        : 'اختر محافظة لعرض المدن'}
                    </CardDescription>
                  </div>
                  {selectedGovernorate !== null && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCityForm({...cityForm, governorateId: selectedGovernorate});
                        setIsAddingCity(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      إضافة مدينة
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAddingCity && (
                  <div className="space-y-4 border rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="cityName">اسم المدينة</Label>
                      <Input 
                        id="cityName" 
                        value={cityForm.name} 
                        onChange={(e) => setCityForm({...cityForm, name: e.target.value})} 
                        placeholder="اسم المدينة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cityOrder">الترتيب</Label>
                      <Input 
                        id="cityOrder" 
                        type="number" 
                        value={cityForm.order || ''}
                        onChange={(e) => setCityForm({...cityForm, order: Number(e.target.value)})} 
                        placeholder="رقم الترتيب"
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCityForm({ id: 0, name: '', order: 0, governorateId: 0 });
                          setIsAddingCity(false);
                        }}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        className="bg-bloom-primary hover:bg-bloom-primary/90" 
                        onClick={handleAddCity}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        إضافة
                      </Button>
                    </div>
                  </div>
                )}
                
                {isEditingCity && (
                  <div className="space-y-4 border rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="cityNameEdit">اسم المدينة</Label>
                      <Input 
                        id="cityNameEdit" 
                        value={cityForm.name} 
                        onChange={(e) => setCityForm({...cityForm, name: e.target.value})} 
                        placeholder="اسم المدينة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cityOrderEdit">الترتيب</Label>
                      <Input 
                        id="cityOrderEdit" 
                        type="number" 
                        value={cityForm.order} 
                        onChange={(e) => setCityForm({...cityForm, order: Number(e.target.value)})} 
                        placeholder="رقم الترتيب"
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCityForm({ id: 0, name: '', order: 0, governorateId: 0 });
                          setIsEditingCity(false);
                        }}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        className="bg-bloom-primary hover:bg-bloom-primary/90" 
                        onClick={handleUpdateCity}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        حفظ التغييرات
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الترتيب</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGovernorate !== null && governorates.find(g => g.id === selectedGovernorate)?.cities.sort((a, b) => a.order - b.order).map((city) => (
                        <TableRow key={city.id}>
                          <TableCell>{city.name}</TableCell>
                          <TableCell>{city.order}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditCity(city, selectedGovernorate)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteCity(city.id, selectedGovernorate)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(selectedGovernorate === null || governorates.find(g => g.id === selectedGovernorate)?.cities.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6">
                            {selectedGovernorate === null ? 'اختر محافظة لعرض المدن' : 'لا توجد مدن في هذه المحافظة'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>الموظفون والعمولات</CardTitle>
                  <CardDescription>إدارة بيانات الموظفين ونسب العمولات</CardDescription>
                </div>
                {!isEditingEmployee && (
                  <Button 
                    className="bg-bloom-primary hover:bg-bloom-primary/90"
                    onClick={() => {
                      setEmployeeForm({
                        id: 0,
                        name: '',
                        role: '',
                        phone: '',
                        commissionRates: {
                          newBookings: 0,
                          additions: 0,
                          cleaning: 0,
                          outdoor: 0,
                        },
                        active: true,
                      });
                      setIsEditingEmployee(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    إضافة موظف جديد
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(isEditingEmployee || employeeForm.id === 0) && (
                <div className="space-y-4 border rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium">{isEditingEmployee ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeName">اسم الموظف</Label>
                      <Input 
                        id="employeeName" 
                        value={employeeForm.name} 
                        onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})} 
                        placeholder="الاسم بالكامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeRole">الوظيفة</Label>
                      <Input 
                        id="employeeRole" 
                        value={employeeForm.role} 
                        onChange={(e) => setEmployeeForm({...employeeForm, role: e.target.value})} 
                        placeholder="المسمى الوظيفي"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employeePhone">رقم الهاتف</Label>
                    <Input 
                      id="employeePhone" 
                      value={employeeForm.phone} 
                      onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})} 
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">نسب العمولات (%)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="commissionNewBookings">الحجوزات الجديدة</Label>
                        <Input 
                          id="commissionNewBookings" 
                          type="number" 
                          value={employeeForm.commissionRates.newBookings} 
                          onChange={(e) => setEmployeeForm({
                            ...employeeForm, 
                            commissionRates: {
                              ...employeeForm.commissionRates,
                              newBookings: Number(e.target.value)
                            }
                          })} 
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commissionAdditions">الإضافات</Label>
                        <Input 
                          id="commissionAdditions" 
                          type="number" 
                          value={employeeForm.commissionRates.additions} 
                          onChange={(e) => setEmployeeForm({
                            ...employeeForm, 
                            commissionRates: {
                              ...employeeForm.commissionRates,
                              additions: Number(e.target.value)
                            }
                          })} 
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commissionCleaning">المغسلة</Label>
                        <Input 
                          id="commissionCleaning" 
                          type="number" 
                          value={employeeForm.commissionRates.cleaning} 
                          onChange={(e) => setEmployeeForm({
                            ...employeeForm, 
                            commissionRates: {
                              ...employeeForm.commissionRates,
                              cleaning: Number(e.target.value)
                            }
                          })} 
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commissionOutdoor">أوت دور</Label>
                        <Input 
                          id="commissionOutdoor" 
                          type="number" 
                          value={employeeForm.commissionRates.outdoor} 
                          onChange={(e) => setEmployeeForm({
                            ...employeeForm, 
                            commissionRates: {
                              ...employeeForm.commissionRates,
                              outdoor: Number(e.target.value)
                            }
                          })} 
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={employeeForm.active} 
                      onCheckedChange={(checked) => setEmployeeForm({...employeeForm, active: checked})}
                    />
                    <Label>فعال</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEmployeeForm({
                          id: 0,
                          name: '',
                          role: '',
                          phone: '',
                          commissionRates: {
                            newBookings: 0,
                            additions: 0,
                            cleaning: 0,
                            outdoor: 0,
                          },
                          active: true,
                        });
                        setIsEditingEmployee(false);
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      className="bg-bloom-primary hover:bg-bloom-primary/90" 
                      onClick={isEditingEmployee ? handleUpdateEmployee : handleAddEmployee}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isEditingEmployee ? 'حفظ التغييرات' : 'إضافة موظف'}
                    </Button>
                  </div>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الوظيفة</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>نسبة الحجوزات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{employee.commissionRates.newBookings}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={employee.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                          {employee.active ? 'فعال' : 'غير فعال'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleEmployeeStatus(employee.id)}
                            title={employee.active ? 'إيقاف' : 'تفعيل'}
                          >
                            <Switch checked={employee.active} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        لا يوجد موظفون
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>كوبونات الترشيح والخصم</CardTitle>
                  <CardDescription>إدارة كوبونات الترشيح والخصومات</CardDescription>
                </div>
                <Button 
                  className="bg-bloom-primary hover:bg-bloom-primary/90"
                  onClick={() => {
                    setCouponForm({
                      id: '',
                      code: generateCouponCode(),
                      amount: 0,
                      type: 'fixed',
                      validUntil: new Date().toISOString().split('T')[0],
                      issuedTo: '',
                      clientId: '',
                      status: 'active',
                      usageCount: 0,
                    });
                    setIsAddingCoupon(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة كوبون جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isAddingCoupon && (
                <div className="space-y-4 border rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium">إضافة كوبون جديد</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="couponCode">كود الكوبون</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="couponCode" 
                          value={couponForm.code} 
                          onChange={(e) => setCouponForm({...couponForm, code: e.target.value})} 
                          placeholder="BLOOM800"
                        />
                        <Button 
                          variant="outline"
                          onClick={() => setCouponForm({...couponForm, code: generateCouponCode()})}
                        >
                          توليد كود
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="couponType">نوع الكوبون</Label>
                      <Select 
                        value={couponForm.type} 
                        onValueChange={(value) => setCouponForm({...couponForm, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                          <SelectItem value="percentage">نسبة مئوية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="couponAmount">
                        {couponForm.type === 'fixed' ? 'قيمة الخصم (ج.م)' : 'نسبة الخصم (%)'}
                      </Label>
                      <Input 
                        id="couponAmount" 
                        type="number" 
                        value={couponForm.amount} 
                        onChange={(e) => setCouponForm({...couponForm, amount: Number(e.target.value)})} 
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="couponValidUntil">صالح حتى</Label>
                      <Input 
                        id="couponValidUntil" 
                        type="date" 
                        value={couponForm.validUntil} 
                        onChange={(e) => setCouponForm({...couponForm, validUntil: e.target.value})} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="couponIssuedTo">اسم العميل (اختياري)</Label>
                      <Input 
                        id="couponIssuedTo" 
                        value={couponForm.issuedTo} 
                        onChange={(e) => setCouponForm({...couponForm, issuedTo: e.target.value})} 
                        placeholder="اسم العميل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="couponClientId">كود العميل (اختياري)</Label>
                      <Input 
                        id="couponClientId" 
                        value={couponForm.clientId} 
                        onChange={(e) => setCouponForm({...couponForm, clientId: e.target.value})} 
                        placeholder="C1001"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setCouponForm({
                          id: '',
                          code: '',
                          amount: 0,
                          type: 'fixed',
                          validUntil: new Date().toISOString().split('T')[0],
                          issuedTo: '',
                          clientId: '',
                          status: 'active',
                          usageCount: 0,
                        });
                        setIsAddingCoupon(false);
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      className="bg-bloom-primary hover:bg-bloom-primary/90" 
                      onClick={handleAddCoupon}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      إضافة كوبون
                    </Button>
                  </div>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>كود الكوبون</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>القيمة</TableHead>
                    <TableHead>صادر لـ</TableHead>
                    <TableHead>صالح حتى</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الاستخدام</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>{coupon.type === 'fixed' ? 'مبلغ ثابت' : 'نسبة مئوية'}</TableCell>
                      <TableCell>
                        {coupon.type === 'fixed' ? `${coupon.amount} ج.م` : `${coupon.amount}%`}
                      </TableCell>
                      <TableCell>{coupon.issuedTo || '-'}</TableCell>
                      <TableCell>{new Date(coupon.validUntil).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={coupon.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                          {coupon.status === 'active' ? 'فعال' : 'غير فعال'}
                        </Badge>
                      </TableCell>
                      <TableCell>{coupon.usageCount} مرات</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleCouponStatus(coupon.id)}
                            title={coupon.status === 'active' ? 'إيقاف' : 'تفعيل'}
                          >
                            <Switch checked={coupon.status === 'active'} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {coupons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        لا توجد كوبونات
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>ضبط الإعدادات العامة للنظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input 
                    id="companyName" 
                    defaultValue="Atelier Bloom" 
                    placeholder="اسم الشركة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">رقم الهاتف</Label>
                  <Input 
                    id="companyPhone" 
                    defaultValue="01012345678" 
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">عنوان الشركة</Label>
                <Input 
                  id="companyAddress" 
                  defaultValue="المنصورة، الدقهلية" 
                  placeholder="عنوان الشركة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tax">نسبة الضريبة (%)</Label>
                <Input 
                  id="tax" 
                  type="number" 
                  defaultValue={14} 
                  placeholder="نسبة الضريبة"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="taxEnabled" defaultChecked={true} />
                <Label htmlFor="taxEnabled">تفعيل الضريبة</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="autoNotifications" defaultChecked={true} />
                <Label htmlFor="autoNotifications">إرسال إشعارات تلقائية للعملاء</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="dailyBackup" defaultChecked={true} />
                <Label htmlFor="dailyBackup">نسخ احتياطي يومي للبيانات</Label>
              </div>
              
              <Button className="bg-bloom-primary hover:bg-bloom-primary/90 mt-4">
                <Save className="mr-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
