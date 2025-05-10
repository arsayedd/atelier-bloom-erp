
import React, { useState, useEffect } from 'react';
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
import { Form } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Plus, Trash2, Pencil, Save, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationSettingsService, Governorate, City } from '@/services/LocationSettingsService';
import { EmployeeService, Employee } from '@/services/EmployeeService';
import { ReferralCouponService, ReferralCoupon } from '@/services/ReferralCouponService';
import { SystemSettingsService, SystemSetting } from '@/services/SystemSettingsService';

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('locations');
  
  // State for governorate form
  const [governorateForm, setGovernorateForm] = useState({
    id: '',
    name: '',
    order_num: 0,
  });
  
  // State for city form
  const [cityForm, setCityForm] = useState({
    id: '',
    name: '',
    order_num: 0,
    governorate_id: '',
  });
  
  // State for employee form
  const [employeeForm, setEmployeeForm] = useState({
    id: '',
    name: '',
    role: '',
    phone: '',
    commission_rates: {
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
    type: 'fixed' as 'fixed' | 'percentage',
    valid_until: new Date().toISOString().split('T')[0],
    issued_to: '',
    client_id: '',
    status: 'active' as 'active' | 'inactive',
  });
  
  // State for system settings form
  const [systemSettings, setSystemSettings] = useState<{
    company_name: string;
    company_phone: string;
    company_address: string;
    tax_rate: number;
    tax_enabled: boolean;
    auto_notifications: boolean;
    daily_backup: boolean;
  }>({
    company_name: '',
    company_phone: '',
    company_address: '',
    tax_rate: 14,
    tax_enabled: true,
    auto_notifications: true,
    daily_backup: true,
  });
  
  // State for selected governorate
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  
  // State for editing mode
  const [isEditingGovernorate, setIsEditingGovernorate] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  
  // Fetch governorates and cities
  const { 
    data: governorates = [], 
    isLoading: isLoadingGovernorates 
  } = useQuery({
    queryKey: ['governorates'],
    queryFn: LocationSettingsService.getGovernorates,
  });
  
  // Fetch employees
  const { 
    data: employees = [], 
    isLoading: isLoadingEmployees 
  } = useQuery({
    queryKey: ['employees'],
    queryFn: EmployeeService.getEmployees,
  });
  
  // Fetch coupons
  const { 
    data: coupons = [], 
    isLoading: isLoadingCoupons 
  } = useQuery({
    queryKey: ['coupons'],
    queryFn: ReferralCouponService.getCoupons,
  });
  
  // Fetch system settings
  const { 
    data: settings = [], 
    isLoading: isLoadingSettings 
  } = useQuery({
    queryKey: ['system-settings'],
    queryFn: SystemSettingsService.getSettings,
  });
  
  // Parse system settings when they're loaded
  useEffect(() => {
    if (settings.length > 0) {
      const settingsObj = {
        company_name: '',
        company_phone: '',
        company_address: '',
        tax_rate: 14,
        tax_enabled: true,
        auto_notifications: true,
        daily_backup: true,
      };
      
      settings.forEach(setting => {
        if (setting.key in settingsObj) {
          if (setting.type === 'boolean') {
            settingsObj[setting.key as keyof typeof settingsObj] = setting.value === 'true';
          } else if (setting.type === 'number') {
            settingsObj[setting.key as keyof typeof settingsObj] = parseFloat(setting.value);
          } else {
            settingsObj[setting.key as keyof typeof settingsObj] = setting.value;
          }
        }
      });
      
      setSystemSettings(settingsObj);
    }
  }, [settings]);
  
  // Mutations for governorates
  const createGovernorateMutation = useMutation({
    mutationFn: (governorate: { name: string; order_num: number }) => 
      LocationSettingsService.createGovernorate(governorate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governorates'] });
      toast.success('تم إضافة المحافظة بنجاح');
      setGovernorateForm({ id: '', name: '', order_num: 0 });
    },
    meta: {
      onError: (error: any) => {
        console.error('Error creating governorate:', error);
        toast.error('فشل في إضافة المحافظة');
      }
    }
  });
  
  const updateGovernorateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; order_num?: number } }) => 
      LocationSettingsService.updateGovernorate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governorates'] });
      toast.success('تم تحديث المحافظة بنجاح');
      setGovernorateForm({ id: '', name: '', order_num: 0 });
      setIsEditingGovernorate(false);
    },
    meta: {
      onError: (error: any) => {
        console.error('Error updating governorate:', error);
        toast.error('فشل في تحديث المحافظة');
      }
    }
  });
  
  const deleteGovernorateMutation = useMutation({
    mutationFn: (id: string) => LocationSettingsService.deleteGovernorate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['governorates'] });
      if (selectedGovernorate === id) {
        setSelectedGovernorate(null);
      }
      toast.success('تم حذف المحافظة بنجاح');
    },
    meta: {
      onError: (error: any) => {
        console.error('Error deleting governorate:', error);
        toast.error('فشل في حذف المحافظة');
      }
    }
  });
  
  // Mutations for cities
  const createCityMutation = useMutation({
    mutationFn: (city: { name: string; order_num: number; governorate_id: string }) => 
      LocationSettingsService.createCity(city),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governorates'] });
      toast.success('تم إضافة المدينة بنجاح');
      setCityForm({ id: '', name: '', order_num: 0, governorate_id: selectedGovernorate || '' });
      setIsAddingCity(false);
    },
    meta: {
      onError: (error: any) => {
        console.error('Error creating city:', error);
        toast.error('فشل في إضافة المدينة');
      }
    }
  });
  
  const updateCityMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; order_num?: number } }) => 
      LocationSettingsService.updateCity(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governorates'] });
      toast.success('تم تحديث المدينة بنجاح');
      setCityForm({ id: '', name: '', order_num: 0, governorate_id: '' });
      setIsEditingCity(false);
    },
    meta: {
      onError: (error: any) => {
        console.error('Error updating city:', error);
        toast.error('فشل في تحديث المدينة');
      }
    }
  });
  
  const deleteCityMutation = useMutation({
    mutationFn: (id: string) => LocationSettingsService.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governorates'] });
      toast.success('تم حذف المدينة بنجاح');
    },
    meta: {
      onError: (error: any) => {
        console.error('Error deleting city:', error);
        toast.error('فشل في حذف المدينة');
      }
    }
  });
  
  // Mutations for employees
  const createEmployeeMutation = useMutation({
    mutationFn: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => 
      EmployeeService.createEmployee(employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('تم إضافة الموظف بنجاح');
      setEmployeeForm({
        id: '',
        name: '',
        role: '',
        phone: '',
        commission_rates: {
          newBookings: 0,
          additions: 0,
          cleaning: 0,
          outdoor: 0,
        },
        active: true,
      });
    },
    meta: {
      onError: (error: any) => {
        console.error('Error creating employee:', error);
        toast.error('فشل في إضافة الموظف');
      }
    }
  });
  
  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) => 
      EmployeeService.updateEmployee(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('تم تحديث بيانات الموظف بنجاح');
      setEmployeeForm({
        id: '',
        name: '',
        role: '',
        phone: '',
        commission_rates: {
          newBookings: 0,
          additions: 0,
          cleaning: 0,
          outdoor: 0,
        },
        active: true,
      });
      setIsEditingEmployee(false);
    },
    meta: {
      onError: (error: any) => {
        console.error('Error updating employee:', error);
        toast.error('فشل في تحديث بيانات الموظف');
      }
    }
  });
  
  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => EmployeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('تم حذف الموظف بنجاح');
    },
    meta: {
      onError: (error: any) => {
        console.error('Error deleting employee:', error);
        toast.error('فشل في حذف الموظف');
      }
    }
  });
  
  const toggleEmployeeStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      EmployeeService.toggleEmployeeStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('تم تحديث حالة الموظف بنجاح');
    },
    meta: {
      onError: (error: any) => {
        console.error('Error toggling employee status:', error);
        toast.error('فشل في تحديث حالة الموظف');
      }
    }
  });
  
  // Mutations for coupons
  const createCouponMutation = useMutation({
    mutationFn: (coupon: Omit<ReferralCoupon, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => 
      ReferralCouponService.createCoupon(coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('تم إضافة الكوبون بنجاح');
      setCouponForm({
        id: '',
        code: generateCouponCode(),
        amount: 0,
        type: 'fixed',
        valid_until: new Date().toISOString().split('T')[0],
        issued_to: '',
        client_id: '',
        status: 'active',
      });
      setIsAddingCoupon(false);
    },
    meta: {
      onError: (error: any) => {
        console.error('Error creating coupon:', error);
        toast.error('فشل في إضافة الكوبون');
      }
    }
  });
  
  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) => ReferralCouponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('تم حذف الكوبون بنجاح');
    },
    meta: {
      onError: (error: any) => {
        console.error('Error deleting coupon:', error);
        toast.error('فشل في حذف الكوبون');
      }
    }
  });
  
  const toggleCouponStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => 
      ReferralCouponService.toggleCouponStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('تم تحديث حالة الكوبون بنجاح');
    },
    meta: {
      onError: (error: any) => {
        console.error('Error toggling coupon status:', error);
        toast.error('فشل في تحديث حالة الكوبون');
      }
    }
  });
  
  // Mutation for system settings
  const updateSystemSettingsMutation = useMutation({
    mutationFn: (settings: { key: string; value: string }[]) => 
      SystemSettingsService.updateMultipleSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    meta: {
      onError: (error: any) => {
        console.error('Error updating system settings:', error);
        toast.error('فشل في حفظ الإعدادات');
      }
    }
  });
  
  // Select governorate to view cities
  const handleSelectGovernorate = (id: string) => {
    setSelectedGovernorate(id);
  };
  
  // Add new governorate
  const handleAddGovernorate = () => {
    if (!governorateForm.name) {
      toast.error('يرجى إدخال اسم المحافظة');
      return;
    }
    
    const nextOrder = Math.max(...(governorates.length ? governorates.map(g => g.order_num) : [0]), 0) + 1;
    
    createGovernorateMutation.mutate({
      name: governorateForm.name,
      order_num: governorateForm.order_num || nextOrder
    });
  };
  
  // Update governorate
  const handleUpdateGovernorate = () => {
    if (!governorateForm.name || governorateForm.id === '') {
      toast.error('يرجى اختيار محافظة وإدخال اسمها');
      return;
    }
    
    updateGovernorateMutation.mutate({
      id: governorateForm.id,
      updates: {
        name: governorateForm.name, 
        order_num: governorateForm.order_num
      }
    });
  };
  
  // Delete governorate
  const handleDeleteGovernorate = (id: string) => {
    deleteGovernorateMutation.mutate(id);
  };
  
  // Edit governorate
  const handleEditGovernorate = (governorate: Governorate) => {
    setGovernorateForm({
      id: governorate.id,
      name: governorate.name,
      order_num: governorate.order_num,
    });
    setIsEditingGovernorate(true);
  };
  
  // Add new city
  const handleAddCity = () => {
    if (!cityForm.name || cityForm.governorate_id === '') {
      toast.error('يرجى إدخال اسم المدينة واختيار المحافظة');
      return;
    }
    
    const governorate = governorates.find(g => g.id === cityForm.governorate_id);
    if (!governorate) {
      toast.error('المحافظة غير موجودة');
      return;
    }
    
    const nextOrder = Math.max(...(governorate.cities ? governorate.cities.map(c => c.order_num) : [0]), 0) + 1;
    
    createCityMutation.mutate({
      name: cityForm.name,
      order_num: cityForm.order_num || nextOrder,
      governorate_id: cityForm.governorate_id
    });
  };
  
  // Edit city
  const handleEditCity = (city: City, governorateId: string) => {
    setCityForm({
      id: city.id,
      name: city.name,
      order_num: city.order_num,
      governorate_id: governorateId,
    });
    setIsEditingCity(true);
  };
  
  // Update city
  const handleUpdateCity = () => {
    if (!cityForm.name || cityForm.id === '' || cityForm.governorate_id === '') {
      toast.error('يرجى اختيار مدينة وإدخال اسمها');
      return;
    }
    
    updateCityMutation.mutate({
      id: cityForm.id,
      updates: {
        name: cityForm.name, 
        order_num: cityForm.order_num
      }
    });
  };
  
  // Delete city
  const handleDeleteCity = (cityId: string) => {
    deleteCityMutation.mutate(cityId);
  };
  
  // Add new employee
  const handleAddEmployee = () => {
    if (!employeeForm.name || !employeeForm.role || !employeeForm.phone) {
      toast.error('يرجى إدخال بيانات الموظف بالكامل');
      return;
    }
    
    createEmployeeMutation.mutate({
      name: employeeForm.name,
      role: employeeForm.role,
      phone: employeeForm.phone,
      commission_rates: employeeForm.commission_rates,
      active: employeeForm.active,
    });
  };
  
  // Update employee
  const handleUpdateEmployee = () => {
    if (!employeeForm.name || !employeeForm.role || !employeeForm.phone || employeeForm.id === '') {
      toast.error('يرجى إدخال بيانات الموظف بالكامل');
      return;
    }
    
    updateEmployeeMutation.mutate({
      id: employeeForm.id,
      updates: {
        name: employeeForm.name,
        role: employeeForm.role,
        phone: employeeForm.phone,
        commission_rates: employeeForm.commission_rates,
        active: employeeForm.active,
      }
    });
  };
  
  // Edit employee
  const handleEditEmployee = (employee: Employee) => {
    setEmployeeForm({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      commission_rates: { ...employee.commission_rates },
      active: employee.active,
    });
    setIsEditingEmployee(true);
  };
  
  // Delete employee
  const handleDeleteEmployee = (id: string) => {
    deleteEmployeeMutation.mutate(id);
  };
  
  // Toggle employee active status
  const handleToggleEmployeeStatus = (id: string, currentStatus: boolean) => {
    toggleEmployeeStatusMutation.mutate({ id, active: !currentStatus });
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
    if (!couponForm.code || couponForm.amount <= 0 || !couponForm.valid_until) {
      toast.error('يرجى إدخال بيانات الكوبون بالكامل');
      return;
    }
    
    // Check if code already exists
    if (coupons.some(c => c.code === couponForm.code)) {
      toast.error('كود الكوبون موجود بالفعل');
      return;
    }
    
    createCouponMutation.mutate({
      code: couponForm.code,
      amount: couponForm.amount,
      type: couponForm.type,
      valid_until: couponForm.valid_until,
      issued_to: couponForm.issued_to || null,
      client_id: couponForm.client_id || null,
      status: couponForm.status,
    });
  };
  
  // Delete coupon
  const handleDeleteCoupon = (id: string) => {
    deleteCouponMutation.mutate(id);
  };
  
  // Toggle coupon status
  const handleToggleCouponStatus = (id: string, currentStatus: string) => {
    toggleCouponStatusMutation.mutate({ 
      id, 
      status: currentStatus === 'active' ? 'inactive' : 'active' 
    });
  };
  
  // Save system settings
  const handleSaveSystemSettings = () => {
    const settingsToUpdate = [
      { key: 'company_name', value: systemSettings.company_name },
      { key: 'company_phone', value: systemSettings.company_phone },
      { key: 'company_address', value: systemSettings.company_address },
      { key: 'tax_rate', value: String(systemSettings.tax_rate) },
      { key: 'tax_enabled', value: String(systemSettings.tax_enabled) },
      { key: 'auto_notifications', value: String(systemSettings.auto_notifications) },
      { key: 'daily_backup', value: String(systemSettings.daily_backup) },
    ];
    
    updateSystemSettingsMutation.mutate(settingsToUpdate);
  };

  // Initialize coupon form with a generated code
  useEffect(() => {
    if (!couponForm.code) {
      setCouponForm({
        ...couponForm,
        code: generateCouponCode()
      });
    }
  }, [couponForm.code]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المحافظات</CardTitle>
                <CardDescription>إدارة المحافظات المتاحة في النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingGovernorates ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
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
                            value={governorateForm.order_num} 
                            onChange={(e) => setGovernorateForm({...governorateForm, order_num: Number(e.target.value)})} 
                            placeholder="رقم الترتيب"
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setGovernorateForm({ id: '', name: '', order_num: 0 });
                              setIsEditingGovernorate(false);
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button 
                            className="bg-bloom-primary hover:bg-bloom-primary/90" 
                            onClick={handleUpdateGovernorate}
                            disabled={updateGovernorateMutation.isPending}
                          >
                            {updateGovernorateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                            disabled={createGovernorateMutation.isPending}
                          >
                            {createGovernorateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                          {governorates.sort((a, b) => a.order_num - b.order_num).map((governorate) => (
                            <TableRow 
                              key={governorate.id} 
                              className={selectedGovernorate === governorate.id ? 'bg-muted/50' : ''}
                              onClick={() => handleSelectGovernorate(governorate.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <TableCell>{governorate.name}</TableCell>
                              <TableCell>{governorate.order_num}</TableCell>
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
                                    disabled={deleteGovernorateMutation.isPending}
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
                  </>
                )}
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
                        setCityForm({...cityForm, governorate_id: selectedGovernorate});
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
                {isLoadingGovernorates ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
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
                            value={cityForm.order_num || ''}
                            onChange={(e) => setCityForm({...cityForm, order_num: Number(e.target.value)})} 
                            placeholder="رقم الترتيب"
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setCityForm({ id: '', name: '', order_num: 0, governorate_id: '' });
                              setIsAddingCity(false);
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button 
                            className="bg-bloom-primary hover:bg-bloom-primary/90" 
                            onClick={handleAddCity}
                            disabled={createCityMutation.isPending}
                          >
                            {createCityMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                            value={cityForm.order_num} 
                            onChange={(e) => setCityForm({...cityForm, order_num: Number(e.target.value)})} 
                            placeholder="رقم الترتيب"
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setCityForm({ id: '', name: '', order_num: 0, governorate_id: '' });
                              setIsEditingCity(false);
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button 
                            className="bg-bloom-primary hover:bg-bloom-primary/90" 
                            onClick={handleUpdateCity}
                            disabled={updateCityMutation.isPending}
                          >
                            {updateCityMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                          {selectedGovernorate !== null && 
                            governorates.find(g => g.id === selectedGovernorate)?.cities
                              ?.sort((a, b) => a.order_num - b.order_num)
                              .map((city) => (
                                <TableRow key={city.id}>
                                  <TableCell>{city.name}</TableCell>
                                  <TableCell>{city.order_num}</TableCell>
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
                                        onClick={() => handleDeleteCity(city.id)}
                                        disabled={deleteCityMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                          ))}
                          {(selectedGovernorate === null || 
                            !governorates.find(g => g.id === selectedGovernorate)?.cities?.length) && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-6">
                                  {selectedGovernorate === null ? 'اختر محافظة لعرض المدن' : 'لا توجد مدن في هذه المحافظة'}
                                </TableCell>
                              </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
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
                        id: '',
                        name: '',
                        role: '',
                        phone: '',
                        commission_rates: {
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
              {isLoadingEmployees ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {(isEditingEmployee || employeeForm.id === '') && (
                    <div className="space-y-4 border rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-medium">{isEditingEmployee ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="commissionNewBookings">الحجوزات الجديدة</Label>
                            <Input 
                              id="commissionNewBookings" 
                              type="number" 
                              value={employeeForm.commission_rates.newBookings} 
                              onChange={(e) => setEmployeeForm({
                                ...employeeForm, 
                                commission_rates: {
                                  ...employeeForm.commission_rates,
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
                              value={employeeForm.commission_rates.additions} 
                              onChange={(e) => setEmployeeForm({
                                ...employeeForm, 
                                commission_rates: {
                                  ...employeeForm.commission_rates,
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
                              value={employeeForm.commission_rates.cleaning} 
                              onChange={(e) => setEmployeeForm({
                                ...employeeForm, 
                                commission_rates: {
                                  ...employeeForm.commission_rates,
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
                              value={employeeForm.commission_rates.outdoor} 
                              onChange={(e) => setEmployeeForm({
                                ...employeeForm, 
                                commission_rates: {
                                  ...employeeForm.commission_rates,
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
                              id: '',
                              name: '',
                              role: '',
                              phone: '',
                              commission_rates: {
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
                          disabled={isEditingEmployee ? updateEmployeeMutation.isPending : createEmployeeMutation.isPending}
                        >
                          {(isEditingEmployee ? updateEmployeeMutation.isPending : createEmployeeMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
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
                          <TableCell>{employee.commission_rates.newBookings}%</TableCell>
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
                                onClick={() => handleToggleEmployeeStatus(employee.id, employee.active)}
                                title={employee.active ? 'إيقاف' : 'تفعيل'}
                                disabled={toggleEmployeeStatusMutation.isPending}
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
                                disabled={deleteEmployeeMutation.isPending}
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
                </>
              )}
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
                      valid_until: new Date().toISOString().split('T')[0],
                      issued_to: '',
                      client_id: '',
                      status: 'active',
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
              {isLoadingCoupons ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {isAddingCoupon && (
                    <div className="space-y-4 border rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-medium">إضافة كوبون جديد</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            onValueChange={(value: 'fixed' | 'percentage') => setCouponForm({...couponForm, type: value})}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            value={couponForm.valid_until} 
                            onChange={(e) => setCouponForm({...couponForm, valid_until: e.target.value})} 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="couponIssuedTo">اسم العميل (اختياري)</Label>
                          <Input 
                            id="couponIssuedTo" 
                            value={couponForm.issued_to} 
                            onChange={(e) => setCouponForm({...couponForm, issued_to: e.target.value})} 
                            placeholder="اسم العميل"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="couponClientId">كود العميل (اختياري)</Label>
                          <Input 
                            id="couponClientId" 
                            value={couponForm.client_id} 
                            onChange={(e) => setCouponForm({...couponForm, client_id: e.target.value})} 
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
                              valid_until: new Date().toISOString().split('T')[0],
                              issued_to: '',
                              client_id: '',
                              status: 'active',
                            });
                            setIsAddingCoupon(false);
                          }}
                        >
                          إلغاء
                        </Button>
                        <Button 
                          className="bg-bloom-primary hover:bg-bloom-primary/90" 
                          onClick={handleAddCoupon}
                          disabled={createCouponMutation.isPending}
                        >
                          {createCouponMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                          <TableCell>{coupon.issued_to || '-'}</TableCell>
                          <TableCell>{new Date(coupon.valid_until).toLocaleDateString('ar-EG')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={coupon.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                              {coupon.status === 'active' ? 'فعال' : 'غير فعال'}
                            </Badge>
                          </TableCell>
                          <TableCell>{coupon.usage_count} مرات</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleToggleCouponStatus(coupon.id, coupon.status)}
                                title={coupon.status === 'active' ? 'إيقاف' : 'تفعيل'}
                                disabled={toggleCouponStatusMutation.isPending}
                              >
                                <Switch checked={coupon.status === 'active'} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                disabled={deleteCouponMutation.isPending}
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
                </>
              )}
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
              {isLoadingSettings ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">اسم الشركة</Label>
                      <Input 
                        id="companyName" 
                        value={systemSettings.company_name} 
                        onChange={(e) => setSystemSettings({...systemSettings, company_name: e.target.value})}
                        placeholder="اسم الشركة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">رقم الهاتف</Label>
                      <Input 
                        id="companyPhone" 
                        value={systemSettings.company_phone}
                        onChange={(e) => setSystemSettings({...systemSettings, company_phone: e.target.value})}
                        placeholder="رقم الهاتف"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">عنوان الشركة</Label>
                    <Input 
                      id="companyAddress" 
                      value={systemSettings.company_address}
                      onChange={(e) => setSystemSettings({...systemSettings, company_address: e.target.value})}
                      placeholder="عنوان الشركة"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tax">نسبة الضريبة (%)</Label>
                    <Input 
                      id="tax" 
                      type="number" 
                      value={systemSettings.tax_rate}
                      onChange={(e) => setSystemSettings({...systemSettings, tax_rate: parseFloat(e.target.value)})}
                      placeholder="نسبة الضريبة"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="taxEnabled" 
                      checked={systemSettings.tax_enabled}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, tax_enabled: checked})}
                    />
                    <Label htmlFor="taxEnabled">تفعيل الضريبة</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoNotifications" 
                      checked={systemSettings.auto_notifications}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, auto_notifications: checked})}
                    />
                    <Label htmlFor="autoNotifications">إرسال إشعارات تلقائية للعملاء</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="dailyBackup" 
                      checked={systemSettings.daily_backup}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, daily_backup: checked})}
                    />
                    <Label htmlFor="dailyBackup">نسخ احتياطي يومي للبيانات</Label>
                  </div>
                  
                  <Button 
                    className="bg-bloom-primary hover:bg-bloom-primary/90 mt-4"
                    onClick={handleSaveSystemSettings}
                    disabled={updateSystemSettingsMutation.isPending}
                  >
                    {updateSystemSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    حفظ الإعدادات
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
