import { useEffect, useState } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import { veDienTuApi, getStoredUser } from '../../services/api';

interface VeItem {
  maVe: string;
  maDatSan: number;
  qrCode: string;
  trangThaiVe: string;
  qrHopLe: boolean;
  tenSan: string;
  loaiSan: string;
  ngayApDung: string;
  khungGio: string;
  tongTien: number;
  thoiGianCheckIn: string | null;
  thoiGianCheckOut: string | null;
}

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  'Chưa check-in': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  'Đã Check-in': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  'Đã thanh toán': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  'Hoàn thành': { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-500' },
  'No-show': { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-500' },
};

const fmtMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + 'đ';

const VeCuaToi = () => {
  const user = getStoredUser();
  const userId = user?.userId;

  const [ves, setVes] = useState<VeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VeItem | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchVes = async () => {
      try {
        const data = await veDienTuApi.getByUserId(userId);
        setVes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setVes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVes();
  }, [userId]);

  // ================= HANDLERS =================
  const handleChiTiet = async (ve: VeItem) => {
    setSelected(ve);
    setQrImage(null);

    if (!ve.qrHopLe) return;

    setLoadingQr(true);
    try {
      const data = await veDienTuApi.getChiTiet(ve.maVe);
      setQrImage(data?.qrImage ?? null);
    } catch (error) {
      console.error(error);
      setQrImage(null);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSaveQr = () => {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `QR-${selected?.maVe}.png`;
    link.click();
  };

  const getStatus = (trangThai: string) =>
    statusStyle[trangThai] ?? {
      bg: 'bg-gray-50',
      text: 'text-gray-500',
      dot: 'bg-gray-400',
    };

  // ================= UI =================
  return (
    <StudentLayout>
      <div className="px-7 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">
          🎟 Vé của tôi
        </h1>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20 text-slate-400">
            🔄 Đang tải vé...
          </div>
        )}

        {/* Empty */}
        {!loading && ves.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
            <span className="mb-3 text-5xl">🎫</span>
            <p className="mb-4 text-lg font-semibold text-slate-600">
              Bạn chưa có vé nào
            </p>

            <a
              href="/student/dat-san"
              className="rounded-xl bg-[#4169E1] px-6 py-2.5 text-sm font-bold text-white shadow hover:opacity-90"
            >
              Đặt sân ngay
            </a>
          </div>
        )}

        {/* List */}
        {!loading && ves.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ves.map((ve) => {
              const s = getStatus(ve.trangThaiVe);

              return (
                <div
                  key={ve.maVe}
                  onClick={() => handleChiTiet(ve)}
                  className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-3 flex justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">
                        Mã đặt sân
                      </p>
                      <p className="text-[13px] font-bold text-slate-800">
                        #{ve.maDatSan}
                      </p>
                    </div>

                    <span
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${s.dot}`}
                      />
                      {ve.trangThaiVe}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-slate-700">
                    <p><b>Sân:</b> {ve.tenSan}</p>
                    <p><b>Loại:</b> {ve.loaiSan}</p>
                    <p><b>Ngày:</b> {ve.ngayApDung}</p>
                    <p><b>Giờ:</b> {ve.khungGio}</p>
                    <p><b>Tổng tiền:</b> {fmtMoney(ve.tongTien)}</p>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                        ve.qrHopLe
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-500'
                      }`}
                    >
                      {ve.qrHopLe ? '✅ QR hợp lệ' : '❌ QR lỗi'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex justify-between">
              <h2 className="text-lg font-bold">Chi tiết vé</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="mb-4 flex flex-col items-center">
              {selected.qrHopLe ? (
                loadingQr ? (
                  <div className="h-40 w-40 flex items-center justify-center">
                    🔄
                  </div>
                ) : qrImage ? (
                  <img
                    src={qrImage}
                    alt="QR"
                    className="h-44 w-44 rounded-xl border p-2"
                  />
                ) : null
              ) : (
                <div className="h-40 w-40 flex items-center justify-center bg-gray-100 rounded-xl">
                  🚫
                </div>
              )}
            </div>

            {selected.qrHopLe && qrImage && (
              <button
                onClick={handleSaveQr}
                className="w-full bg-blue-600 text-white py-2 rounded-xl"
              >
                Lưu QR
              </button>
            )}
          </div>
        </div>
      )}
    </StudentLayout>
  );
};


export default VeCuaToi;