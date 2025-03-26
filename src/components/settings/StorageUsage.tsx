
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export const StorageUsage: React.FC = () => {
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 5000, // 5MB in KB as an example
    percentage: 0
  });

  useEffect(() => {
    // Calculate localStorage usage (simplified version)
    const calculateStorageUsage = () => {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        const value = localStorage.getItem(key) || '';
        total += key.length + value.length;
      }
      
      // Convert to KB
      const usedKB = Math.round(total / 1024);
      const totalKB = 5000; // Assuming 5MB limit
      const percentage = Math.round((usedKB / totalKB) * 100);
      
      setStorageUsage({
        used: usedKB,
        total: totalKB,
        percentage: percentage
      });
    };
    
    calculateStorageUsage();
  }, []);

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-medium">Uso de almacenamiento</h3>
        <p className="text-sm text-muted-foreground">
          {storageUsage.used} KB de {storageUsage.total} KB ({storageUsage.percentage}%)
        </p>
      </div>
      <Progress value={storageUsage.percentage} className="h-2" />
    </div>
  );
};
