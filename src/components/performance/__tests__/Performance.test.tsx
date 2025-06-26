
import { render, screen } from '@testing-library/react';
import { VirtualTable } from '../VirtualTable'; // Fixed: import from correct file

describe('Performance Components', () => {
  it('renders VirtualTable correctly', () => {
    const mockItems = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    render(
      <VirtualTable
        items={mockItems}
        itemHeight={50}
        height={200}
        renderItem={({ item }) => <div key={item.id}>{item.name}</div>}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});
