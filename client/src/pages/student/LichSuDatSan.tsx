import { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import { datSanApi } from "../../services/api";

interface LichSuItem {
  maDatSan: number;
  tenSan: string;
  loaiSan: string;
  ngayDat: string;
  ngayApDung: string;
  khungGio: string;
  trangThai: string;
  giaThue: number;
}

const statusColor = (s: string) => {
  if (s === "Đã duyệt") return "bg-emerald-500";
  if (s === "Bị từ chối") return "bg-red-500";
  if (s === "Chờ duyệt") return "bg-blue-500";
  return "bg-gray-400";
};

const LichSuDatSan = () => {
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [bookings, setBookings] = useState<LichSuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    "Tất cả",
    "Đã duyệt",
    "Chờ duyệt",
    "Bị từ chối",
  ];

  // TODO: replace userId=1 with actual logged-in user
  useEffect(() => {
    datSanApi
      .getLichSu(1)
      .then((data: any) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = useMemo(() => {
    if (selectedStatus === "Tất cả") return bookings;
    return bookings.filter((b) => b.trangThai === selectedStatus);
  }, [selectedStatus, bookings]);

  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("vi-VN");
  };


  return (
    <StudentLayout>
      <div className="px-7 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">
          Lịch sử đặt sân
        </h1>


        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* FILTER */}
          <div className="flex gap-4 mb-6">
            <input type="date" className="border rounded-lg px-4 py-2" />
            <input type="date" className="border rounded-lg px-4 py-2" />


            <div className="ml-auto relative">
              <button
                onClick={() => setOpenFilter(!openFilter)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg min-w-[170px]"
              >
                {selectedStatus === "Tất cả"
                  ? "Lọc trạng thái"
                  : selectedStatus}
              </button>


              {openFilter && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                  {statusOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSelectedStatus(item);
                        setOpenFilter(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        selectedStatus === item
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* TABLE */}
          {loading ? (
            <div className="py-8 text-center text-gray-500">Đang tải...</div>
          ) : (
          <table className="w-full">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-3">Sân</th>
                <th className="text-left">Ngày</th>
                <th className="text-left">Khung giờ</th>
                <th className="text-left">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.maDatSan} className="border-b">
                  <td className="py-4">
                    <div className="font-semibold">{b.tenSan}</div>
                    <div className="text-sm text-gray-400">{b.loaiSan}</div>
                  </td>

                  <td>{formatDate(b.ngayApDung)}</td>
                  <td>{b.khungGio}</td>

                  <td>
                    <span
                      className={`${statusColor(b.trangThai)} text-white px-4 py-1 rounded-full text-sm`}
                    >
                      {b.trangThai}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-gray-400 italic"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}


          {/* PAGINATION */}
          <div className="flex justify-end mt-6 gap-2">
            <button className="border w-8 h-8 rounded">‹</button>
            <button className="bg-blue-600 text-white w-8 h-8 rounded">1</button>
            <button className="border w-8 h-8 rounded">›</button>
          </div>
        </div>


        {/* LEGEND */}
        <div className="bg-white rounded-2xl mt-6 p-4 flex gap-6 shadow-sm">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            Đã duyệt
          </span>


          <span className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            Không check-in
          </span>


          <span className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Chờ duyệt
          </span>


          <span className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            Đã hủy
          </span>
        </div>
      </div>
    </StudentLayout>
  );
};


export default LichSuDatSan;