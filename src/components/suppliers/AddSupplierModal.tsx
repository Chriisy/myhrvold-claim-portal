
interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddSupplierModal({ open, onClose }: AddSupplierModalProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Ny leverandør</h2>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
          Lukk
        </button>
      </div>
    </div>
  );
}
