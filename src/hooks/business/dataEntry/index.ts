/**
 * Business/DataEntry qovluğundakı bütün hook-ları ixrac edir.
 * Bu fayllar yeni strukturlaşdırılmış və optimizə edilmiş implementasiyaları təmin edir.
 */

// Əsas data entry hook-ları
export { default as useDataEntry } from './useDataEntry';
export { default as useDataEntryState } from './useDataEntryState';
export { default as useTestDataEntry } from './useTestDataEntry';
export { default as useDataEntryExample } from './useDataEntryExample';

// Qovluğun özünü default export edirik ki, qrup şəklində import etmək mümkün olsun
import useDataEntry from './useDataEntry';
import useDataEntryState from './useDataEntryState';
import useTestDataEntry from './useTestDataEntry';
import useDataEntryExample from './useDataEntryExample';

const dataEntryHooks = {
  useDataEntry,
  useDataEntryState,
  useTestDataEntry,
  useDataEntryExample
};

export default dataEntryHooks;
