import React, { useState } from "react";
import EmployeeLayout from '../../components/layout/EmployeeLayout';


type BookingStatus = "Đã check-in" | "Đã thanh toán" | "Đã hủy" | "No-show";


type Booking = {
  id: string;
  studentName: string;
  courtName: string;
  date: string;
  time: string;
  amount: number;
  status: BookingStatus;
};


const mockBookings: Booking[] = [
  {
    id: "BK001",
    studentName: "Nguyễn Văn A",
    courtName: "Sân cầu lông A",
    date: "24/04/2026",
    time: "18:00 - 19:00",
    amount: 150000,
    status: "Đã check-in",
  },
  {
    id: "BK002",
    studentName: "Trần Thị B",
    courtName: "Sân bóng đá B",
    date: "24/04/2026",
    time: "19:00 - 20:00",
    amount: 300000,
    status: "Đã thanh toán",
  },
  {
    id: "BK003",
    studentName: "Lê Văn C",
    courtName: "Sân tennis A",
    date: "24/04/2026",
    time: "20:00 - 21:00",
    amount: 200000,
    status: "Đã hủy",
  },
  {
    id: "BK004",
    studentName: "Phạm Thị D",
    courtName: "Sân bóng chuyền A",
    date: "24/04/2026",
    time: "17:00 - 18:00",
    amount: 180000,
    status: "No-show",
  },
];


const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";


const getStatusClass = (status: BookingStatus): string => {
  switch (status) {
    case "Đã check-in":
      return "bg-green-100 text-green-700";
    case "Đã thanh toán":
      return "bg-blue-100 text-blue-700";
    case "Đã hủy":
      return "bg-red-100 text-red-700";
    case "No-show":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};


const XacNhanThanhToan: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState("");


  const handleOpenModal = (booking: Booking) => {
    if (booking.status !== "Đã check-in") {
      setMessage('Chỉ cho phép thanh toán khi trạng thái là "Đã check-in".');
      return;
    }


    setMessage("");
    setSelectedBooking(booking);
  };


  const handleConfirmPayment = () => {
    if (!selectedBooking) return;


    setBookings((prev) =>
      prev.map((item) =>
        item.id === selectedBooking.id
          ? { ...item, status: "Đã thanh toán" }
          : item
      )
    );


    setSelectedBooking(null);
    setMessage('Xác nhận thanh toán thành công. Trạng thái đã cập nhật thành "Đã thanh toán".');


    // TODO: Gọi API để cập nhật trạng thái trên Backend
    // await api.confirmPayment({ maDatSan: selectedBooking.id });
  };


  return (
    <EmployeeLayout>
      <div className="px-7 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Xác nhận thanh toán</h1>


        {message && (
          <div className="mb-4 rounded-xl bg-blue-50 p-4 text-blue-700 border border-blue-200">
            {message}
          </div>
        )}


        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Mã booking
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Sinh viên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Sân
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.studentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.courtName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.time}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          booking.status === "Đã check-in"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleOpenModal(booking)}
                        disabled={booking.status !== "Đã check-in"}
                      >
                        Xác nhận thanh toán
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Modal xác nhận thanh toán */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Xác nhận thanh toán
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>


              <div className="space-y-4 px-6 py-4">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Mã booking:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.id}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Sinh viên:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.studentName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Sân:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.courtName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Ngày:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.date}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Thời gian:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Trạng thái:</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Số tiền:</span>
                  <span className="text-2xl font-semibold text-slate-800">
                    {formatCurrency(selectedBooking.amount)}
                  </span>
                </div>
              </div>


              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Xác nhận thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};


export default XacNhanThanhToan;



