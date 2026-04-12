import { useMemo, useState, useEffect } from "react";
import { datSanApi, getStoredUser } from "../services/api";

interface BookingItem {
  maDatSan: number;
  tenSan: string;
  loaiSan: string;
  ngayDat: string;
  ngayApDung: string;
  khungGio: string;
  trangThai: string;
}

export default function Lichsudatsan() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Load booking history from API
  useEffect(() => {
    const user = getStoredUser();
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    datSanApi
      .getLichSu(user.userId)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list.map((item: any) => ({
          maDatSan: item.maDatSan,
          tenSan: item.lichSan?.sanBai?.tenSan || `Sân #${item.maLichSan}`,
          loaiSan: item.lichSan?.sanBai?.loaiSan?.tenLoaiSan || "N/A",
          ngayDat: item.ngayDat,
          ngayApDung: item.lichSan?.ngayApDung || item.ngayDat,
          khungGio: item.lichSan
            ? `${item.lichSan.gioBatDau?.substring(0, 5)} - ${item.lichSan.gioKetThuc?.substring(0, 5)}`
            : "N/A",
          trangThai: item.trangThai,
        })));
        setError("");
      })
      .catch(() => {
        setError("Không thể tải lịch sử đặt sân. Vui lòng thử lại.");
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (selectedStatus !== "Tất cả") {
      result = result.filter((b) => b.trangThai === selectedStatus);
    }
    if (dateFrom) {
      result = result.filter((b) => b.ngayApDung >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((b) => b.ngayApDung <= dateTo);
    }
    return result;
  }, [selectedStatus, bookings, dateFrom, dateTo]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status: string) => {
    if (status === "Đã duyệt") return "bg-emerald-500";
    if (status === "Bị từ chối" || status === "Không check-in") return "bg-red-500";
    if (status === "Chờ duyệt") return "bg-blue-500";
    return "bg-gray-400";
  };

  const statusOptions = [
    "Tất cả",
    "Đã duyệt",
    "Bị từ chối",
    "Chờ duyệt",
    "Đã hủy",
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col">
        <div className="p-6 font-bold text-xl">
          N4 DUE
          <div className="text-sm font-normal opacity-70">
            Hệ thống quản lý và đặt lịch sân thể thao
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="p-3 rounded-lg hover:bg-blue-600">Đặt sân</div>
          <div className="p-3 rounded-lg hover:bg-blue-600">Vé của tôi</div>

          <div className="p-3 rounded-lg bg-blue-600">Lịch sử đặt sân</div>

          <div className="p-3 rounded-lg hover:bg-blue-600">Tài khoản</div>
        </nav>

        <div className="p-4">
          <button className="w-full bg-blue-400 py-3 rounded-lg">
            Đăng xuất
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <div className="text-gray-500">
            Sân thể thao / <span className="text-gray-700">Quản lý sân</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              placeholder="Tìm kiếm..."
              className="border rounded-lg px-4 py-2"
            />

            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Lịch sử đặt sân
          </h1>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : null}

          {/* CARD */}
          {!loading && !error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {/* FILTER */}
            <div className="flex gap-4 mb-6">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border rounded-lg px-4 py-2"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-lg px-4 py-2"
              />

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
                        className={`${getStatusColor(b.trangThai)} text-white px-4 py-1 rounded-full text-sm`}
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

            {/* PAGINATION */}
            <div className="flex justify-end mt-6 gap-2">
              <button className="border w-8 h-8 rounded">‹</button>

              <button className="bg-blue-600 text-white w-8 h-8 rounded">
                1
              </button>

              <button className="border w-8 h-8 rounded">›</button>
            </div>
          </div>
          )}

          {/* LEGEND */}
          {!loading && !error && (
          <div className="bg-white rounded-2xl mt-6 p-4 flex gap-6 shadow-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              Đã duyệt
            </span>

            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Bị từ chối
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
          )}
        </div>
      </div>
    </div>
  );
}