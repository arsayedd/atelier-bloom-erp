
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ClientService, Client } from '@/services/ClientService';
import { X, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Interface for the enhanced client
interface EnhancedClient extends Client {
  emergency_phone?: string;
  governorate?: string;
  city?: string;
  country?: string;
  reference_source?: string;
  client_code?: string;
}

// Simple function to generate a client code
const generateClientCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `C${timestamp}${random}`;
};

const ClientsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<EnhancedClient | null>(null);
  const [newClient, setNewClient] = useState<Omit<EnhancedClient, 'id' | 'created_at' | 'updated_at'>>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    emergency_phone: '',
    governorate: '',
    city: '',
    country: 'مصر',
    reference_source: '',
    notes: '',
    client_code: generateClientCode(),
  });

  const queryClient = useQueryClient();

  // Get clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => ClientService.getClients(),
  });

  // Create client
  const createMutation = useMutation({
    mutationFn: (client: Omit<EnhancedClient, 'id' | 'created_at' | 'updated_at'>) => 
      ClientService.createClient(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsAddModalOpen(false);
      resetNewClient();
      toast.success('تم إضافة العميل بنجاح');
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast.error('فشل إضافة العميل');
    }
  });

  // Update client
  const updateMutation = useMutation({
    mutationFn: ({ id, client }: { id: string; client: Partial<EnhancedClient> }) => 
      ClientService.updateClient(id, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsEditModalOpen(false);
      setCurrentClient(null);
      toast.success('تم تحديث بيانات العميل بنجاح');
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast.error('فشل تحديث بيانات العميل');
    }
  });

  // Delete client
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ClientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast.error('فشل حذف العميل');
    }
  });

  const handleCreateClient = () => {
    createMutation.mutate(newClient);
  };

  const handleUpdateClient = () => {
    if (currentClient) {
      updateMutation.mutate({
        id: currentClient.id,
        client: {
          full_name: currentClient.full_name,
          phone: currentClient.phone,
          email: currentClient.email,
          address: currentClient.address,
          emergency_phone: currentClient.emergency_phone,
          governorate: currentClient.governorate,
          city: currentClient.city,
          country: currentClient.country,
          reference_source: currentClient.reference_source,
          notes: currentClient.notes,
          client_code: currentClient.client_code,
        },
      });
    }
  };

  const handleDeleteClient = (id: string) => {
    deleteMutation.mutate(id);
  };

  const resetNewClient = () => {
    setNewClient({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      emergency_phone: '',
      governorate: '',
      city: '',
      country: 'مصر',
      reference_source: '',
      notes: '',
      client_code: generateClientCode(),
    });
  };

  const handleEditClick = (client: Client) => {
    setCurrentClient(client as EnhancedClient);
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentClient((prev) => 
      prev ? { ...prev, [name]: value } : null
    );
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setCurrentClient((prev) => 
      prev ? { ...prev, [name]: value } : null
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">العملاء</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-bloom-primary hover:bg-bloom-primary/80">
              <Plus className="mr-2 h-4 w-4" /> إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_code">كود العميل</Label>
                  <Input
                    id="client_code"
                    name="client_code"
                    value={newClient.client_code}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={newClient.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newClient.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_phone">رقم طوارئ</Label>
                  <Input
                    id="emergency_phone"
                    name="emergency_phone"
                    value={newClient.emergency_phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newClient.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="country">الدولة</Label>
                  <Select 
                    value={newClient.country || 'مصر'} 
                    onValueChange={(value) => handleSelectChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدولة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مصر">مصر</SelectItem>
                      <SelectItem value="السعودية">السعودية</SelectItem>
                      <SelectItem value="الإمارات">الإمارات</SelectItem>
                      <SelectItem value="الكويت">الكويت</SelectItem>
                      <SelectItem value="قطر">قطر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="governorate">المحافظة</Label>
                  <Input
                    id="governorate"
                    name="governorate"
                    value={newClient.governorate || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    name="city"
                    value={newClient.city || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">العنوان التفصيلي</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newClient.address || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="reference_source">كيف تعرفت علينا؟</Label>
                  <Select 
                    value={newClient.reference_source || ''} 
                    onValueChange={(value) => handleSelectChange('reference_source', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المصدر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">فيسبوك</SelectItem>
                      <SelectItem value="instagram">انستجرام</SelectItem>
                      <SelectItem value="friend">صديق</SelectItem>
                      <SelectItem value="google">جوجل</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newClient.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                إلغاء
              </Button>
              <Button className="bg-bloom-primary hover:bg-bloom-primary/80" onClick={handleCreateClient}>
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center p-10">جاري التحميل...</div>
      ) : clients?.length === 0 ? (
        <div className="text-center p-10">لا يوجد عملاء</div>
      ) : (
        <Table>
          <TableCaption>قائمة بجميع العملاء المسجلين</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>كود العميل</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>المحافظة</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{(client as EnhancedClient).client_code || 'C-000'}</TableCell>
                <TableCell className="font-medium">{client.full_name}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{(client as EnhancedClient).governorate || '-'}</TableCell>
                <TableCell>{(client as EnhancedClient).city || '-'}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell className="text-right flex justify-end space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(client)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف بيانات العميل نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Client Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات العميل</DialogTitle>
            <DialogDescription>
              قم بتحديث بيانات العميل
            </DialogDescription>
          </DialogHeader>
          {currentClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_client_code">كود العميل</Label>
                  <Input
                    id="edit_client_code"
                    name="client_code"
                    value={currentClient.client_code || ''}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_full_name">الاسم الكامل</Label>
                  <Input
                    id="edit_full_name"
                    name="full_name"
                    value={currentClient.full_name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_phone">رقم الهاتف</Label>
                  <Input
                    id="edit_phone"
                    name="phone"
                    value={currentClient.phone}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_emergency_phone">رقم طوارئ</Label>
                  <Input
                    id="edit_emergency_phone"
                    name="emergency_phone"
                    value={currentClient.emergency_phone || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">البريد الإلكتروني</Label>
                  <Input
                    id="edit_email"
                    name="email"
                    type="email"
                    value={currentClient.email || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_country">الدولة</Label>
                  <Select 
                    value={currentClient.country || 'مصر'} 
                    onValueChange={(value) => handleEditSelectChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدولة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مصر">مصر</SelectItem>
                      <SelectItem value="السعودية">السعودية</SelectItem>
                      <SelectItem value="الإمارات">الإمارات</SelectItem>
                      <SelectItem value="الكويت">الكويت</SelectItem>
                      <SelectItem value="قطر">قطر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_governorate">المحافظة</Label>
                  <Input
                    id="edit_governorate"
                    name="governorate"
                    value={currentClient.governorate || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_city">المدينة</Label>
                  <Input
                    id="edit_city"
                    name="city"
                    value={currentClient.city || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit_address">العنوان التفصيلي</Label>
                  <Input
                    id="edit_address"
                    name="address"
                    value={currentClient.address || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit_reference_source">كيف تعرفت علينا؟</Label>
                  <Select 
                    value={currentClient.reference_source || ''} 
                    onValueChange={(value) => handleEditSelectChange('reference_source', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المصدر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">فيسبوك</SelectItem>
                      <SelectItem value="instagram">انستجرام</SelectItem>
                      <SelectItem value="friend">صديق</SelectItem>
                      <SelectItem value="google">جوجل</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit_notes">ملاحظات</Label>
                  <Textarea
                    id="edit_notes"
                    name="notes"
                    value={currentClient.notes || ''}
                    onChange={handleEditChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-bloom-primary hover:bg-bloom-primary/80" onClick={handleUpdateClient}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
