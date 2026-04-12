import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { datSanApi, sanBaiApi, getStoredUser } from '../../services/api';
import type { DatSan, SanBai } from '../../types';

const statusOptions = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ duyệt', value: 'Chờ duyệt' },
  { label: 'Đã duyệt', value: 'Đã duyệt' },
  { label: 'Bị từ chối', value: 'Bị từ chối' },
];

const timeOptions = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
];

const DuyetDatSan = () => {
  const [requests, setRequests] = useState<DatSan[]>([]);
  const [sanList, setSanList] = useState<SanBai[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Manual booking form state
  const [manualUserId, setManualUserId] = useState<number>(1);
  const [manualMaSan, setManualMaSan] = useState<number>(0);
  const [manualDate, setManualDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('08:00');

  useEffect(() => {
    Promise.all([datSanApi.getAll(), sanBaiApi.getAll()])
      .then(([datSanData, sanData]) => {
        setRequests(Array.isArray(datSanData) ? datSanData : []);
        const sArr = Array.isArray(sanData) ? sanData : [];
        setSanList(sArr);
        if (sArr.length > 0) setManualMaSan(sArr[0].maSan);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredRequests = useMemo(() => {
    if (selectedStatus === 'all') return requests;
    return requests.filter((item) => item.trangThai === selectedStatus);
  }, [requests, selectedStatus]);

  const handleApprove = async (id: number) => {
    try {
      const adminUser = getStoredUser();
      const updated = await datSanApi.duyet(id, {
        trangThai: 'Đã duyệt',
        nguoiDuyet: adminUser?.userId || 0,
      });
      setRequests((prev) =>
        prev.map((item) => (item.maDatSan === id ? { ...item, ...updated } : item))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const adminUser = getStoredUser();
      const updated = await datSanApi.duyet(id, {
        trangThai: 'Bị từ chối',
        nguoiDuyet: adminUser?.userId || 0,
      });
      setRequests((prev) =>
        prev.map((item) => (item.maDatSan === id ? { ...item, ...updated } : item))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Từ chối thất bại');
    }
  };

  const handleCreateManualBooking = async () => {
    try {
      const { default: api } = await import('../../services/api');
      await api.post('/dat-san/thu-cong', {
        userId: manualUserId,
        maSan: manualMaSan,
        ngayApDung: manualDate,
        gioBatDau: startTime + ':00',
        gioKetThuc: endTime + ':00',
      });
      alert('Tạo lịch đặt sân thủ công thành công');
      setShowModal(false);
      const data = await datSanApi.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Tạo lịch thủ công thất bại');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Đã duyệt') {
      return (
        <span className="rounded-full bg-[#D9F1EA] px-3 py-1 text-sm font-medium text-[#2D8C72]">
          Đã duyệt
        </span>
      );
    }
    if (status === 'Bị từ chối') {
      return (
        <span className="rounded-full bg-[#F8DEDE] px-3 py-1 text-sm font-medium text-[#D36B6B]">
          Từ chối
        </span>
      );
    }
    return (
      <span className="rounded-full bg-[#F7E8B8] px-3 py-1 text-sm font-medium text-[#C89B1D]">
        Chờ duyệt
      </span>
    );
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <AdminLayout>
      <div className="px-7 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Duyệt yêu cầu đặt sân</h1>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex h-12 min-w-[260px] items-center gap-3 rounded-2xl bg-white px-4 shadow-sm">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-base text-slate-700 outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-[#4169E1] px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Thêm lịch thủ công
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-base text-slate-500">Đang tải...</div>
          ) : (
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-6 py-4 text-left text-base font-medium text-slate-500">
                  Mã đặt sân
                </th>
                <th className="px-6 py-4 text-left text-base font-medium text-slate-500">
                  Sân
                </th>
                <th className="px-6 py-4 text-left text-base font-medium text-slate-500">
                  Ngày
                </th>
                <th className="px-6 py-4 text-left text-base font-medium text-slate-500">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-left text-base font-medium text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-base font-medium text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((item) => (
                <tr key={item.maDatSan} className="border-t border-slate-100">
                  <td className="px-6 py-4 text-base text-slate-700">
                    #{item.maDatSan}
                  </td>

                  <td className="px-6 py-4 text-base text-slate-700">
                    {item.lichSan?.sanBai?.tenSan || `Lịch #${item.maLichSan}`}
                  </td>

                  <td className="px-6 py-4 text-base text-slate-700">
                    {item.lichSan?.ngayApDung ? formatDate(item.lichSan.ngayApDung) : formatDate(item.ngayDat)}
                  </td>

                  <td className="px-6 py-4 text-base text-slate-700">
                    {item.lichSan
                      ? `${item.lichSan.gioBatDau?.substring(0, 5)} - ${item.lichSan.gioKetThuc?.substring(0, 5)}`
                      : '-'}
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(item.trangThai)}
                  </td>

                  <td className="px-6 py-4">
                    {item.trangThai === 'Chờ duyệt' ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.maDatSan)}
                        className="rounded-xl bg-[#4169E1] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Duyệt
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(item.maDatSan)}
                        className="rounded-xl bg-[#FF2D2D] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Từ chối
                      </button>
                    </div>
                    ) : (
                      <span className="text-sm text-slate-400">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-base text-slate-500"
                  >
                    Không có yêu cầu đặt sân phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-800">
                Tạo lịch đặt sân thủ công
              </h2>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-2xl text-slate-400 transition hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <div className="rounded-2xl bg-white">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  User ID
                </label>
                <input
                  type="number"
                  value={manualUserId}
                  onChange={(e) => setManualUserId(Number(e.target.value))}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Sân
                </label>
                <select
                  value={manualMaSan}
                  onChange={(e) => setManualMaSan(Number(e.target.value))}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none"
                >
                  {sanList.map((s) => (
                    <option key={s.maSan} value={s.maSan}>
                      {s.tenSan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 grid grid-cols-[1.3fr_1fr_1fr] gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Giờ bắt đầu
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none"
                  >
                    {timeOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Giờ kết thúc
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none"
                  >
                    {timeOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-slate-100 px-6 py-3 text-base font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleCreateManualBooking}
                  className="rounded-xl bg-[#4169E1] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
                >
                  Tạo lịch đặt sân
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DuyetDatSan;
