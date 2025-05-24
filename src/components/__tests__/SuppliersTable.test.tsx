
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuppliersTable } from '../SuppliersTable';
import * as useSuppliers from '@/hooks/useSuppliers';

// Mock the hooks
vi.mock('@/hooks/useSuppliers');
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

const mockSuppliers = [
  {
    id: '1',
    name: 'Test Supplier 1',
    contact_name: 'John Doe',
    contact_phone: '+47 123 45 678',
    contact_email: 'john@testsupplier.com',
    created_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
  },
  {
    id: '2',
    name: 'Test Supplier 2',
    contact_name: null,
    contact_phone: null,
    contact_email: null,
    created_at: '2024-01-02T00:00:00Z',
    deleted_at: null,
  },
];

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('SuppliersTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state', () => {
    vi.mocked(useSuppliers.useSuppliers).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(useSuppliers.useArchiveSupplier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderWithQueryClient(<SuppliersTable />);
    expect(screen.getByText('Laster leverandører...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const error = new Error('Failed to fetch');
    vi.mocked(useSuppliers.useSuppliers).mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as any);

    vi.mocked(useSuppliers.useArchiveSupplier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderWithQueryClient(<SuppliersTable />);
    expect(screen.getByText('Feil ved lasting av leverandører: Failed to fetch')).toBeInTheDocument();
  });

  it('displays empty state when no suppliers', () => {
    vi.mocked(useSuppliers.useSuppliers).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useSuppliers.useArchiveSupplier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderWithQueryClient(<SuppliersTable />);
    expect(screen.getByText('Ingen leverandører funnet.')).toBeInTheDocument();
  });

  it('displays suppliers list correctly', () => {
    vi.mocked(useSuppliers.useSuppliers).mockReturnValue({
      data: mockSuppliers,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useSuppliers.useArchiveSupplier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderWithQueryClient(<SuppliersTable />);
    
    expect(screen.getByText('Test Supplier 1')).toBeInTheDocument();
    expect(screen.getByText('Test Supplier 2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@testsupplier.com')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', async () => {
    vi.mocked(useSuppliers.useSuppliers).mockReturnValue({
      data: mockSuppliers,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useSuppliers.useArchiveSupplier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderWithQueryClient(<SuppliersTable />);
    
    const editButtons = screen.getAllByTitle('Rediger leverandør');
    fireEvent.click(editButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Rediger leverandør')).toBeInTheDocument();
    });
  });

  it('opens archive confirmation when archive button is clicked', async () => {
    vi.mocked(useSuppliers.useSuppliers).mockReturnValue({
      data: mockSuppliers,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useSuppliers.useArchiveSupplier).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderWithQueryClient(<SuppliersTable />);
    
    const archiveButtons = screen.getAllByTitle('Arkiver leverandør');
    fireEvent.click(archiveButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Arkiver leverandør')).toBeInTheDocument();
      expect(screen.getByText(/Er du sikker på at du vil arkivere leverandøren "Test Supplier 1"/)).toBeInTheDocument();
    });
  });
});
