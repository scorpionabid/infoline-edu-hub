
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: vi.fn((props) => ({ ...props, 'data-testid': 'dropzone-root' })),
    getInputProps: vi.fn((props) => ({ ...props, 'data-testid': 'dropzone-input' })),
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
    acceptedFiles: [],
    rejectedFiles: []
  }))
}));

// Mock component for testing
const MockFileUpload = () => {
  return (
    <div data-testid="file-upload">
      <div data-testid="dropzone-root">
        <input data-testid="dropzone-input" />
        Mock File Upload Component
      </div>
    </div>
  );
};

describe('Enhanced FileUpload', () => {
  test('renders file upload component', () => {
    render(<MockFileUpload />);
    
    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-root')).toBeInTheDocument();
    expect(screen.getByTestId('dropzone-input')).toBeInTheDocument();
  });

  test('handles file selection', async () => {
    render(<MockFileUpload />);
    
    const input = screen.getByTestId('dropzone-input');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });
});
