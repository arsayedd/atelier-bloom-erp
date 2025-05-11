
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const WelcomeMessage: React.FC = () => {
  const { profile } = useAuth();
  const [visible, setVisible] = useState(true);
  
  // Auto-hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible || !profile) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-bloom-primary/20 to-bloom-secondary/10 border-bloom-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium text-bloom-primary">
                {'مرحباً بك, ' + (profile.full_name || 'مستخدم')}
              </h3>
              <p className="text-muted-foreground mt-1">
                نتمنى لك يوماً سعيداً وعملاً مثمراً
              </p>
            </div>
            <button 
              onClick={() => setVisible(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeMessage;
