
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSuppliers } from '../useSuppliers';
import React from 'react';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      is: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', name: 'Test Supplier', contact_name: 'John Doe' }
          ],
          error: null
        }))
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useSuppliers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch suppliers successfully', async () => {
    const { result } = renderHook(() => useSuppliers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      { id: '1', name: 'Test Supplier', contact_name: 'John Doe' }
    ]);
  });
});
