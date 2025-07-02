/**
 * Breadcrumb Navigation Component
 * 
 * This component is currently disabled and returns null to hide breadcrumb navigation.
 * It can be re-enabled in the future if needed by removing the early return statement.
 * 
 * Note: Previously used `data-lov-id` attribute has been removed as it was not in use.
 * Reference to removed attribute: data-lov-id="src/components/layout/parts/BreadcrumbNav.tsx:52:4"
 */

import React from 'react';

// Breadcrumb navigation is currently disabled
const BreadcrumbNav = React.memo(() => {
  // Return null to completely hide the breadcrumb navigation
  return null;
});

BreadcrumbNav.displayName = 'BreadcrumbNav';

export default BreadcrumbNav;