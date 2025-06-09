"use client";
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
// Hapus import data statis: import ordersData from "./ordersData";

const Orders = () => {
  // Kita akan gunakan state 'orders' ini
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data pesanan
  const fetchOrders = () => {
    setLoading(true);
    // Kita akan buat API route ini di langkah berikutnya
    fetch(`/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading orders...</div>;
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              {/* Header Titles */}
              <div className="min-w-[111px]"><p className="text-custom-sm text-dark">Order</p></div>
              <div className="min-w-[175px]"><p className="text-custom-sm text-dark">Date</p></div>
              <div className="min-w-[128px]"><p className="text-custom-sm text-dark">Status</p></div>
              <div className="min-w-[213px]"><p className="text-custom-sm text-dark">Title (First Item)</p></div>
              <div className="min-w-[113px]"><p className="text-custom-sm text-dark">Total</p></div>
              <div className="min-w-[113px]"><p className="text-custom-sm text-dark text-right">Action</p></div>
            </div>
          )}
          {/* Gunakan state 'orders' dari API, bukan 'ordersData' */}
          {orders.length > 0 ? (
            orders.map((orderItem) => (
              <SingleOrder orderItem={orderItem} key={orderItem.id} smallView={false} onOrderUpdate={fetchOrders} />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              You don&apos;t have any orders!
            </p>
          )}
        </div>
        {/* Anda bisa menghapus bagian ini jika tidak memerlukan dua view berbeda */}
        {/* {orders.length > 0 &&
          orders.map((orderItem) => (
            <SingleOrder orderItem={orderItem} key={orderItem.id} smallView={true} onOrderUpdate={fetchOrders} />
          ))} */}
      </div>
    </>
  );
};

export default Orders;