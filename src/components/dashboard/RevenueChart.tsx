
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueData } from '@/services/DashboardService';

interface RevenueChartProps {
  data: RevenueData[] | undefined;
  isLoading: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  return (
    <Card className="bloom-card md:col-span-2">
      <CardHeader>
        <CardTitle className="bloom-heading">نظرة عامة على الإيرادات</CardTitle>
        <CardDescription>الإيرادات الشهرية للسنة الحالية</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : (
            data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      border: '1px solid #e2b8ff' 
                    }}
                    formatter={(value) => [`${value} جنيه`, 'الإيرادات']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#9b55d3" 
                    radius={[4, 4, 0, 0]}
                    name="الإيرادات (جنيه)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>لا توجد إيرادات مسجلة للعرض</p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
