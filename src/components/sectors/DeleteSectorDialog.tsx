import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EnhancedSector } from "@/types/sector";
import { useTranslation } from "@/contexts/TranslationContext";
import { Loader2, AlertTriangle, School, User, Database } from "lucide-react";
import useDeleteSector from "@/hooks/sectors/useDeleteSector";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DeleteSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete?: boolean) => void;
  sector: EnhancedSector;
  isSubmitting?: boolean;
}

const DeleteSectorDialog: React.FC<DeleteSectorDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sector,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const { checkDependencies, checkingDependencies } = useDeleteSector();
  const [dependencies, setDependencies] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sector dəyişdikdə dependency yoxlaması et
  useEffect(() => {
    if (isOpen && sector?.id) {
      const loadDependencies = async () => {
        try {
          const deps = await checkDependencies(sector.id);
          setDependencies(deps);
          
          // Əgər dependency varsa, detailləri göstər
          if (deps.schoolCount > 0 || deps.adminCount > 0 || deps.dataEntries > 0) {
            setShowDetails(true);
          }
        } catch (error) {
          console.error('Dependency yoxlama xətası:', error);
        }
      };
      
      loadDependencies();
    }
  }, [isOpen, sector?.id, checkDependencies]);

  const hasDependencies = dependencies && 
    (dependencies.schoolCount > 0 || dependencies.adminCount > 0 || dependencies.dataEntries > 0);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <span className="truncate">{t("sectors.deleteSector")}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <div>
              {t("sectors.deleteSectorConfirmation")}
              {sector && (
                <span className="font-semibold block mt-1 text-foreground text-sm break-words">
                  {sector.name}
                </span>
              )}
            </div>
            
            {checkingDependencies && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                <span className="text-sm">Təbəli məlumatlar yoxlanılır...</span>
              </div>
            )}
            
            {dependencies && hasDependencies && (
              <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm">DİQQƏT</span>
                </div>
                
                <div className="space-y-2 text-amber-700">
                  <p className="text-xs leading-relaxed">
                    Bu sektor deaktiv edilsə aşağıdakı təsirlər olacaq:
                  </p>
                  
                  <div className="space-y-2">
                    {dependencies.schoolCount > 0 && (
                      <div className="flex items-center gap-2">
                        <School className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs">
                          <Badge variant="outline" className="mr-1 text-xs px-1 py-0">
                            {dependencies.schoolCount}
                          </Badge>
                          məktəb deaktiv olacaq
                        </span>
                      </div>
                    )}
                    
                    {dependencies.adminCount > 0 && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs">
                          <Badge variant="outline" className="mr-1 text-xs px-1 py-0">
                            {dependencies.adminCount}
                          </Badge>
                          admin rolunda dəyişiklik olmayacaq
                        </span>
                      </div>
                    )}
                    
                    {dependencies.dataEntries > 0 && (
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs">
                          <Badge variant="outline" className="mr-1 text-xs px-1 py-0">
                            {dependencies.dataEntries}
                          </Badge>
                          məlumat girişi qorunacaq
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="grid grid-cols-1 gap-1">
                    <div className="p-1.5 bg-green-50 border border-green-200 rounded text-center">
                      <span className="text-green-600 font-medium text-xs">
                        ✅ Tövsiyə: İlk olaraq deaktiv edin
                      </span>
                    </div>
                    
                    <div className="p-1.5 bg-red-50 border border-red-200 rounded text-center">
                      <span className="text-red-700 font-medium text-xs">
                        ⚠️ "Tam sil" bütün məlumatları silir!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {dependencies && !hasDependencies && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  ✅ Bu sektorda təbəli məlumat tapılmadı. Təhlükəsiz silinə bilər.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col gap-2">
          {/* İlk sıra - Cancel və Deaktiv et */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
            <AlertDialogCancel 
              disabled={isSubmitting} 
              className="w-full sm:w-auto sm:mr-2"
            >
              {t("common.cancel")}
            </AlertDialogCancel>
            
            <AlertDialogAction
              onClick={() => onConfirm(false)}
              disabled={isSubmitting || checkingDependencies}
              className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deaktiv edir...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <span>📎 Deaktiv et</span>
                  <span className="text-xs hidden sm:inline ml-1">(tövsiyə)</span>
                </div>
              )}
            </AlertDialogAction>
          </div>
          
          {/* İkinci sıra - Hard Delete (yalnız dependency varsa) */}
          {hasDependencies && (
            <div className="w-full border-t pt-2">
              <div className="text-center mb-2">
                <p className="text-xs text-muted-foreground">
                  ⚠️ Təhlükəli əməliyyat
                </p>
              </div>
              
              <AlertDialogAction
                onClick={() => onConfirm(true)}
                disabled={isSubmitting || checkingDependencies}
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Tamamilə silir...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <span>🗑️ Tamamilə sil</span>
                    <span className="text-xs hidden sm:inline ml-1">
                      (geri qaytarıla bilməz)
                    </span>
                  </div>
                )}
              </AlertDialogAction>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSectorDialog;
