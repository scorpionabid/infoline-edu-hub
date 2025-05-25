import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Download, File } from 'lucide-react';
import { useEntityFiles } from '@/hooks/common/useEntityFiles';
import { useAuth } from '@/context/auth';

export const RegionFilesCard: React.FC = () => {
  const { user } = useAuth();
  const regionId = user?.region_id;
  const { files, loading, getFileUrl } = useEntityFiles('region', regionId);

  const handleFileDownload = async (file: any) => {
    try {
      const url = await getFileUrl(file.file_path);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Region Faylları
        </CardTitle>
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Yüklənir...</div>
        ) : files.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Hələ ki heç bir fayl paylaşılmayıb
          </div>
        ) : (
          <div className="space-y-2">
            {files.slice(0, 3).map((file) => (
              <div key={file.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </p>
                    {file.schools && (
                      <p className="text-xs text-muted-foreground">
                        Məktəb: {file.schools.name}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileDownload(file)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {files.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{files.length - 3} əlavə fayl
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
