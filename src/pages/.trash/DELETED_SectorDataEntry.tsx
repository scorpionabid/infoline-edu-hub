import React from 'react';
import { UnifiedSectorDataEntry } from '@/components/dataEntry/unified';
import { useNavigate } from 'react-router-dom';

/**
 * Yeni Sadə Sektor Data Entry Səhifəsi
 * 
 * Bu səhifə unified komponent istifadə edərək bütün sektoradmin data entry 
 * funksionallığını sadə və user-friendly interfeysdə təqdim edir.
 * 
 * Əsas xüsusiyyətlər:
 * - Smart category-based mode detection
 * - Single/bulk mode auto-switch
 * - Inline data entry (modal yoxdur)
 * - Progressive disclosure UX
 */
const SectorDataEntryPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Data entry tamamlandıqdan sonra dashboard-a qayıt
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <UnifiedSectorDataEntry />
        </div>
      </div>
    </div>
  );
};

export default SectorDataEntryPage;