
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

// Mock data for dashboard
const salesData = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 900 },
  { name: 'Mar', total: 1500 },
  { name: 'Apr', total: 1800 },
  { name: 'May', total: 1600 },
  { name: 'Jun', total: 2100 },
  { name: 'Jul', total: 1700 },
];

const todaysAppointments = [
  { id: 1, client: 'Sara Ahmed', time: '10:00 AM', service: 'Bridal Makeup', status: 'confirmed' },
  { id: 2, client: 'Nour Mohamed', time: '12:30 PM', service: 'Evening Gown Fitting', status: 'confirmed' },
  { id: 3, client: 'Fatima Ali', time: '3:00 PM', service: 'Skin Treatment', status: 'pending' },
];

const pendingPayments = [
  { id: 1, client: 'Layla Hassan', amount: 2500, service: 'Wedding Dress Rental', dueDate: '2023-05-20' },
  { id: 2, client: 'Mona Karim', amount: 1800, service: 'Bridal Package', dueDate: '2023-05-18' },
];

const Dashboard = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <Badge variant="outline" className="bg-bloom-primary text-white text-sm px-3 py-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bloom-card md:col-span-2">
          <CardHeader>
            <CardTitle className="bloom-heading">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      border: '1px solid #e2b8ff' 
                    }} 
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#9b55d3" 
                    radius={[4, 4, 0, 0]}
                    name="Revenue (EGP)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="bloom-heading">Calendar</CardTitle>
            <CardDescription>Browse and manage appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="bloom-heading">Today's Appointments</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-3 rounded-md bg-white border border-muted"
                >
                  <div>
                    <p className="font-medium">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.time}</p>
                    <Badge 
                      variant="outline" 
                      className={`${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {todaysAppointments.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No appointments for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="bloom-heading">Pending Payments</CardTitle>
            <CardDescription>Payments requiring follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 rounded-md bg-white border border-muted"
                >
                  <div>
                    <p className="font-medium">{payment.client}</p>
                    <p className="text-sm text-muted-foreground">{payment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-destructive">{payment.amount} EGP</p>
                    <p className="text-xs text-muted-foreground">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {pendingPayments.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No pending payments
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
