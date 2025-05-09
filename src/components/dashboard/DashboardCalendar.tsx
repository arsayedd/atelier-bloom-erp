
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const DashboardCalendar: React.FC<DashboardCalendarProps> = ({ date, setDate }) => {
  return (
    <Card className="bloom-card">
      <CardHeader>
        <CardTitle className="bloom-heading">التقويم</CardTitle>
        <CardDescription>استعراض وإدارة المواعيد</CardDescription>
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
  );
};

export default DashboardCalendar;
