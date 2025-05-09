
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, Order } from '@/services/OrderService';
import { toast } from '@/components/ui/sonner';
import OrderList from '@/components/orders/OrderList';
import OrderForm from '@/components/orders/OrderForm';

const OrdersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: OrderService.getOrders,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching orders:', error);
        toast.error('فشل في تحميل بيانات الطلبات');
      }
    }
  });
  
  // Create order mutation - Fix the return type to always be a string
  const createOrder = useMutation({
    mutationFn: async (orderData: any): Promise<string> => {
      if (selectedOrder) {
        const result = await OrderService.updateOrder(selectedOrder.id, orderData);
        // Convert boolean result to string
        return result ? selectedOrder.id : Promise.reject('Failed to update order');
      } else {
        const orderId = await OrderService.createOrder(orderData, []);
        if (!orderId) {
          return Promise.reject('Failed to create order');
        }
        return orderId;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(selectedOrder ? 'تم تحديث الطلب بنجاح' : 'تم إضافة الطلب بنجاح');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Error saving order:', error);
      toast.error('حدث خطأ أثناء حفظ الطلب');
    },
  });
  
  // Delete order mutation
  const deleteOrder = useMutation({
    mutationFn: (id: string) => OrderService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('تم حذف الطلب بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast.error('حدث خطأ أثناء حذف الطلب');
    },
  });
  
  // Filter orders based on search term and active tab
  const filteredOrders = orders 
    ? orders.filter(order => {
        const matchesSearch = 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.client?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        // For now, we're not filtering by type since we don't have that information directly
        // in the order object. In a real implementation, you might want to fetch order items
        // and filter based on their type.
        const matchesTab = activeTab === 'all';
        
        return matchesSearch && matchesTab;
      })
    : [];
  
  // Handle edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsAddOrderOpen(true);
  };
  
  // Handle delete order
  const handleDeleteOrder = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteOrder.mutate(id);
    }
  };
  
  // Handle save order
  const handleSaveOrder = (orderData: any) => {
    createOrder.mutate(orderData);
  };
  
  // Handle close dialog
  const handleCloseDialog = () => {
    setIsAddOrderOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">إدارة الطلبات</h1>
        <Dialog open={isAddOrderOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsAddOrderOpen(true);
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
            <OrderForm 
              selectedOrder={selectedOrder}
              onSave={handleSaveOrder}
              onCancel={handleCloseDialog}
            />
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
          <OrderList 
            orders={filteredOrders}
            isLoading={isLoading}
            onEdit={handleEditOrder}
            onDelete={handleDeleteOrder}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
