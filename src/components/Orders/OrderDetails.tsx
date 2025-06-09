import React from "react";

// Helper untuk format mata uang
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const OrderDetails = ({ orderItem }: any) => {
  return (
    <div className="p-4 w-full">
        <div className="mb-4">
            <p className="font-medium">Order ID: <span className="text-red font-mono">#{orderItem.id.slice(-8)}</span></p>
            <p className="text-sm text-gray-500">Date: {new Date(orderItem.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="mb-4">
            <p className="font-medium">Shipping Address:</p>
            <p className="text-sm text-gray-600">{orderItem.shippingAddress}</p>
        </div>
        <div className="border-t pt-4">
            <p className="font-medium mb-2">Items:</p>
            <div className="space-y-2">
                {/* Loop dan tampilkan setiap item */}
                {orderItem.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <p className="text-gray-800">{item.productNameSnapshot} x{item.quantity}</p>
                        <p className="text-gray-600">{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}</p>
                    </div>
                ))}
            </div>
        </div>
         <div className="border-t pt-2 mt-2 text-right">
             <p className="font-bold">Total: {formatCurrency(Number(orderItem.totalAmount))}</p>
        </div>
    </div>
  );
};

export default OrderDetails;