
import React, { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock appointment data
const appointments = [
  { 
    id: 1, 
    client: 'Sara Ahmed', 
    date: new Date(2023, 4, 15), 
    time: '10:00 AM', 
    service: 'Bridal Makeup', 
    status: 'confirmed',
    type: 'makeup'
  },
  { 
    id: 2, 
    client: 'Nour Mohamed', 
    date: new Date(2023, 4, 15), 
    time: '12:30 PM', 
    service: 'Evening Gown Fitting', 
    status: 'confirmed',
    type: 'atelier'
  },
  { 
    id: 3, 
    client: 'Fatima Ali', 
    date: new Date(2023, 4, 16), 
    time: '3:00 PM', 
    service: 'Skin Treatment', 
    status: 'pending',
    type: 'skincare'
  },
  { 
    id: 4, 
    client: 'Layla Hassan', 
    date: new Date(2023, 4, 17), 
    time: '11:00 AM', 
    service: 'Wedding Dress Fitting', 
    status: 'confirmed',
    type: 'atelier'
  },
  { 
    id: 5, 
    client: 'Mona Karim', 
    date: new Date(2023, 4, 18), 
    time: '2:30 PM', 
    service: 'Bridal Package', 
    status: 'confirmed',
    type: 'makeup'
  },
];

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  
  // Filter appointments for the selected date or week
  const filteredAppointments = appointments.filter(appointment => {
    if (view === 'day' && selectedDate) {
      return appointment.date.toDateString() === selectedDate.toDateString();
    } else if (view === 'week' && selectedDate) {
      const weekStart = subDays(selectedDate, selectedDate.getDay());
      const weekEnd = addDays(weekStart, 6);
      return appointment.date >= weekStart && appointment.date <= weekEnd;
    }
    return false;
  });
  
  // Group appointments by date for week view
  const appointmentsByDate = filteredAppointments.reduce((acc, appointment) => {
    const dateString = appointment.date.toDateString();
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    acc[dateString].push(appointment);
    return acc;
  }, {} as Record<string, typeof appointments>);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Appointments Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="bloom-heading">Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
                className={view === 'day' ? 'bg-bloom-primary' : ''}
              >
                Day View
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
                className={view === 'week' ? 'bg-bloom-primary' : ''}
              >
                Week View
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
          <Card className="bloom-card h-full">
            <CardHeader>
              <CardTitle className="bloom-heading">
                {view === 'day' && selectedDate
                  ? `Appointments for ${format(selectedDate, 'PPPP')}`
                  : 'Weekly Appointments'}
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {view === 'day' ? (
                filteredAppointments.length > 0 ? (
                  <div className="space-y-4">
                    <Tabs defaultValue="all">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="makeup">Makeup</TabsTrigger>
                        <TabsTrigger value="skincare">Skincare</TabsTrigger>
                        <TabsTrigger value="atelier">Atelier</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-4 space-y-4">
                        {filteredAppointments.map((appointment) => (
                          <AppointmentCard key={appointment.id} appointment={appointment} />
                        ))}
                      </TabsContent>
                      <TabsContent value="makeup" className="mt-4 space-y-4">
                        {filteredAppointments
                          .filter(a => a.type === 'makeup')
                          .map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} />
                          ))}
                      </TabsContent>
                      <TabsContent value="skincare" className="mt-4 space-y-4">
                        {filteredAppointments
                          .filter(a => a.type === 'skincare')
                          .map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} />
                          ))}
                      </TabsContent>
                      <TabsContent value="atelier" className="mt-4 space-y-4">
                        {filteredAppointments
                          .filter(a => a.type === 'atelier')
                          .map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} />
                          ))}
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No appointments scheduled for this date
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  {Object.entries(appointmentsByDate).map(([dateString, dateAppointments]) => (
                    <div key={dateString} className="space-y-4">
                      <h3 className="text-lg font-medium">
                        {format(new Date(dateString), 'EEEE, MMMM d')}
                      </h3>
                      {dateAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  ))}
                  {Object.keys(appointmentsByDate).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No appointments scheduled for this week
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface Appointment {
  id: number;
  client: string;
  date: Date;
  time: string;
  service: string;
  status: string;
  type: string;
}

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const getTypeColor = () => {
    switch (appointment.type) {
      case 'makeup': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'skincare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'atelier': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 rounded-md bg-white border border-muted">
      <div>
        <p className="font-medium">{appointment.client}</p>
        <div className="flex items-center mt-1 space-x-2">
          <Badge variant="outline" className={getTypeColor()}>
            {appointment.type}
          </Badge>
          <span className="text-sm text-muted-foreground">{appointment.service}</span>
        </div>
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
  );
};

export default CalendarPage;
