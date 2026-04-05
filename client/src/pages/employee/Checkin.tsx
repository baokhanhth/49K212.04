import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import EmployeeLayout from '../../components/layout/EmployeeLayout';

// Mock data cho vé
const mockTickets = [
  {
    maDatSan: '#DS123',
    tenSinhVien: 'Nguyễn Văn A',
    san: 'Sân A',
    thoiGian: '20/03/2026 18:00 - 19:00',
    trangThai: 'Đã duyệt',
    diemUyTin: 85,
  },
  {
    maDatSan: '#DS124',
    tenSinhVien: 'Trần Thị B',
    san: 'Sân B',
    thoiGian: '21/03/2026 20:00 - 21:00',
    trangThai: 'Đã check-in',
    diemUyTin: 92,
  },
  {
    maDatSan: '#DS125',
    tenSinhVien: 'Lê Văn C',
    san: 'Sân C',
    thoiGian: '22/03/2026 15:00 - 16:00',
    trangThai: 'Chờ duyệt',
    diemUyTin: 78,
  },
];

const Checkin = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<any>(null);
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Xử lý khi quét QR thành công
  const handleScanSuccess = (decodedText: string) => {
    // Tìm vé trong mock data theo mã QR
    const ticket = mockTickets.find((t) => t.maDatSan === decodedText);
    
    if (ticket) {
      setScannedTicket(ticket);
      setShowScanner(false);
      setCheckinResult(null);
    } else {
      setCheckinResult({
        success: false,
        message: 'Không tìm thấy vé với mã này!',
      });
    }

    // Dừng scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  // Bắt đầu quét QR
  const startScanner = () => {
    setShowScanner(true);
    setScannedTicket(null);
    setCheckinResult(null);

    // Khởi tạo QR scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => handleScanSuccess(decodedText),
      (_error) => {
        // Ignore scan errors
      }
    );

    scannerRef.current = scanner;
  };

  // Đóng scanner
  const closeScanner = () => {
    setShowScanner(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  // Xử lý check-in
  const handleCheckin = () => {
    if (!scannedTicket) return;

    // Rule: Chỉ cho phép check-in nếu trạng thái là "Đã duyệt"
    if (scannedTicket.trangThai !== 'Đã duyệt') {
      setCheckinResult({
        success: false,
        message: `Vé này không thể check-in! Trạng thái hiện tại: ${scannedTicket.trangThai}`,
      });
      return;
    }

    // Giả lập check-in thành công
    setScannedTicket({
      ...scannedTicket,
      trangThai: 'Đã check-in',
      diemUyTin: scannedTicket.diemUyTin + 10,
    });

    setCheckinResult({
      success: true,
      message: 'Check-in thành công! Điểm uy tín +10',
    });

    // TODO: Gọi API để cập nhật trạng thái trên Backend
    // await api.checkinTicket({ maDatSan: scannedTicket.maDatSan });
  };

  // Reset để quét vé mới
  const resetScan = () => {
    setScannedTicket(null);
    setCheckinResult(null);
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <EmployeeLayout>
      <div className="px-7 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Check-in</h1>

        {/* Modal quét QR */}
        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">
                  Quét mã QR vé
                </h2>
                <button
                  onClick={closeScanner}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
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
              <div id="qr-reader" className="mb-4 overflow-hidden rounded-xl" />
              <p className="text-center text-sm text-slate-500">
                Đưa mã QR vào khung hình để quét
              </p>
            </div>
          </div>
        )}

        {/* Hiển thị thông tin vé sau khi quét */}
        {scannedTicket && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">
                Thông tin vé
              </h2>
              <button
                onClick={resetScan}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                Quét vé khác
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <span className="text-slate-600">Mã đặt sân:</span>
                <span className="font-semibold text-slate-800">
                  {scannedTicket.maDatSan}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <span className="text-slate-600">Tên sinh viên:</span>
                <span className="font-semibold text-slate-800">
                  {scannedTicket.tenSinhVien}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <span className="text-slate-600">Sân:</span>
                <span className="font-semibold text-slate-800">
                  {scannedTicket.san}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <span className="text-slate-600">Thời gian:</span>
                <span className="font-semibold text-slate-800">
                  {scannedTicket.thoiGian}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <span className="text-slate-600">Trạng thái:</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    scannedTicket.trangThai === 'Đã duyệt'
                      ? 'bg-blue-100 text-blue-700'
                      : scannedTicket.trangThai === 'Đã check-in'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {scannedTicket.trangThai}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                <span className="text-slate-600">Điểm uy tín:</span>
                <span className="font-semibold text-slate-800">
                  {scannedTicket.diemUyTin}
                </span>
              </div>
            </div>

            {/* Kết quả check-in */}
            {checkinResult && (
              <div
                className={`mt-4 rounded-xl p-4 ${
                  checkinResult.success
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {checkinResult.message}
              </div>
            )}

            {/* Nút check-in */}
            {scannedTicket.trangThai === 'Đã duyệt' && !checkinResult?.success && (
              <button
                onClick={handleCheckin}
                className="mt-4 w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Check-in
              </button>
            )}

            {/* Đã check-in thành công */}
            {scannedTicket.trangThai === 'Đã check-in' && checkinResult?.success && (
              <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-semibold">Đã check-in thành công!</span>
              </div>
            )}
          </div>
        )}

        {/* Màn hình ban đầu */}
        {!scannedTicket && !showScanner && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="mb-4 text-slate-600">
              Nhấn nút bên dưới để thực hiện check-in vé điện tử
            </p>
            <button
              onClick={startScanner}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Check-in
            </button>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default Checkin;
