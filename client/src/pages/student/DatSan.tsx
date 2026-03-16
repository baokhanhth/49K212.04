import { useState, useRef, useEffect } from "react";
import StudentLayout from "../../components/layout/StudentLayout";

const sports = [
  "Bóng đá",
  "Cầu lông",
  "Bóng chuyền",
  "Bóng rổ",
  "Tennis",
  "Pickleball"
];

const fields = ["Sân 1", "Sân 2", "Sân 3"];

const times = [
  "06:00 - 07:00",
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00"
];

const statusList = ["Trống", "Đã đặt", "Chờ duyệt", "Bảo trì"];

const randomStatus = () => {
  return statusList[Math.floor(Math.random() * statusList.length)];
};

const statusColor = (s: string) => {
  if (s === "Trống") return "bg-[#DFF4ED] text-[#17A673]";
  if (s === "Đã đặt") return "bg-[#F9E0E0] text-[#E55353]";
  if (s === "Chờ duyệt") return "bg-[#FFF3CD] text-[#E0A800]";
  return "bg-[#E2E3E5] text-[#6C757D]";
};

const DatSan = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSports, setSelectedSports] = useState(["Bóng đá", "Cầu lông"]);
  const [detail, setDetail] = useState<any>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleBooking = () => {
    alert("Đã đặt sân thành công, vui lòng kiểm tra lịch sử đặt sân");
    setDetail(null);
  };

  return (
    <StudentLayout>
      <div className="px-7 py-8 flex gap-6">

        {/* MAIN CONTENT */}
        <div className="flex-1">

          <h1 className="text-2xl font-semibold text-slate-800 mb-6">
            Đặt sân
          </h1>

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
              <input type="date" className="border rounded px-3 py-1" />
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
                {sports.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(s)}
                      onChange={() => toggleSport(s)}
                      className="accent-blue-600"
                    />
                    {s}
                  </label>
                ))}
              </div>
            )}

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow overflow-auto">

            <table className="w-full text-center">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Thời gian</th>

                  {sports.map((s) => {
                    if (!selectedSports.includes(s)) return null;

                    return fields.map((f) => (
                      <th key={s + f} className="p-4">
                        {f}
                        <div className="text-xs text-gray-400">{s}</div>
                      </th>
                    ));
                  })}
                </tr>
              </thead>

              <tbody>
                {times.map((time) => (
                  <tr key={time} className="border-t">

                    <td className="p-4">{time}</td>

                    {sports.map((s) => {
                      if (!selectedSports.includes(s)) return null;

                      return fields.map((f, i) => {
                        const st = randomStatus();

                        return (
                          <td key={time + s + i} className="p-4">

                            <span
                              onClick={() => {
                                if (st === "Trống") {
                                  setDetail({
                                    sport: s,
                                    field: f,
                                    time: time
                                  });
                                }
                              }}
                              className={`${statusColor(st)} px-3 py-1 rounded-full text-sm cursor-pointer`}
                            >
                              {st}
                            </span>

                          </td>
                        );
                      });
                    })}

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          {/* LEGEND */}
          <div className="flex gap-6 mt-4 text-sm">

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#17A673] rounded-full"></span>
              Trống
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#E55353] rounded-full"></span>
              Đã đặt
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#E0A800] rounded-full"></span>
              Chờ duyệt
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#6C757D] rounded-full"></span>
              Bảo trì
            </div>

          </div>

        </div>

        {/* MODAL OVERLAY */}
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
                SÂN {detail.sport.toUpperCase()} {detail.field.replace("Sân ", "")}
              </h2>

              <img
                src="https://images.unsplash.com/photo-1599058917212-d750089bc07e"
                className="mb-4 h-48 w-full rounded-lg object-cover"
              />

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
                    <p className="text-gray-400">Mã đặt sân</p>
                    <p>BS001234</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Ngày</p>
                    <p>01/03/2026</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Sân</p>
                    <p>{detail.field}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Thời gian</p>
                    <p>{detail.time}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Giá tiền</p>
                    <p>100,000 VNĐ</p>
                  </div>

                </div>

                <div className="mt-6 flex gap-3">

                  <button
                    onClick={handleBooking}
                    className="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Đặt
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