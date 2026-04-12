import React, { useEffect, useState } from "react";
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { datSanApi, getStoredUser } from '../../services/api';


type BookingStatus = "Đã check-in" | "Đã thanh toán" | "Đã hủy" | "No-show" | string;


type Booking = {
  maDatSan: number;
  tenSan: string;
  tenSinhVien: string;
  ngayDat: string;
  khungGio: string;
  tongTien: number;
  trangThai: BookingStatus;
};


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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    datSanApi.getAll({ trangThai: 'Đã check-in' })
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list.map((item: any) => ({
          maDatSan: item.maDatSan,
          tenSan: item.lichSan?.sanBai?.tenSan || `Lịch #${item.maLichSan}`,
          tenSinhVien: item.nguoiDung?.hoTen || `User #${item.userId}`,
          ngayDat: item.lichSan?.ngayApDung || item.ngayDat,
          khungGio: item.lichSan
            ? `${item.lichSan.gioBatDau?.substring(0, 5)} - ${item.lichSan.gioKetThuc?.substring(0, 5)}`
            : '-',
          tongTien: item.tongTien || item.lichSan?.sanBai?.giaThue || 0,
          trangThai: item.trangThai,
        })));
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);


  const handleOpenModal = (booking: Booking) => {
    if (booking.trangThai !== "Đã check-in") {
      setMessage('Chỉ cho phép thanh toán khi trạng thái là "Đã check-in".');
      return;
    }


    setMessage("");
    setSelectedBooking(booking);
  };


  const handleConfirmPayment = async () => {
    if (!selectedBooking) return;
    setSubmitting(true);
    try {
      const user = getStoredUser();
      await datSanApi.xacNhanThuPhi(selectedBooking.maDatSan, user?.userId || 0);
      setBookings((prev) =>
        prev.map((item) =>
          item.maDatSan === selectedBooking.maDatSan
            ? { ...item, trangThai: "Đã thanh toán" as BookingStatus }
            : item
        )
      );
      setSelectedBooking(null);
      setMessage('Xác nhận thanh toán thành công. Trạng thái đã cập nhật thành "Đã thanh toán".');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Xác nhận thanh toán thất bại');
    } finally {
      setSubmitting(false);
    }
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
          {loading ? (
            <div className="py-8 text-center text-gray-500">Đang tải...</div>
          ) : (
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
                  <tr key={booking.maDatSan} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-800">
                      #{booking.maDatSan}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.tenSinhVien}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.tenSan}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.ngayDat ? new Date(booking.ngayDat).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {booking.khungGio}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {formatCurrency(booking.tongTien)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          booking.trangThai
                        )}`}
                      >
                        {booking.trangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          booking.trangThai === "Đã check-in"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleOpenModal(booking)}
                        disabled={booking.trangThai !== "Đã check-in"}
                      >
                        Xác nhận thanh toán
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
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
                    #{selectedBooking.maDatSan}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Sinh viên:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.tenSinhVien}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Sân:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.tenSan}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Ngày:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.ngayDat ? new Date(selectedBooking.ngayDat).toLocaleDateString('vi-VN') : '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Thời gian:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.khungGio}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Trạng thái:</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      selectedBooking.trangThai
                    )}`}
                  >
                    {selectedBooking.trangThai}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Số tiền:</span>
                  <span className="text-2xl font-semibold text-slate-800">
                    {formatCurrency(selectedBooking.tongTien)}
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
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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



