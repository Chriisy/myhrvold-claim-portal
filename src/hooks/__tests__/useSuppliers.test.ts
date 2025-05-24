
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useArchiveSupplier } from '../useSuppliers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-toast');

const mockSupabase = vi.mocked(supabase);
const mockToast = vi.mocked(toast);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSuppliers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch suppliers successfully', async () => {
    const mockSuppliers = [
      { id: '1', name: 'Test Supplier', contact_name: 'John Doe' },
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockSuppliers,
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useSuppliers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSuppliers);
  });

  it('should create supplier successfully', async () => {
    const newSupplier = {
      name: 'New Supplier',
      contact_name: 'Jane Doe',
      contact_phone: '123-456-7890',
      contact_email: 'jane@example.com',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '1', ...newSupplier },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCreateSupplier(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newSupplier);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Leverandør opprettet',
      description: 'Den nye leverandøren har blitt lagt til.',
    });
  });
});
