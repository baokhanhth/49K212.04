import { useState, useRef, useEffect, useMemo } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import { sanBaiApi, datSanApi } from "../../services/api";
import type { LoaiSan, MatrixItem } from "../../types";

const statusColor = (s: string) => {
  if (s === "Trống") return "bg-[#DFF4ED] text-[#17A673]";
  if (s === "Đã đặt") return "bg-[#F9E0E0] text-[#E55353]";
  if (s === "Chờ duyệt") return "bg-[#FFF3CD] text-[#E0A800]";
  if (s === "Quá giờ") return "bg-[#E2E3E5] text-[#6C757D]";
  return "bg-[#E2E3E5] text-[#6C757D]";
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const DatSan = () => {
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

  // Load matrix data when date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    datSanApi
      .getMatrix({ ngay: selectedDate })
      .then((data) => setMatrixData(Array.isArray(data) ? data : []))
      .catch(() => setMatrixData([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  // Close filter on outside click
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
    if (!detail || !detail.maLichSan) return;
    setBooking(true);
    try {
      // TODO: replace userId=1 with actual logged-in user
      await datSanApi.create({ userId: 1, maLichSan: detail.maLichSan });
      alert("Đã đặt sân thành công, vui lòng kiểm tra lịch sử đặt sân");
      setDetail(null);
      // Reload matrix
      const data = await datSanApi.getMatrix({ ngay: selectedDate });
      setMatrixData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Đặt sân thất bại");
    } finally {
      setBooking(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price);

  return (
    <StudentLayout>
      <div className="px-7 py-8 flex gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">Đặt sân</h1>

          {/* FORM */}
          <div className="bg-white rounded-xl p-6 shadow flex gap-10 mb-6">
            <div>
              <p className="text-gray-400 text-sm">Sinh viên</p>
              <p className="font-semibold">Quang Minh</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Lớp</p>
              <p className="font-semibold">20K01</p>
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
              <div className="absolute top-12 z-10 bg-white shadow-xl rounded-xl w-48">
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

        {/* MODAL */}
        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDetail(null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <button
                onClick={() => setDetail(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
              <h2 className="mb-4 text-xl font-bold text-slate-800">
                {detail.tenSan}
              </h2>
              <div className="border-t pt-4">
                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  Chi tiết chọn
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400">Tên người đặt</p>
                    <p className="font-semibold">Quang Minh</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Ngày</p>
                    <p>{selectedDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Sân</p>
                    <p>{detail.tenSan}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Loại sân</p>
                    <p>{detail.loaiSan}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Thời gian</p>
                    <p>{detail.khungGio}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Giá tiền</p>
                    <p>{formatPrice(detail.giaThue)} VNĐ</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleBooking}
                    disabled={booking}
                    className="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {booking ? "Đang xử lý..." : "Đặt"}
                  </button>
                  <button
                    onClick={() => setDetail(null)}
                    className="flex-1 rounded-lg bg-gray-300 py-2 font-semibold text-gray-700 hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default DatSan;