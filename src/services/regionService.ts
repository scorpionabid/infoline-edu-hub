
// Region service modullarını ixrac edirik
export { fetchRegions } from './region/fetchService';
export { 
  createRegion, 
  addRegion, 
  deleteRegion 
} from './region/crudService';
export { getRegionStats } from './region/statsService';
export { fetchRegionAdminEmail } from './region/adminUtils';
export type { CreateRegionParams } from './region/types';
