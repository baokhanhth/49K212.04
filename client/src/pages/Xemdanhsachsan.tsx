import { useState, useRef, useEffect, useMemo } from "react";
import { sanBaiApi, datSanApi, getStoredUser } from "../services/api";
import type { LoaiSan, MatrixItem } from "../types";

const statusColor = (s: string) => {
  if (s === "Trống") return "bg-[#DFF4ED] text-[#17A673]";
  if (s === "Đã đặt") return "bg-[#F9E0E0] text-[#E55353]";
  if (s === "Chờ duyệt") return "bg-[#FFF3CD] text-[#E0A800]";
  if (s === "Quá giờ") return "bg-[#E2E3E5] text-[#6C757D]";
  return "bg-[#E2E3E5] text-[#6C757D]";
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

export default function Xemdanhsachsan() {
  const user = getStoredUser();
  const [loaiSanList, setLoaiSanList] = useState<LoaiSan[]>([]);
  const [selectedLoaiSan, setSelectedLoaiSan] = useState<number[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [matrixData, setMatrixData] = useState<MatrixItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<MatrixItem | null>(null);
  const [booking, setBooking] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Load loại sân
  useEffect(() => {
    sanBaiApi.getLoaiSan().then((data) => {
      setLoaiSanList(data);
      setSelectedLoaiSan(data.map((l) => l.maLoaiSan));
    });
  }, []);

  // Load matrix data khi ngày thay đổi
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    datSanApi
      .getMatrix({ ngay: selectedDate })
      .then((data) => setMatrixData(Array.isArray(data) ? data : []))
      .catch(() => setMatrixData([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  // Close filter khi click bên ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilter(false);
    };
    if (showFilter) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilter]);

  const toggleLoaiSan = (id: number) => {
    setSelectedLoaiSan((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filter & group matrix data
  const filtered = useMemo(() => {
    return matrixData.filter((item) => {
      const loai = loaiSanList.find((l) => l.tenLoaiSan === item.loaiSan);
      return loai ? selectedLoaiSan.includes(loai.maLoaiSan) : true;
    });
  }, [matrixData, selectedLoaiSan, loaiSanList]);

  // Get unique fields & time slots
  const fieldNames = useMemo(() => {
    const set = new Map<string, string>();
    filtered.forEach((item) => {
      if (item.tenSan) set.set(item.tenSan, item.loaiSan || "");
    });
    return Array.from(set.entries()); // [tenSan, loaiSan]
  }, [filtered]);

  const timeSlots = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach((item) => set.add(item.khungGio));
    return Array.from(set).sort();
  }, [filtered]);

  const getSlot = (time: string, tenSan: string) =>
    filtered.find((item) => item.khungGio === time && item.tenSan === tenSan);

  const handleBooking = async () => {
    if (!detail || !detail.maLichSan || !user?.userId) return;
    setBooking(true);
    try {
      await datSanApi.create({ userId: user.userId, maLichSan: detail.maLichSan });
      alert("Đã đặt sân thành công, vui lòng kiểm tra lịch sử đặt sân");
      setDetail(null);
      // Reload matrix
      try {
        const data = await datSanApi.getMatrix({ ngay: selectedDate });
        setMatrixData(Array.isArray(data) ? data : []);
      } catch {
        // Booking succeeded but matrix reload failed - don't show error
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Đặt sân thất bại");
    } finally {
      setBooking(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-100 to-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">N4 DUE</h2>
          <p className="text-sm text-blue-200">
            Hệ thống quản lý và đặt lịch sân thể thao
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          <div className="bg-blue-500 p-2 rounded">Đặt sân</div>
          <div className="hover:bg-blue-500 p-2 rounded cursor-pointer">Vé của tôi</div>
          <div className="hover:bg-blue-500 p-2 rounded cursor-pointer">Lịch sử đặt sân</div>
          <div className="hover:bg-blue-500 p-2 rounded cursor-pointer">Tài khoản</div>
        </nav>

        <button className="m-4 bg-blue-500 p-2 rounded">
          Đăng xuất
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10 flex gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">ĐẶT SÂN</h1>

          {/* FORM */}
          <div className="bg-white rounded-xl p-6 shadow flex gap-10 mb-6">
            <div>
              <p className="text-gray-400 text-sm">Sinh viên</p>
              <p className="font-semibold">{user?.hoTen || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Lớp</p>
              <p className="font-semibold">{user?.lop || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ngày</p>
              <input
                type="date"
                className="border rounded px-3 py-1"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* FILTER */}
          <div className="flex gap-4 mb-6 relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Lọc loại sân
            </button>

            {showFilter && (
              <div className="absolute top-12 bg-white shadow-xl rounded-xl w-48">
                {loaiSanList.map((l) => (
                  <label
                    key={l.maLoaiSan}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLoaiSan.includes(l.maLoaiSan)}
                      onChange={() => toggleLoaiSan(l.maLoaiSan)}
                      className="accent-blue-600"
                    />
                    {l.tenLoaiSan}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow overflow-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Không có lịch sân cho ngày này
              </div>
            ) : (
              <table className="w-full text-center">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Thời gian</th>
                    {fieldNames.map(([tenSan, loaiSan]) => (
                      <th key={tenSan} className="p-4">
                        {tenSan}
                        <div className="text-xs text-gray-400">{loaiSan}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="border-t">
                      <td className="p-4">{time}</td>
                      {fieldNames.map(([tenSan]) => {
                        const slot = getSlot(time, tenSan);
                        if (!slot)
                          return <td key={time + tenSan} className="p-4">-</td>;
                        return (
                          <td key={time + tenSan} className="p-4">
                            <span
                              onClick={() => {
                                if (slot.canBook) setDetail(slot);
                              }}
                              className={`${statusColor(slot.trangThai)} px-3 py-1 rounded-full text-sm ${
                                slot.canBook
                                  ? "cursor-pointer hover:opacity-80"
                                  : "cursor-default"
                              }`}
                            >
                              {slot.trangThai}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* LEGEND */}
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#17A673] rounded-full"></span>Trống
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#E55353] rounded-full"></span>Đã đặt
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#E0A800] rounded-full"></span>Chờ duyệt
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#6C757D] rounded-full"></span>Bảo trì
            </div>
          </div>
        </div>

        {/* DETAIL PANEL */}
        {detail && (
          <div className="w-80 bg-white rounded-xl shadow-xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">
                {detail.tenSan}
              </h2>
              <button onClick={() => setDetail(null)}>✕</button>
            </div>

            <img
              src={detail.hinhAnh || "https://images.unsplash.com/photo-1599058917212-d750089bc07e"}
              className="rounded-lg mb-4"
              alt={detail.tenSan}
            />

            <p className="mb-2">
              <b>Giá thuê:</b> {formatPrice(detail.giaThue)}đ / giờ
            </p>

            <p className="mb-2">
              <b>Loại sân:</b> {detail.loaiSan}
            </p>

            <p className="mb-4">
              <b>Vị trí:</b> {detail.viTri || "Sân ngoài trời"}
            </p>

            <button
              onClick={handleBooking}
              disabled={booking}
              className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {booking ? "Đang xử lý..." : "Đặt sân"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
