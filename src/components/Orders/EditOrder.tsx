import React, { useState } from "react";
import toast from "react-hot-toast";

const EditOrder = ({ order, toggleModal, onOrderUpdate }: any) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChanege = (e: any) => {
    setCurrentStatus(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!currentStatus) {
      toast.error("Please select a status");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status.');
      }
      
      toast.success("Order status updated!", { id: toastId });
      onOrderUpdate(); // Panggil fungsi ini untuk me-refresh daftar pesanan
      toggleModal(false);

    } catch (error) {
      toast.error(error.message || "Something went wrong.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-10">
      <p className="pb-2 font-medium text-dark">Order Status</p>
      <div className="w-full">
        <select
          className="w-full rounded-[10px] border border-gray-3 bg-gray-1 text-dark py-3.5 px-5 text-custom-sm"
          name="status"
          id="status"
          required
          value={currentStatus} // Gunakan value untuk controlled component
          onChange={handleChanege}
        >
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button
          className="mt-5 w-full rounded-[10px] border border-blue bg-blue text-white py-3.5 px-5 text-custom-sm disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditOrder;