
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Archive, Trash2, ArrowLeft } from 'lucide-react';
import { School } from '@/types/school';

export type DeleteType = 'soft' | 'hard';

interface DeleteSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onConfirm: (deleteType: DeleteType) => void;
  isSubmitting?: boolean;
}

export const DeleteSchoolDialog: React.FC<DeleteSchoolDialogProps> = ({
  isOpen,
  onClose,
  school,
  onConfirm,
  isSubmitting = false
}) => {
  const [selectedDeleteType, setSelectedDeleteType] = useState<DeleteType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteTypeSelect = (deleteType: DeleteType) => {
    setSelectedDeleteType(deleteType);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedDeleteType) {
      onConfirm(selectedDeleteType);
    }
  };

  const handleClose = () => {
    setSelectedDeleteType(null);
    setShowConfirmation(false);
    onClose();
  };

  const goBack = () => {
    setSelectedDeleteType(null);
    setShowConfirmation(false);
  };

  if (showConfirmation && selectedDeleteType) {
    return (
      <AlertDialog open={isOpen} onOpenChange={handleClose}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="flex items-center gap-3 text-lg">
              <div className={`p-2 rounded-full ${
                selectedDeleteType === 'soft' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {selectedDeleteType === 'soft' ? (
                  <Archive className="h-5 w-5" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </div>
              <span>
                {selectedDeleteType === 'soft' ? 'Məktəbi deaktiv et' : 'Məktəbi tam sil'}
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              <div className="mb-4">
                <span className="font-medium text-gray-900">"{school.name}"</span> məktəbini{' '}
                <span className={selectedDeleteType === 'soft' ? 'text-orange-600' : 'text-red-600'}>
                  {selectedDeleteType === 'soft' ? 'deaktiv etmək' : 'tamamilə silmək'}
                </span>{' '}
                istədiyinizə əminsiniz?
              </div>
              
              <div className={`p-4 rounded-lg border-l-4 ${
                selectedDeleteType === 'soft'
                  ? 'bg-orange-50 border-orange-400'
                  : 'bg-red-50 border-red-400'
              }`}>
                <div className={`font-semibold mb-2 ${
                  selectedDeleteType === 'soft' ? 'text-orange-800' : 'text-red-800'
                }`}>
                  {selectedDeleteType === 'soft' ? 'Deaktiv etmə nəticələri:' : 'Tam silmə nəticələri:'}
                </div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {selectedDeleteType === 'soft' ? (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Məktəb statusu "deaktiv" olacaq</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Məktəb siyahıda görünməyəcək</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Bütün məlumatlar saxlanılacaq</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-green-700 font-medium">İstənilən vaxt aktivləşdirilə bilər</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Məktəb verilənlər bazasından silinəcək</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Bütün əlaqəli məlumatlar silinəcək</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Məktəb adminləri də silinəcək</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-red-700 font-semibold">Bu əməliyyat geri qaytarıla bilməz</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex gap-2 pt-6">
            <Button 
              variant="outline" 
              onClick={goBack} 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri qayıt
            </Button>
            <AlertDialogCancel 
              onClick={handleClose} 
              disabled={isSubmitting}
              className="min-w-[80px]"
            >
              Ləğv et
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`min-w-[120px] ${
                selectedDeleteType === 'soft' 
                  ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-600' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedDeleteType === 'soft' ? 'Deaktiv edilir...' : 'Silinir...'}
                </>
              ) : (
                <>
                  {selectedDeleteType === 'soft' ? (
                    <><Archive className="mr-2 h-4 w-4" />Deaktiv et</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" />Tam sil</>
                  )}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader className="space-y-4">
          <AlertDialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <span>Məktəbi sil</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            <span className="font-medium text-gray-900">"{school.name}"</span> məktəbini necə silmək istəyirsiniz?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-6">
          {/* Soft Delete Option */}
          <Button
            variant="outline"
            className="w-full h-auto p-6 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
            onClick={() => handleDeleteTypeSelect('soft')}
            disabled={isSubmitting}
          >
            <div className="flex items-start gap-4 w-full">
              <div className="p-2 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
                <Archive className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-orange-700 text-lg mb-1">
                  Deaktiv et
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Tövsiyə edilir
                  </span>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Məktəb gizlədiləcək, amma bütün məlumatlar saxlanılacaq. İstənilən vaxt geri qaytarıla bilər.
                </div>
              </div>
            </div>
          </Button>

          {/* Hard Delete Option */}
          <Button
            variant="outline"
            className="w-full h-auto p-6 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
            onClick={() => handleDeleteTypeSelect('hard')}
            disabled={isSubmitting}
          >
            <div className="flex items-start gap-4 w-full">
              <div className="p-2 rounded-full bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-red-700 text-lg mb-1">
                  Tam sil
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    Təhlükəli
                  </span>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Məktəb və bütün əlaqəli məlumatlar tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.
                </div>
              </div>
            </div>
          </Button>
        </div>
        
        <AlertDialogFooter className="pt-6">
          <AlertDialogCancel 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            Ləğv et
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

