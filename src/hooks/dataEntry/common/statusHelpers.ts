
// Status management helpers
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'pending': return 'yellow';
    default: return 'gray';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Təsdiqləndi';
    case 'rejected': return 'Rədd edildi';
    case 'pending': return 'Gözləyir';
    default: return 'Bilinmir';
  }
};
