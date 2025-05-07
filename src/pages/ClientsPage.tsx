
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

const ClientsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  // Get clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => ClientService.getClients(),
  });

  // Create client
  const createMutation = useMutation({
    mutationFn: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => 
      ClientService.createClient(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsAddModalOpen(false);
      resetNewClient();
    },
  });

  // Update client
  const updateMutation = useMutation({
    mutationFn: ({ id, client }: { id: string; client: Partial<Client> }) => 
      ClientService.updateClient(id, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsEditModalOpen(false);
      setCurrentClient(null);
    },
  });

  // Delete client
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ClientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
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
          notes: currentClient.notes,
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
      notes: '',
    });
  };

  const handleEditClick = (client: Client) => {
    setCurrentClient(client);
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  الاسم الكامل
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={newClient.full_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newClient.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newClient.email || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  العنوان
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={newClient.address || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  ملاحظات
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={newClient.notes || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
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
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>ملاحظات</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.full_name}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>{client.address || '-'}</TableCell>
                <TableCell>{client.notes || '-'}</TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات العميل</DialogTitle>
            <DialogDescription>
              قم بتحديث بيانات العميل
            </DialogDescription>
          </DialogHeader>
          {currentClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_full_name" className="text-right">
                  الاسم الكامل
                </Label>
                <Input
                  id="edit_full_name"
                  name="full_name"
                  value={currentClient.full_name}
                  onChange={handleEditChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_phone" className="text-right">
                  رقم الهاتف
                </Label>
                <Input
                  id="edit_phone"
                  name="phone"
                  value={currentClient.phone}
                  onChange={handleEditChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_email" className="text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  value={currentClient.email || ''}
                  onChange={handleEditChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_address" className="text-right">
                  العنوان
                </Label>
                <Input
                  id="edit_address"
                  name="address"
                  value={currentClient.address || ''}
                  onChange={handleEditChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_notes" className="text-right">
                  ملاحظات
                </Label>
                <Input
                  id="edit_notes"
                  name="notes"
                  value={currentClient.notes || ''}
                  onChange={handleEditChange}
                  className="col-span-3"
                />
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
