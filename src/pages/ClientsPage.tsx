
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
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for clients
const mockClients = [
  { 
    id: 'C1001', 
    name: 'سارة أحمد', 
    phone: '01012345678', 
    emergencyPhone: '01112345678', 
    governorate: 'الدقهلية', 
    city: 'المنصورة',
    source: 'فيسبوك',
    notes: 'عروس شهر يوليو',
  },
  { 
    id: 'C1002', 
    name: 'نور محمد', 
    phone: '01112345678', 
    emergencyPhone: '01212345678', 
    governorate: 'الغربية', 
    city: 'طنطا',
    source: 'إنستجرام',
    notes: 'تحتاج خدمة ميكب وفستان',
  },
  { 
    id: 'C1003', 
    name: 'فاطمة علي', 
    phone: '01212345678', 
    emergencyPhone: '01112345678', 
    governorate: 'القليوبية', 
    city: 'بنها',
    source: 'ترشيح من صديقة',
    notes: 'عروس حجاب كامل',
  },
];

// Egyptian governorates data
const governorates = [
  { id: 1, name: 'الدقهلية', cities: ['المنصورة', 'طلخا', 'ميت غمر', 'السنبلاوين'] },
  { id: 2, name: 'الغربية', cities: ['طنطا', 'المحلة الكبرى', 'زفتى', 'السنطة'] },
  { id: 3, name: 'القليوبية', cities: ['بنها', 'شبين القناطر', 'طوخ', 'قليوب'] },
  { id: 4, name: 'الشرقية', cities: ['الزقازيق', 'منيا القمح', 'بلبيس', 'أبو حماد'] },
];

const sourcesOptions = [
  'فيسبوك',
  'إنستجرام',
  'ترشيح من صديقة',
  'يوتيوب',
  'تيك توك',
  'جوجل',
  'أخرى'
];

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState(mockClients);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Form state for new client
  const [newClient, setNewClient] = useState({
    id: '',
    name: '',
    phone: '',
    emergencyPhone: '',
    governorate: '',
    city: '',
    source: '',
    notes: ''
  });
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.includes(searchTerm) ||
    client.phone.includes(searchTerm) ||
    client.id.includes(searchTerm)
  );
  
  // Handle governorate change
  const handleGovernorateChange = (value: string) => {
    setSelectedGovernorate(value);
    setNewClient({...newClient, governorate: value, city: ''});
    
    // Update available cities based on selected governorate
    const governorate = governorates.find(g => g.name === value);
    if (governorate) {
      setAvailableCities(governorate.cities);
    } else {
      setAvailableCities([]);
    }
  };
  
  // Handle city change
  const handleCityChange = (value: string) => {
    setNewClient({...newClient, city: value});
  };
  
  // Handle add new client
  const handleAddClient = () => {
    // Generate a new client ID
    const newId = `C${1000 + clients.length + 1}`;
    const clientToAdd = {...newClient, id: newId};
    
    setClients([...clients, clientToAdd]);
    setIsAddClientOpen(false);
    setNewClient({
      id: '',
      name: '',
      phone: '',
      emergencyPhone: '',
      governorate: '',
      city: '',
      source: '',
      notes: ''
    });
    setSelectedGovernorate('');
    setAvailableCities([]);
  };
  
  // Handle edit client
  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setNewClient(client);
    setSelectedGovernorate(client.governorate);
    
    // Update available cities based on selected governorate
    const governorate = governorates.find(g => g.name === client.governorate);
    if (governorate) {
      setAvailableCities(governorate.cities);
    }
    
    setIsAddClientOpen(true);
  };
  
  // Handle delete client
  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">إدارة العملاء</h1>
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
          <DialogTrigger asChild>
            <Button className="bg-bloom-primary hover:bg-bloom-primary/90">
              <Plus className="mr-2 h-4 w-4" /> إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedClient ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'}</DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل بالكامل ثم اضغط على حفظ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input 
                    id="name" 
                    value={newClient.name} 
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})} 
                    placeholder="الاسم بالكامل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input 
                    id="phone" 
                    value={newClient.phone} 
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})} 
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">رقم هاتف للطوارئ</Label>
                <Input 
                  id="emergencyPhone" 
                  value={newClient.emergencyPhone} 
                  onChange={(e) => setNewClient({...newClient, emergencyPhone: e.target.value})} 
                  placeholder="رقم بديل للتواصل"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governorate">المحافظة</Label>
                  <Select 
                    value={selectedGovernorate} 
                    onValueChange={handleGovernorateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {governorates.map((governorate) => (
                        <SelectItem key={governorate.id} value={governorate.name}>
                          {governorate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Select 
                    value={newClient.city} 
                    onValueChange={handleCityChange}
                    disabled={!selectedGovernorate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source">كيف عرفتنا؟</Label>
                <Select 
                  value={newClient.source} 
                  onValueChange={(value) => setNewClient({...newClient, source: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المصدر" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourcesOptions.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input 
                  id="notes" 
                  value={newClient.notes} 
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})} 
                  placeholder="أي ملاحظات إضافية"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>إلغاء</Button>
              <Button 
                className="bg-bloom-primary hover:bg-bloom-primary/90" 
                onClick={handleAddClient}
              >
                {selectedClient ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>
            عرض وإدارة جميع العملاء المسجلين
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="بحث عن عميل..." 
              className="pl-10 pr-4" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>كود</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>المحافظة</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>المصدر</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.governorate}</TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100">
                      {client.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClient(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    لا يوجد عملاء مطابقين لبحثك
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

export default ClientsPage;
