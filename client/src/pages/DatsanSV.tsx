import { useMemo, useState } from 'react';

type SlotStatus = 'available' | 'booked' | 'pending' | 'maintenance';

interface Court {
  id: number;
  name: string;
  type: string;
  price: number;
  location: string;
  image: string;
}

interface TimeSlotRow {
  time: string;
  statuses: Record<number, SlotStatus>;
}

const courts: Court[] = [
  {
    id: 1,
    name: 'SÂN BÓNG ĐÁ 1',
    type: 'Bóng đá',
    price: 100000,
    location: 'Sân ngoài trời',
    image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    name: 'SÂN BÓNG ĐÁ 2',
    type: 'Bóng đá',
    price: 100000,
    location: 'Sân ngoài trời',
    image:
      'https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    name: 'SÂN BÓNG ĐÁ 3',
    type: 'Bóng đá',
    price: 100000,
    location: 'Sân ngoài trời',
    image:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
  },
];

const initialSlots: TimeSlotRow[] = [
  { time: '07:00 - 08:00', statuses: { 1: 'available', 2: 'booked', 3: 'available' } },
  { time: '08:00 - 09:00', statuses: { 1: 'pending', 2: 'available', 3: 'maintenance' } },
  { time: '09:00 - 10:00', statuses: { 1: 'available', 2: 'booked', 3: 'available' } },
  { time: '10:00 - 11:00', statuses: { 1: 'booked', 2: 'available', 3: 'maintenance' } },
  { time: '11:00 - 12:00', statuses: { 1: 'available', 2: 'available', 3: 'available' } },
  { time: '12:00 - 13:00', statuses: { 1: 'available', 2: 'booked', 3: 'available' } },
];

const statusMap: Record<SlotStatus, { label: string; className: string }> = {
  available: { label: 'Trống', className: 'bg-[#D9F1EA] text-[#2D8C72]' },
  booked: { label: 'Đã đặt', className: 'bg-[#F8DEDE] text-[#D36B6B]' },
  pending: { label: 'Chờ duyệt', className: 'bg-[#F7E8B8] text-[#C89B1D]' },
  maintenance: { label: 'Bảo trì', className: 'bg-[#E3E5EE] text-[#7C8499]' },
};

const DatsanSV: React.FC = () => {
  const [selectedCourtId, setSelectedCourtId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('01/03/2026');
  const [selectedClass, setSelectedClass] = useState<string>('20K01');
  const [selectedType, setSelectedType] = useState<string>('Bóng đá');
  const [filterOpen, setFilterOpen] = useState<boolean>(true);
  const [checkedTypes, setCheckedTypes] = useState<string[]>(['Bóng đá', 'Cầu lông']);

  const selectedCourt = courts.find((court) => court.id === selectedCourtId) || courts[0];
  const uniqueTypes = useMemo(() => ['Bóng đá', 'Cầu lông', 'Bóng rổ', 'Tennis'], []);
  const visibleCourts = useMemo(() => courts.slice(0, 3), []);

  const toggleType = (type: string) => {
    setCheckedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  };

  const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  return (
    <div className="h-full overflow-hidden bg-[#E9EDF5] px-4 py-2">
      <div className="mx-auto grid h-full max-w-[1140px] grid-cols-[1fr_280px] gap-3">
        <section className="flex min-h-0 flex-col">
          <h1 className="mb-2 text-[24px] font-extrabold text-slate-800">Đặt sân</h1>

          <div className="mb-2 rounded-[14px] bg-white px-4 py-2.5 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="mb-1 text-[11px] text-slate-400">Sinh viên</p>
                <p className="text-[13px] font-bold text-slate-800">Quang Minh</p>
              </div>

              <div>
                <label className="mb-1 block text-[11px] text-slate-400">Lớp</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-[34px] w-full rounded-lg border border-slate-200 px-3 text-[13px] text-slate-700 outline-none"
                >
                  <option>20K01</option>
                  <option>20K02</option>
                  <option>20K03</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] text-slate-400">Ngày</label>
                <div className="relative">
                  <input
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
                    {uniqueTypes.map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${
                          type === 'Cầu lông' ? 'bg-[#EEF3FF]' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checkedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="h-3.5 w-3.5 rounded"
                        />
                        <span
                          className={`text-[13px] ${
                            type === 'Cầu lông' ? 'text-[#4169E1]' : 'text-slate-700'
                          }`}
                        >
                          {type}
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
              {uniqueTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="min-h-0 overflow-hidden rounded-[16px] bg-white shadow-sm">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-[155px] border-b border-slate-100 px-4 py-2.5 text-left text-[14px] font-bold text-slate-800">
                    Thời gian
                  </th>

                  {visibleCourts.map((court) => (
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
                {initialSlots.map((slot) => (
                  <tr key={slot.time}>
                    <td className="border-b border-slate-100 px-4 py-2.5 text-[13px] text-slate-700">
                      {slot.time}
                    </td>

                    {visibleCourts.map((court) => {
                      const status = slot.statuses[court.id] || 'available';
                      const statusInfo = statusMap[status];

                      return (
                        <td
                          key={`${slot.time}-${court.id}`}
                          className="border-b border-l border-slate-100 px-3 py-2.5 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCourtId(court.id)}
                            className={`min-w-[82px] rounded-full px-3 py-1 text-[12px] font-medium ${statusInfo.className}`}
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
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-slate-800">
              {selectedCourt.name}
            </h2>
            <button type="button" className="text-[20px] leading-none text-slate-400">
              ×
            </button>
          </div>

          <img
            src={selectedCourt.image}
            alt={selectedCourt.name}
            className="mb-3 h-[96px] w-full rounded-[12px] object-cover"
          />

          <div className="space-y-2.5">
            <p className="text-[13px] text-slate-700">
              <span className="font-extrabold text-slate-800">Giá thuê:</span>{' '}
              <span className="font-bold">{formatPrice(selectedCourt.price)}đ / giờ</span>
            </p>

            <p className="text-[13px] text-slate-700">
              <span className="font-extrabold text-slate-800">Loại sân:</span>{' '}
              {selectedCourt.type}
            </p>

            <p className="text-[13px] text-slate-700">
              <span className="font-extrabold text-slate-800">Vị trí:</span>{' '}
              {selectedCourt.location}
            </p>
          </div>

          <button
            type="button"
            className="mt-4 h-[38px] w-full rounded-xl bg-[#4169E1] text-[15px] font-bold text-white shadow-sm transition hover:opacity-90"
          >
            Đặt sân
          </button>
        </aside>
      </div>
    </div>
  );
};

export default DatsanSV;