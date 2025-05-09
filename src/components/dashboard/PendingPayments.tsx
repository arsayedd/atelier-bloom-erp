
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Payment } from '@/services/DashboardService';

interface PendingPaymentsProps {
  payments: Payment[] | undefined;
  isLoading: boolean;
}

const PendingPayments: React.FC<PendingPaymentsProps> = ({ payments, isLoading }) => {
  return (
    <Card className="bloom-card">
      <CardHeader>
        <CardTitle className="bloom-heading">المدفوعات المعلقة</CardTitle>
        <CardDescription>المدفوعات التي تتطلب متابعة</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments && payments.length > 0 ? payments.map((payment) => (
              <div 
                key={payment.id} 
                className="flex items-center justify-between p-3 rounded-md bg-white border border-muted"
              >
                <div>
                  <p className="font-medium">{payment.order?.client?.full_name || 'عميل غير معروف'}</p>
                  <p className="text-sm text-muted-foreground">طلب #{payment.order_id.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-destructive">{payment.amount} جنيه</p>
                  <p className="text-xs text-muted-foreground">تاريخ الاستحقاق: {new Date(payment.payment_date).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد مدفوعات معلقة
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingPayments;
