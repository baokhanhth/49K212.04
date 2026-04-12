import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { checkInApi } from '../../services/api';

const Checkin = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<any>(null);
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Xử lý khi quét QR thành công
  const handleScanSuccess = async (decodedText: string) => {
    // Dừng scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setShowScanner(false);
    setCheckinResult(null);

    // Parse mã đặt sân from QR
    const maDatSan = parseInt(decodedText, 10);
    if (isNaN(maDatSan)) {
      setCheckinResult({
        success: false,
        message: 'Mã QR không hợp lệ!',
      });
      return;
    }

    setLoadingTicket(true);
    try {
      const ticket = await checkInApi.getThongTinVe(maDatSan);
      setScannedTicket(ticket);
    } catch {
      setCheckinResult({
        success: false,
        message: 'Không tìm thấy vé với mã này!',
      });
    } finally {
      setLoadingTicket(false);
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
  const handleCheckin = async () => {
    if (!scannedTicket) return;

    try {
      const result = await checkInApi.checkIn(scannedTicket.maDatSan);
      setScannedTicket({
        ...scannedTicket,
        trangThai: result.trangThai || 'Đã check-in',
        diemUyTin: result.diemUyTin ?? scannedTicket.diemUyTin,
      });
      setCheckinResult({
        success: true,
        message: result.message || 'Check-in thành công!',
      });
    } catch (err: any) {
      setCheckinResult({
        success: false,
        message: err?.response?.data?.message || 'Check-in thất bại!',
      });
    }
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

        {/* Loading after scan */}
        {loadingTicket && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm text-center text-slate-500">
            Đang tải thông tin vé...
          </div>
        )}

        {/* Hiển thị thông tin vé sau khi quét */}
        {scannedTicket && !loadingTicket && (
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
