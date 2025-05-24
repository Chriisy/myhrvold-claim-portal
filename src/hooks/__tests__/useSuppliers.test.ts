
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useArchiveSupplier } from '../useSuppliers';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSuppliers hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSuppliers', () => {
    it('fetches suppliers successfully', async () => {
      const mockData = [
        { id: '1', name: 'Test Supplier', deleted_at: null },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        is: mockIs,
        order: mockOrder,
      } as any);

      mockSelect.mockReturnValue({ is: mockIs, order: mockOrder });
      mockIs.mockReturnValue({ order: mockOrder });

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('suppliers');
    });
  });

  describe('useCreateSupplier', () => {
    it('creates supplier successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockSupplierData = {
        name: 'New Supplier',
        contact_name: 'John Doe',
        contact_phone: '+47 123 45 678',
        contact_email: 'john@newsupplier.com',
      };
      const mockCreatedSupplier = { id: 'supplier-1', ...mockSupplierData };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedSupplier, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      } as any);

      mockInsert.mockReturnValue({ select: mockSelect, single: mockSingle });
      mockSelect.mockReturnValue({ single: mockSingle });

      const { result } = renderHook(() => useCreateSupplier(), {
        wrapper: createWrapper(),
      });

      let createdSupplier: any;
      await waitFor(async () => {
        createdSupplier = await result.current.mutateAsync(mockSupplierData);
      });

      expect(createdSupplier).toEqual(mockCreatedSupplier);
      expect(supabase.from).toHaveBeenCalledWith('suppliers');
    });

    it('handles authentication error', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      } as any);

      const { result } = renderHook(() => useCreateSupplier(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          name: 'Test',
          contact_name: '',
          contact_phone: '',
          contact_email: '',
        })
      ).rejects.toThrow('Du må være innlogget for å opprette leverandører');
    });
  });

  describe('useUpdateSupplier', () => {
    it('updates supplier successfully', async () => {
      const mockUpdateData = {
        name: 'Updated Supplier',
        contact_name: 'Jane Doe',
        contact_phone: '+47 987 65 432',
        contact_email: 'jane@updated.com',
      };
      const mockUpdatedSupplier = { id: 'supplier-1', ...mockUpdateData };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedSupplier, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any);

      mockUpdate.mockReturnValue({ eq: mockEq, select: mockSelect, single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect, single: mockSingle });
      mockSelect.mockReturnValue({ single: mockSingle });

      const { result } = renderHook(() => useUpdateSupplier(), {
        wrapper: createWrapper(),
      });

      let updatedSupplier: any;
      await waitFor(async () => {
        updatedSupplier = await result.current.mutateAsync({
          id: 'supplier-1',
          data: mockUpdateData,
        });
      });

      expect(updatedSupplier).toEqual(mockUpdatedSupplier);
      expect(supabase.from).toHaveBeenCalledWith('suppliers');
    });
  });

  describe('useArchiveSupplier', () => {
    it('archives supplier successfully', async () => {
      const mockArchivedSupplier = { id: 'supplier-1', name: 'Test', deleted_at: '2024-01-01T00:00:00Z' };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockArchivedSupplier, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any);

      mockUpdate.mockReturnValue({ eq: mockEq, select: mockSelect, single: mockSingle });
      mockEq.mockReturnValue({ select: mockSelect, single: mockSingle });
      mockSelect.mockReturnValue({ single: mockSingle });

      const { result } = renderHook(() => useArchiveSupplier(), {
        wrapper: createWrapper(),
      });

      let archivedSupplier: any;
      await waitFor(async () => {
        archivedSupplier = await result.current.mutateAsync('supplier-1');
      });

      expect(archivedSupplier).toEqual(mockArchivedSupplier);
      expect(supabase.from).toHaveBeenCalledWith('suppliers');
    });
  });
});
