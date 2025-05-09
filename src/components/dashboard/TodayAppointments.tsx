
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { Appointment } from '@/services/DashboardService';

interface TodayAppointmentsProps {
  appointments: Appointment[] | undefined;
  isLoading: boolean;
}

const TodayAppointments: React.FC<TodayAppointmentsProps> = ({ appointments, isLoading }) => {
  return (
    <Card className="bloom-card">
      <CardHeader>
        <CardTitle className="bloom-heading">مواعيد اليوم</CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments && appointments.length > 0 ? appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex items-center justify-between p-3 rounded-md bg-white border border-muted"
              >
                <div>
                  <p className="font-medium">{appointment.client?.full_name || 'عميل غير معروف'}</p>
                  <p className="text-sm text-muted-foreground">{appointment.notes || 'موعد'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{new Date(appointment.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                  <Badge 
                    variant="outline" 
                    className={`${
                      appointment.status === 'confirmed' || appointment.status === 'scheduled'
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {appointment.status === 'confirmed' ? 'مؤكد' : 
                     appointment.status === 'scheduled' ? 'مجدول' : 
                     appointment.status === 'pending' ? 'معلق' : appointment.status}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد مواعيد لليوم
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
