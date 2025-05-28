
import { useState } from 'react';
import { useEditClaim } from '@/hooks/useEditClaim';
import { usePermissions } from '@/hooks/usePermissions';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useSelgere } from '@/hooks/useSelgere';
import { ClaimOverviewDisplay } from './overview/ClaimOverviewDisplay';
import { ClaimEditForm } from './overview/ClaimEditForm';
import { Database } from '@/integrations/supabase/types';

type ClaimCategory = Database['public']['Enums']['claim_category'];
type ClaimStatus = Database['public']['Enums']['claim_status'];
type ActionStatus = Database['public']['Enums']['action_status'];

interface ClaimData {
  id: string;
  customer_name?: string;
  customer_no?: string;
  customer_address?: string;
  customer_postal_code?: string;
  customer_city?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  part_number?: string;
  warranty?: boolean;
  quantity?: number;
  category?: ClaimCategory;
  description?: string;
  visma_order_no?: string;
  customer_po?: string;
  reported_by?: string;
  internal_note?: string;
  status?: ClaimStatus;
  account_code_id?: number;
  technician_id?: string;
  salesperson_id?: string;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  salesperson?: { name: string } | null;
  created_by?: string;
}

interface EditableClaimOverviewProps {
  claim: ClaimData;
}

export function EditableClaimOverview({ claim }: EditableClaimOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editClaim = useEditClaim();
  const { canEditAllClaims, canEditOwnClaims, user } = usePermissions();
  const { data: technicians } = useTechnicians();
  const { data: selgere } = useSelgere();

  const canEdit = canEditAllClaims() || (canEditOwnClaims() && claim.created_by === user?.id);

  const handleSave = async (formData: ClaimData) => {
    const updateData = {
      id: formData.id,
      customer_name: formData.customer_name || null,
      customer_no: formData.customer_no || null,
      customer_address: formData.customer_address || null,
      customer_postal_code: formData.customer_postal_code || null,
      customer_city: formData.customer_city || null,
      department: formData.department || null,
      machine_model: formData.machine_model || null,
      machine_serial: formData.machine_serial || null,
      part_number: formData.part_number || null,
      warranty: formData.warranty || false,
      quantity: formData.quantity || null,
      category: formData.category || null,
      description: formData.description || null,
      visma_order_no: formData.visma_order_no || null,
      customer_po: formData.customer_po || null,
      reported_by: formData.reported_by || null,
      internal_note: formData.internal_note || null,
      status: formData.status || 'Ny',
      account_code_id: formData.account_code_id || null,
      technician_id: formData.technician_id === 'none' ? null : formData.technician_id || null,
      salesperson_id: formData.salesperson_id === 'none' ? null : formData.salesperson_id || null,
    };
    
    console.log('handleSave - Final updateData:', updateData);
    
    await editClaim.mutateAsync(updateData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <ClaimEditForm
        claim={claim}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={editClaim.isPending}
        technicians={technicians}
        selgere={selgere}
      />
    );
  }

  return (
    <ClaimOverviewDisplay
      claim={claim}
      canEdit={canEdit}
      onEdit={() => setIsEditing(true)}
    />
  );
}
