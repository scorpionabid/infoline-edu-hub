
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { DataEntryStatus } from '@/types/dataEntry';

interface StatusIndicatorProps {
  status: DataEntryStatus;
  message?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, message }) => {
  switch (status) {
    case 'approved':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Təsdiqlənib
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message || 'Məlumat təsdiqlənib'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    
    case 'rejected':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Rədd edilib
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message || 'Məlumat rədd edilib'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    
    case 'draft':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Qaralama
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message || 'Qaralama olaraq saxlanılıb'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    
    case 'pending':
    default:
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                Gözləmədə
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message || 'Təsdiq gözlənilir'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
  }
};

interface SaveStatusIndicatorProps {
  status: 'saving' | 'saved' | 'error' | null;
  errorMessage?: string;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, errorMessage }) => {
  if (!status) return null;
  
  switch (status) {
    case 'saving':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="animate-spin h-3 w-3 mr-1" />
          Yadda saxlanılır...
        </Badge>
      );
    
    case 'saved':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Yadda saxlandı
        </Badge>
      );
    
    case 'error':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Xəta
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{errorMessage || 'Yadda saxlanarkən xəta baş verdi'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    
    default:
      return null;
  }
};
