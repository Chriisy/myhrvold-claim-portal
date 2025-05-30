
import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceEquipment {
  id: string;
  name: string;
  default_id_number: string;
  created_at: string;
}

export interface MaintenanceChecklist {
  id: string;
  installation_id?: string;
  name: string;
  location?: string;
  created_by: string;
  created_at: string;
}

export interface MaintenanceRow {
  id: string;
  checklist_id: string;
  equipment_id: string;
  id_number_override?: string;
  equipment?: MaintenanceEquipment;
}

export interface MaintenanceControl {
  id: string;
  row_id: string;
  control_no: number;
  control_date?: string;
  signature?: string;
}

export const maintenanceService = {
  async getEquipment(): Promise<MaintenanceEquipment[]> {
    const { data, error } = await supabase
      .from('maintenance_equipment')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getChecklists(): Promise<MaintenanceChecklist[]> {
    const { data, error } = await supabase
      .from('maintenance_checklists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getChecklistWithRows(checklistId: string) {
    const { data: checklist, error: checklistError } = await supabase
      .from('maintenance_checklists')
      .select('*')
      .eq('id', checklistId)
      .single();

    if (checklistError) throw checklistError;

    const { data: rows, error: rowsError } = await supabase
      .from('maintenance_rows')
      .select(`
        *,
        equipment:maintenance_equipment(*)
      `)
      .eq('checklist_id', checklistId);

    if (rowsError) throw rowsError;

    const { data: controls, error: controlsError } = await supabase
      .from('maintenance_controls')
      .select('*')
      .in('row_id', rows?.map(r => r.id) || []);

    if (controlsError) throw controlsError;

    return {
      checklist,
      rows: rows || [],
      controls: controls || []
    };
  },

  async createChecklist(data: Omit<MaintenanceChecklist, 'id' | 'created_at'>): Promise<MaintenanceChecklist> {
    const { data: checklist, error } = await supabase
      .from('maintenance_checklists')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return checklist;
  },

  async addEquipmentToChecklist(checklistId: string, equipmentId: string, idNumberOverride?: string) {
    const { data, error } = await supabase
      .from('maintenance_rows')
      .insert({
        checklist_id: checklistId,
        equipment_id: equipmentId,
        id_number_override: idNumberOverride
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addControl(rowId: string, controlNo: number, controlDate?: string, signature?: string) {
    const { data, error } = await supabase
      .from('maintenance_controls')
      .insert({
        row_id: rowId,
        control_no: controlNo,
        control_date: controlDate,
        signature: signature
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateControl(controlId: string, controlDate?: string, signature?: string) {
    const { data, error } = await supabase
      .from('maintenance_controls')
      .update({
        control_date: controlDate,
        signature: signature
      })
      .eq('id', controlId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
