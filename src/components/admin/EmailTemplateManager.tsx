/**
 * Email Template Manager Component - Part 2
 * Dialogs və support componentlər
 */

                    <CardTitle className="text-sm">Son İstifadə</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {templateStats.lastUsed 
                        ? new Date(templateStats.lastUsed).toLocaleDateString('az-AZ')
                        : 'Heç vaxt'
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {templateStats.totalSent > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Çatdırılma faizi:</span>
                    <span className="font-medium">
                      {Math.round((templateStats.delivered / templateStats.totalSent) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.round((templateStats.delivered / templateStats.totalSent) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;