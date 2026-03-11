import { useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

interface BookingRequest {
  id: number;
  studentName: string;
  avatar: string;
  courtName: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockRequests: BookingRequest[] = [
  {
    id: 1,
    studentName: 'Quang Minh',
    avatar: 'https://i.pravatar.cc/100?img=12',
    courtName: 'Sân cầu lông A',
    date: '04/04/2026',
    time: '07:00 - 08:00',
    status: 'pending',
  },
  {
    id: 2,
    studentName: 'Thảo Vy',
    avatar: 'https://i.pravatar.cc/100?img=32',
    courtName: 'Sân Bóng Đá B',
    date: '04/04/2026',
    time: '09:00 - 10:00',
    status: 'pending',
  },
  {
    id: 3,
    studentName: 'Đại Nghĩa',
    avatar: 'https://i.pravatar.cc/100?img=15',
    courtName: 'Sân Tennis A',
    date: '04/04/2026',
    time: '15:00 - 16:00',
    status: 'pending',
  },
];

const statusOptions = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' },
];

const eventOptions = [
  'Giải bóng đá khoa CNTT',
  'Giải cầu lông sinh viên',
  'Hội thao truyền thống',
];

const creatorOptions = ['Quang Minh', 'Thảo Vy', 'Đại Nghĩa'];
const courtOptions = ['Sân bóng đá 1', 'Sân bóng đá 2', 'Sân cầu lông A', 'Sân Tennis A'];
const timeOptions = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const DuyetDatSan = () => {
  const [requests, setRequests] = useState<BookingRequest[]>(mockRequests);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [eventName, setEventName] = useState<string>('Giải bóng đá khoa CNTT');
  const [creator, setCreator] = useState<string>('Quang Minh');
  const [court, setCourt] = useState<string>('Sân bóng đá 1');
  const [date, setDate] = useState<string>('01/03/2026');
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('08:00');

  const filteredRequests = useMemo(() => {
    if (selectedStatus === 'all') return requests;
    return requests.filter((item) => item.status === selectedStatus);
  }, [requests, selectedStatus]);

  const handleApprove = (id: number) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'approved' } : item
      )
    );
  };

  const handleReject = (id: number) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'rejected' } : item
      )
    );
  };

  const handleCreateManualBooking = () => {
    alert(
      `Đã tạo lịch thủ công\nSự kiện: ${eventName}\nNgười tạo lịch: ${creator}\nSân: ${court}\nNgày: ${date}\nGiờ: ${startTime} - ${endTime}`
    );
    setShowModal(false);
  };

  const getStatusBadge = (status: BookingRequest['status']) => {
    if (status === 'approved') {
      return (
        <span className="rounded-full bg-[#D9F1EA] px-3 py-1 text-sm font-medium text-[#2D8C72]">
          Đã duyệt
        </span>
      );
    }

    if (status === 'rejected') {
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
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-6 py-4 text-left text-base font-medium text-slate-500">
                  Sinh viên
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
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.avatar}
                        alt={item.studentName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-base font-semibold text-slate-800">
                          {item.studentName}
                        </p>
                        <div className="mt-1">{getStatusBadge(item.status)}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-base text-slate-700">
                    {item.courtName}
                  </td>

                  <td className="px-6 py-4 text-base text-slate-700">
                    {item.date}
                  </td>

                  <td className="px-6 py-4 text-base text-slate-700">
                    {item.time}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="rounded-xl bg-[#4169E1] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Duyệt
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(item.id)}
                        className="rounded-xl bg-[#FF2D2D] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-base text-slate-500"
                  >
                    Không có yêu cầu đặt sân phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  Sự kiện
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Nhập tên sự kiện..."
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none"
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Người tạo lịch
                  </label>
                  <p className="h-12 flex items-center rounded-xl border border-slate-200 px-4 text-base font-semibold text-slate-700">
                    {creator}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Sân
                  </label>
                  <select
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-700 outline-none"
                  >
                    {courtOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-[1.3fr_1fr_1fr] gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Ngày
                  </label>
                  <div className="relative">
                    <input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-10 text-base text-slate-700 outline-none"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          
                    </span>
                  </div>
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
