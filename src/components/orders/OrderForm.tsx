
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Order } from '@/services/OrderService';
import { orderCategories } from '@/services/OrderService';
import { ClientService } from '@/services/ClientService';
import { toast } from '@/components/ui/sonner';
import { InventoryService } from '@/services/InventoryService';

interface Client {
  id: string;
  full_name: string;
}

interface OrderFormProps {
  selectedOrder: Order | null;
  onSave: (order: any) => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ selectedOrder, onSave, onCancel }) => {
  // Form state for new order
  const [formData, setFormData] = useState({
    id: '',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    subtype: '',
    specifics: '',
    status: 'pending',
    price: 0,
    paidAmount: 0,
    remainingAmount: 0,
    notes: '',
    discountCode: '',
  });
  
  // State for dynamic options
  const [availableSubtypes, setAvailableSubtypes] = useState<any[]>([]);
  const [availableSpecifics, setAvailableSpecifics] = useState<any[]>([]);

  // Fetch real clients from the database
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery({
    queryKey: ['clients'],
    queryFn: ClientService.getClients,
    meta: {
      onError: (error: any) => {
        console.error('Failed to fetch clients:', error);
        toast.error('فشل في تحميل بيانات العملاء');
      }
    }
  });
  
  // Fetch available dresses for atelier orders
  const { data: dresses, isLoading: isLoadingDresses } = useQuery({
    queryKey: ['available-dresses'],
    queryFn: () => InventoryService.getDresses(true),
    enabled: formData.type === 'atelier',
    meta: {
      onError: () => {
        toast.error('فشل في تحميل بيانات الفساتين');
      }
    }
  });

  // Effect to initialize form when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      // Convert from API model to form model
      setFormData({
        id: selectedOrder.id,
        clientId: selectedOrder.client_id,
        date: new Date(selectedOrder.order_date).toISOString().split('T')[0],
        type: '', // Would need to get from order items
        subtype: '',
        specifics: '',
        status: selectedOrder.status,
        price: parseFloat(String(selectedOrder.total_amount)),
        paidAmount: parseFloat(String(selectedOrder.paid_amount)),
        remainingAmount: parseFloat(String(selectedOrder.total_amount)) - parseFloat(String(selectedOrder.paid_amount)),
        notes: selectedOrder.notes || '',
        discountCode: '',
      });
    } else {
      resetForm();
    }
  }, [selectedOrder]);

  // Handle type change
  const handleTypeChange = (value: string) => {
    setFormData({...formData, type: value, subtype: '', specifics: ''});
    
    // Update available subtypes
    const categoryTypes = Object.keys(orderCategories).includes(value) 
      ? orderCategories[value as keyof typeof orderCategories].types.map(type => ({
          value: type.id,
          label: type.name
        }))
      : [];
    
    setAvailableSubtypes(categoryTypes);
    setAvailableSpecifics([]);
  };
  
  // Handle subtype change
  const handleSubtypeChange = (value: string) => {
    setFormData({...formData, subtype: value, specifics: ''});
    
    // For atelier orders, set available dresses as specifics
    if (formData.type === 'atelier' && dresses) {
      // Filter dresses based on subtype (wedding, engagement, etc.)
      const dressCategory = value.split('_')[0]; // Get the first part, e.g., "wedding" from "wedding_rent"
      
      const filteredDresses = dresses.filter(dress => dress.category === dressCategory);
      
      const dressOptions = filteredDresses.map(dress => ({
        value: dress.id,
        label: `${dress.name} - ${dress.size || 'بدون مقاس'} - ${dress.color || 'بدون لون'}`
      }));
      
      setAvailableSpecifics(dressOptions);
    } else {
      // For other orders, specifics might be predefined or empty
      setAvailableSpecifics([]);
    }
  };
  
  // Handle client change
  const handleClientChange = (value: string) => {
    setFormData({
      ...formData, 
      clientId: value
    });
  };
  
  // Handle paid amount change
  const handlePaidAmountChange = (value: string) => {
    const paidAmount = Number(value) || 0;
    const remainingAmount = formData.price - paidAmount;
    setFormData({...formData, paidAmount, remainingAmount});
  };
  
  // Handle price change
  const handlePriceChange = (value: string) => {
    const price = Number(value) || 0;
    const remainingAmount = price - formData.paidAmount;
    setFormData({...formData, price, remainingAmount});
  };

  // Handle discount code
  const handleDiscountCodeChange = (value: string) => {
    setFormData({...formData, discountCode: value});
    // In a real implementation, you would validate the discount code and apply it
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Convert from form model to API model
    const orderData = {
      client_id: formData.clientId,
      order_date: formData.date,
      total_amount: formData.price,
      paid_amount: formData.paidAmount,
      status: formData.status,
      notes: formData.notes,
    };
    
    onSave(orderData);
  };
  
  // Reset the form
  const resetForm = () => {
    setFormData({
      id: '',
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      type: '',
      subtype: '',
      specifics: '',
      status: 'pending',
      price: 0,
      paidAmount: 0,
      remainingAmount: 0,
      notes: '',
      discountCode: '',
    });
    setAvailableSubtypes([]);
    setAvailableSpecifics([]);
  };

  if (clientsError) {
    console.error('Error loading clients:', clientsError);
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="client">العميل</Label>
        <Select 
          value={formData.clientId} 
          onValueChange={handleClientChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر العميل" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingClients ? (
              <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
            ) : clients && clients.length > 0 ? (
              clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-clients" disabled>لا يوجد عملاء</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">التاريخ</Label>
        <Input 
          id="date" 
          type="date" 
          value={formData.date} 
          onChange={(e) => setFormData({...formData, date: e.target.value})} 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">نوع الخدمة</Label>
          <Select 
            value={formData.type} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(orderCategories).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subtype">التصنيف</Label>
          <Select 
            value={formData.subtype} 
            onValueChange={handleSubtypeChange}
            disabled={!formData.type}
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
            value={formData.specifics} 
            onValueChange={(value) => setFormData({...formData, specifics: value})}
            disabled={!formData.subtype || availableSpecifics.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر التفاصيل" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingDresses && formData.type === 'atelier' ? (
                <SelectItem value="loading" disabled>جاري تحميل الفساتين...</SelectItem>
              ) : availableSpecifics.length > 0 ? (
                availableSpecifics.map((specific) => (
                  <SelectItem key={specific.value} value={specific.value}>
                    {specific.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-specifics" disabled>لا توجد خيارات متاحة</SelectItem>
              )}
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
            value={formData.price} 
            onChange={(e) => handlePriceChange(e.target.value)} 
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paidAmount">المدفوع</Label>
          <Input 
            id="paidAmount" 
            type="number" 
            value={formData.paidAmount} 
            onChange={(e) => handlePaidAmountChange(e.target.value)} 
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="remainingAmount">المتبقي</Label>
          <Input 
            id="remainingAmount" 
            type="number" 
            value={formData.remainingAmount} 
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="discountCode">كود خصم</Label>
        <Input 
          id="discountCode" 
          value={formData.discountCode} 
          onChange={(e) => handleDiscountCodeChange(e.target.value)} 
          placeholder="أدخل كود الخصم إن وجد"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">الحالة</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData({...formData, status: value})}
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
        <Textarea 
          id="notes" 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
          placeholder="أي ملاحظات إضافية"
        />
      </div>
      
      <div className="flex justify-end space-x-4 rtl:space-x-reverse">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button 
          className="bg-bloom-primary hover:bg-bloom-primary/90" 
          onClick={handleSubmit}
          disabled={!formData.clientId}
        >
          {formData.id ? 'تحديث' : 'إضافة'}
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;
