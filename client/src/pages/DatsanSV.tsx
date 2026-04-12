import { useState, useEffect, useMemo } from "react";
import { sanBaiApi, datSanApi, getStoredUser } from "../services/api";
import type { LoaiSan, MatrixItem } from "../types";

interface Court {
  id: number;
  name: string;
  type: string;
  price: number;
  location: string;
  image: string;
}

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const DatsanSV: React.FC = () => {
  const user = getStoredUser();
  const [loaiSanList, setLoaiSanList] = useState<LoaiSan[]>([]);
  const [selectedLoaiSan, setSelectedLoaiSan] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("Bóng đá");
  const [matrixData, setMatrixData] = useState<MatrixItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<MatrixItem | null>(null);
  const [booking, setBooking] = useState(false);

  // Load loại sân
  useEffect(() => {
    sanBaiApi.getLoaiSan().then((data) => {
      setLoaiSanList(data);
      setSelectedLoaiSan(data.map((l) => l.maLoaiSan));
      if (data.length > 0) setSelectedType(data[0].tenLoaiSan);
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

  // Load thông tin user
  useEffect(() => {
    if (user?.lop) {
      setSelectedClass(user.lop);
    }
  }, [user]);

  const toggleType = (id: number) => {
    setSelectedLoaiSan((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  // Filter & group matrix data
  const filtered = useMemo(() => {
    return matrixData.filter((item) => {
      const loai = loaiSanList.find((l) => l.tenLoaiSan === item.loaiSan);
      return loai ? selectedLoaiSan.includes(loai.maLoaiSan) : true;
    });
  }, [matrixData, selectedLoaiSan, loaiSanList]);

  // Get unique courts from filtered data
  const courts = useMemo(() => {
    const courtMap = new Map<number, Court>();
    filtered.forEach((item) => {
      if (item.maSan && !courtMap.has(item.maSan)) {
        courtMap.set(item.maSan, {
          id: item.maSan,
          name: item.tenSan,
          type: item.loaiSan,
          price: item.giaThue,
          location: item.viTri || "Sân ngoài trời",
          image: item.hinhAnh || "https://images.unsplash.com/photo-1575361204480-aadea25e6e68",
        });
      }
    });
    return Array.from(courtMap.values()).slice(0, 3); // Max 3 courts
  }, [filtered]);

  // Get time slots
  const timeSlots = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach((item) => set.add(item.khungGio));
    return Array.from(set).sort();
  }, [filtered]);

  // Get slot status for specific court and time
  const getSlotForCourtAndTime = (courtId: number, time: string) => {
    return filtered.find((item) => item.maSan === courtId && item.khungGio === time);
  };

  // Slot status mapping
  const getSlotStatusInfo = (slot?: MatrixItem) => {
    if (!slot) return { label: "-", className: "bg-gray-100 text-gray-400", canClick: false };

    const canClick = slot.canBook;
    let className = "";
    let label = slot.trangThai;

    if (slot.trangThai === "Trống") {
      className = "bg-[#D9F1EA] text-[#2D8C72]";
    } else if (slot.trangThai === "Đã đặt") {
      className = "bg-[#F8DEDE] text-[#D36B6B]";
    } else if (slot.trangThai === "Chờ duyệt") {
      className = "bg-[#F7E8B8] text-[#C89B1D]";
    } else {
      className = "bg-[#E3E5EE] text-[#7C8499]";
    }

    return { label, className, canClick };
  };

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
        // Booking succeeded but matrix reload failed
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Đặt sân thất bại");
    } finally {
      setBooking(false);
    }
  };

  const formatPrice = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

  return (
    <div className="h-full overflow-hidden bg-[#E9EDF5] px-4 py-2">
      <div className="mx-auto grid h-full max-w-[1140px] grid-cols-[1fr_280px] gap-3">
        <section className="flex min-h-0 flex-col">
          <h1 className="mb-2 text-[24px] font-extrabold text-slate-800">Đặt sân</h1>

          <div className="mb-2 rounded-[14px] bg-white px-4 py-2.5 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="mb-1 text-[11px] text-slate-400">Sinh viên</p>
                <p className="text-[13px] font-bold text-slate-800">{user?.hoTen || "N/A"}</p>
              </div>

              <div>
                <label className="mb-1 block text-[11px] text-slate-400">Lớp</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-[34px] w-full rounded-lg border border-slate-200 px-3 text-[13px] text-slate-700 outline-none"
                  disabled
                >
                  <option>{user?.lop || "N/A"}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] text-slate-400">Ngày</label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-[34px] w-full rounded-lg border border-slate-200 px-3 pr-9 text-[13px] text-slate-700 outline-none"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-500">
                    🗓
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-2 flex items-start gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className="flex h-[36px] min-w-[132px] items-center justify-between rounded-lg bg-[#4169E1] px-3 text-[13px] font-medium text-white shadow-sm"
              >
                <span>Lọc loại sân</span>
                <span>⌄</span>
              </button>

              {filterOpen && (
                <div className="absolute left-0 top-[42px] z-20 w-[165px] rounded-xl bg-white p-2.5 shadow-xl">
                  <div className="space-y-1.5">
                    {loaiSanList.map((type) => (
                      <label
                        key={type.maLoaiSan}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${
                          type.tenLoaiSan === selectedType ? "bg-[#EEF3FF]" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLoaiSan.includes(type.maLoaiSan)}
                          onChange={() => toggleType(type.maLoaiSan)}
                          className="h-3.5 w-3.5 rounded"
                        />
                        <span
                          className={`text-[13px] ${
                            type.tenLoaiSan === selectedType ? "text-[#4169E1]" : "text-slate-700"
                          }`}
                        >
                          {type.tenLoaiSan}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-[36px] min-w-[112px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none"
            >
              {loaiSanList.map((type) => (
                <option key={type.maLoaiSan} value={type.tenLoaiSan}>
                  {type.tenLoaiSan}
                </option>
              ))}
            </select>
          </div>

          <div className="min-h-0 overflow-hidden rounded-[16px] bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Không có lịch sân cho ngày này</div>
            ) : (
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="w-[155px] border-b border-slate-100 px-4 py-2.5 text-left text-[14px] font-bold text-slate-800">
                      Thời gian
                    </th>

                    {courts.map((court) => (
                      <th
                        key={court.id}
                        className="min-w-[125px] border-b border-l border-slate-100 px-3 py-2.5 text-center"
                      >
                        <div className="text-[13px] font-bold text-slate-700">Sân {court.id}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400">{court.type}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {timeSlots.map((slotTime) => (
                    <tr key={slotTime} className="border-t border-slate-100">
                      <td className="border-b border-l border-slate-100 px-4 py-2.5 text-[13px] text-slate-700">
                        {slotTime}
                      </td>

                      {courts.map((court) => {
                        const slot = getSlotForCourtAndTime(court.id, slotTime);
                        const statusInfo = getSlotStatusInfo(slot);

                        return (
                          <td
                            key={`${slotTime}-${court.id}`}
                            className="border-b border-l border-slate-100 px-3 py-2.5 text-center"
                          >
                            <button
                              type="button"
                              onClick={() => statusInfo.canClick && slot && setDetail(slot)}
                              disabled={!statusInfo.canClick}
                              className={`min-w-[82px] rounded-full px-3 py-1 text-[12px] font-medium ${statusInfo.className} ${
                                statusInfo.canClick ? "cursor-pointer hover:opacity-80" : "cursor-default"
                              }`}
                            >
                              {statusInfo.label}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#41C7B7]" />
              <span className="text-[12px] text-slate-500">Trống</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#D96A6A]" />
              <span className="text-[12px] font-semibold text-slate-700">Đã đặt</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#F0D36F]" />
              <span className="text-[12px] text-slate-500">Chờ duyệt</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#D9DDE9]" />
              <span className="text-[12px] text-slate-500">Bảo trì</span>
            </div>
          </div>
        </section>

        <aside className="self-start rounded-[16px] bg-white p-3.5 shadow-[0_8px_24px_rgba(76,90,140,0.12)]">
          {detail ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[16px] font-extrabold text-slate-800">
                  {detail.tenSan}
                </h2>
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  className="text-[20px] leading-none text-slate-400"
                >
                  ×
                </button>
              </div>

              <img
                src={detail.hinhAnh || "https://images.unsplash.com/photo-1574629810360-7efbbe195018"}
                alt={detail.tenSan}
                className="mb-3 h-[96px] w-full rounded-[12px] object-cover"
              />

              <div className="space-y-2.5 text-sm">
                <p>
                  <span className="font-extrabold text-slate-800">Giá thuê:</span>{" "}
                  <span className="font-bold">{formatPrice(detail.giaThue)}đ / giờ</span>
                </p>

                <p>
                  <span className="font-extrabold text-slate-800">Loại sân:</span>{" "}
                  {detail.loaiSan}
                </p>

                <p>
                  <span className="font-extrabold text-slate-800">Vị trí:</span>{" "}
                  {detail.viTri || "Sân ngoài trời"}
                </p>

                <p>
                  <span className="font-extrabold text-slate-800">Ngày:</span>{" "}
                  {selectedDate}
                </p>

                <p>
                  <span className="font-extrabold text-slate-800">Giờ:</span>{" "}
                  {detail.khungGio}
                </p>
              </div>

              <button
                type="button"
                onClick={handleBooking}
                disabled={booking}
                className="mt-4 h-[38px] w-full rounded-xl bg-[#4169E1] text-[15px] font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                {booking ? "Đang xử lý..." : "Đặt sân"}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-[16px] font-extrabold text-slate-800 mb-3">
                Chi tiết sân
              </h2>
              <p className="text-sm text-slate-500">Chọn một sân để xem chi tiết</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default DatsanSV;
