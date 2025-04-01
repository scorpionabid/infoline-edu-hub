
export interface CreateRegionParams {
  name: string;
  description?: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

export interface RegionStats {
  sectorCount: number;
  schoolCount: number;
  adminCount: number;
}

export interface RegionOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}
