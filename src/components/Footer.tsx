'use client';

import { useState, useEffect } from 'react';
import { checkN8NHealth } from '@/lib/actions';

export function Footer() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const performHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      const result = await checkN8NHealth();
      setIsOnline(result.isOnline);
      
      if (result.error) {
        console.error('N8N health check error:', result.error);
      }
    } catch (error) {
      console.error('Error performing N8N health check:', error);
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    performHealthCheck();

    // Set up interval to check every 30 seconds
    const interval = setInterval(performHealthCheck, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'bg-yellow-400';
    if (isOnline === null) return 'bg-gray-400';
    return isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (isChecking) return 'N8N Checking...';
    if (isOnline === null) return 'N8N Unknown';
    return isOnline ? 'N8N Online' : 'N8N Offline';
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full ${getStatusColor()} ${isChecking ? 'animate-pulse' : ''}`}
              title={`N8N Status: ${getStatusText()}`}
            />
            <span className="text-sm text-gray-600 font-medium">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
