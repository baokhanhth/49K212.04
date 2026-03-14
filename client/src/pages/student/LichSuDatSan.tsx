import { useMemo, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";


interface Booking {
  san: string;
  sub: string;
  ngay: string;
  gio: string;
  trangthai: string;
  color: string;
}


const bookings: Booking[] = [
  {
    san: "Sân Bóng Đá A",
    sub: "Sân Bóng Đá A",
    ngay: "01/04/2026",
    gio: "07:00 - 08:00",
    trangthai: "Đã duyệt",
    color: "bg-emerald-500",
  },
  {
    san: "Sân Tennis A",
    sub: "Sân Tennis A",
    ngay: "30/03/2026",
    gio: "15:00 - 16:00",
    trangthai: "Không check-in",
    color: "bg-red-500",
  },
  {
    san: "Sân Cầu Lông C",
    sub: "Sân Cầu Lông C",
    ngay: "25/03/2026",
    gio: "18:00 - 19:00",
    trangthai: "Chờ duyệt",
    color: "bg-blue-500",
  },
  {
    san: "Sân Bóng Đá A",
    sub: "Sân Bóng Đá A",
    ngay: "15/03/2026",
    gio: "17:00 - 18:00",
    trangthai: "Đã duyệt",
    color: "bg-emerald-500",
  },
  {
    san: "Sân Bóng Rổ B",
    sub: "Sân Bóng Rổ B",
    ngay: "12/03/2026",
    gio: "09:00 - 10:00",
    trangthai: "Đã hủy",
    color: "bg-gray-400",
  },
];


const LichSuDatSan = () => {
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");


  const statusOptions = [
    "Tất cả",
    "Đã duyệt",
    "Không check-in",
    "Chờ duyệt",
    "Đã hủy",
  ];


  const filteredBookings = useMemo(() => {
    if (selectedStatus === "Tất cả") return bookings;
    return bookings.filter((b) => b.trangthai === selectedStatus);
  }, [selectedStatus]);


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
              {filteredBookings.map((b, i) => (
                <tr key={i} className="border-b">
                  <td className="py-4">
                    <div className="font-semibold">{b.san}</div>
                    <div className="text-sm text-gray-400">{b.sub}</div>
                  </td>


                  <td>{b.ngay}</td>
                  <td>{b.gio}</td>


                  <td>
                    <span
                      className={`${b.color} text-white px-4 py-1 rounded-full text-sm`}
                    >
                      {b.trangthai}
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