import { useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";


const mockTickets = [
  {
    id: 1,
    code: "#DS123",
    field: "Sân A",
    time: "18:00 - 19:00",
    date: "20/03/2026",
    status: "Đã duyệt",
    name: "Nguyễn Văn A",
    price: "200.000đ",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DS123",
  },
  {
    id: 2,
    code: "#DS124",
    field: "Sân B",
    time: "20:00 - 21:00",
    date: "21/03/2026",
    status: "Đã Check-in",
    name: "Nguyễn Văn A",
    price: "250.000đ",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DS124",
  },
  {
    id: 3,
    code: "#DS125",
    field: "Sân C",
    time: "15:00 - 16:00",
    date: "22/03/2026",
    status: "Đã thanh toán",
    name: "Nguyễn Văn A",
    price: "180.000đ",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DS125",
  },
  {
    id: 4,
    code: "#DS126",
    field: "Sân A",
    time: "17:00 - 18:00",
    date: "23/03/2026",
    status: "Hoàn thành",
    name: "Nguyễn Văn A",
    price: "200.000đ",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DS126",
  },
  {
    id: 5,
    code: "#DS127",
    field: "Sân D",
    time: "19:00 - 20:00",
    date: "24/03/2026",
    status: "Đã hủy",
    name: "Nguyễn Văn A",
    price: "300.000đ",
    qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DS127",
  },
];


const VeCuaToi = () => {
  const [tickets] = useState(mockTickets);
  const [selected, setSelected] = useState<any>(null);


  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Đã duyệt":
        return "Chưa check-in";
      case "Đã Check-in":
        return "Đã Check-in";
      case "Đã thanh toán":
        return "Đã thanh toán";
      case "Hoàn thành":
        return "Hoàn thành";
      case "No-show":
        return "No-show";
      case "Đã hủy":
        return "No-show";
      default:
        return status;
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã duyệt":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Đã Check-in":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Đã thanh toán":
        return "bg-green-100 text-green-700 border-green-200";
      case "Hoàn thành":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "No-show":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Đã hủy":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };


 
  const isQRUsable = (status: string) => {
    return status === "Đã duyệt";
  };


  return (
    <StudentLayout>
      <div className="px-7 py-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Vé của tôi
            </h1>
            <p className="text-slate-500">
              Quản lý và xem thông tin các vé đặt sân của bạn
            </p>
          </div>


          {/* Tickets List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* EMPTY STATE */}
            {tickets.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 mb-4">
                  Bạn chưa có vé nào.
                </p>
                <button
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                  onClick={() => (window.location.href = "/student/dat-san")}
                >
                  Đặt sân ngay!
                </button>
              </div>
            )}


            {/* LIST */}
            {tickets.length > 0 && (
              <div className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-lg text-slate-800">
                            {t.code}
                          </span>
                        </div>


                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-700">{t.field}</span>
                        </div>


                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <span>{t.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{t.time}</span>
                          </div>
                        </div>
                      </div>


                      <div className="flex items-center gap-3">
                        <img
                          src={t.qr}
                          alt="qr"
                          className={`w-14 h-14 rounded-lg border-2 transition-colors ${
                            isQRUsable(t.status)
                              ? "border-slate-200 group-hover:border-blue-300"
                              : "border-slate-200 opacity-30 grayscale"
                          }`}
                        />
                        <svg
                          className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* MODAL CHI TIẾT */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Chi tiết vé</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 text-2xl font-bold">{selected.code}</div>
              <div
                className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium`}
              >
                {getStatusDisplay(selected.status)}
              </div>
            </div>


            {/* Modal Body */}
            <div className="p-6">
              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className={`relative ${!isQRUsable(selected.status) ? "opacity-30 grayscale" : ""}`}>
                  <img
                    src={selected.qr}
                    className="w-48 h-48 rounded-2xl border-4 border-slate-100 shadow-lg"
                  />
                  {!isQRUsable(selected.status) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl">
                      <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-xl">
                        QR không sử dụng được
                      </span>
                    </div>
                  )}
                </div>
              </div>


              {/* Ticket Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tên sinh viên</span>
                  <span className="font-medium text-slate-800">{selected.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Sân</span>
                  <span className="font-medium text-slate-800">{selected.field}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Thời gian</span>
                  <span className="font-medium text-slate-800">{selected.date} {selected.time}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Trạng thái</span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      selected.status
                    )}`}
                  >
                    {getStatusDisplay(selected.status)}
                  </span>
                </div>
              </div>


              {/* Actions */}
              <div className="space-y-3">
                <button
                  disabled={!isQRUsable(selected.status)}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    isQRUsable(selected.status)
                      ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Lưu QR code
                </button>
                <button
                  className="w-full py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                  onClick={() => setSelected(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};


export default VeCuaToi;



