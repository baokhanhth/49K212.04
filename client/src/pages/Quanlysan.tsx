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
    name: 'Sân bóng đá 1',
    type: 'Bóng đá',
    price: 100000,
    location: 'Sân ngoài trời',
    image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    name: 'Sân bóng đá 2',
    type: 'Bóng đá',
    price: 100000,
    location: 'Sân ngoài trời',
    image:
      'https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    name: 'Sân bóng đá 3',
    type: 'Bóng đá',
    price: 100000,
    location: 'Sân ngoài trời',
    image:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    name: 'Sân cầu lông A',
    type: 'Cầu lông',
    price: 80000,
    location: 'Nhà thi đấu',
    image:
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    name: 'Sân tennis B',
    type: 'Tennis',
    price: 120000,
    location: 'Khu thể thao B',
    image:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    name: 'Sân bóng rổ C',
    type: 'Bóng rổ',
    price: 90000,
    location: 'Nhà thi đấu',
    image:
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80',
  },
];

const buildTimeSlots = (): TimeSlotRow[] => {
  const rows: TimeSlotRow[] = [];

  for (let hour = 6; hour < 20; hour++) {
    const nextHour = hour + 1;
    const label = `${String(hour).padStart(2, '0')}:00 - ${String(nextHour).padStart(2, '0')}:00`;

    rows.push({
      time: label,
      statuses: {
        1: hour % 4 === 0 ? 'booked' : hour % 5 === 0 ? 'pending' : 'available',
        2: hour % 3 === 0 ? 'maintenance' : hour % 2 === 0 ? 'available' : 'booked',
        3: hour % 4 === 1 ? 'booked' : 'available',
        4: hour % 5 === 2 ? 'pending' : 'available',
        5: hour % 4 === 2 ? 'maintenance' : 'available',
        6: hour % 3 === 1 ? 'booked' : 'available',
      },
    });
  }

  return rows;
};

const initialSlots = buildTimeSlots();

const statusMap: Record<SlotStatus, { label: string; className: string }> = {
  available: {
    label: 'Trống',
    className: 'bg-[#D9F1EA] text-[#2D8C72]',
  },
  booked: {
    label: 'Đã đặt',
    className: 'bg-[#F8DEDE] text-[#D36B6B]',
  },
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-[#F7E8B8] text-[#C89B1D]',
  },
  maintenance: {
    label: 'Bảo trì',
    className: 'bg-[#E3E5EE] text-[#7C8499]',
  },
};

const DatsanSV: React.FC = () => {
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('01/03/2026');
  const [selectedClass, setSelectedClass] = useState<string>('20K01');
  const [selectedType, setSelectedType] = useState<string>('Bóng đá');
  const [showCourtList, setShowCourtList] = useState<boolean>(false);

  const uniqueTypes = useMemo(
    () => [...new Set(courts.map((court) => court.type))],
    []
  );

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => court.type === selectedType);
  }, [selectedType]);

  const selectedCourt = useMemo(() => {
    return courts.find((court) => court.id === selectedCourtId) || null;
  }, [selectedCourtId]);

  const visibleCourts = useMemo(() => {
    if (filteredCourts.length >= 3) return filteredCourts.slice(0, 3);
    return filteredCourts;
  }, [filteredCourts]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleChooseCourt = (courtId: number) => {
    setSelectedCourtId(courtId);
    setShowCourtList(false);
  };

  const handleBook = () => {
    if (!selectedCourt) return;
    alert(`Đặt sân: ${selectedCourt.name}`);
  };

  return (
    <div className="h-full overflow-hidden bg-[#E9EDF5] px-4 py-3">
      <div
        className={`mx-auto grid h-full max-w-[1200px] gap-4 ${
          selectedCourt ? 'grid-cols-[1fr_300px]' : 'grid-cols-1'
        }`}
      >
        <section className="flex min-h-0 flex-col">
          <h1 className="mb-2 text-[28px] font-extrabold text-slate-800">
            Đặt sân
          </h1>

          <div className="mb-3 rounded-[16px] bg-white px-4 py-3 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="mb-1 text-[12px] text-slate-400">Sinh viên</p>
                <p className="text-[14px] font-bold text-slate-800">Quang Minh</p>
              </div>

              <div>
                <label className="mb-1 block text-[12px] text-slate-400">Lớp</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="h-[38px] w-full rounded-lg border border-slate-200 px-3 text-[14px] text-slate-700 outline-none"
                >
                  <option>20K01</option>
                  <option>20K02</option>
                  <option>20K03</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[12px] text-slate-400">Ngày</label>
                <div className="relative">
                  <input
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-[38px] w-full rounded-lg border border-slate-200 px-3 pr-9 text-[14px] text-slate-700 outline-none"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-500">
                    🗓
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 flex items-start gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCourtList((prev) => !prev)}
                className="flex h-[40px] min-w-[150px] items-center justify-between rounded-lg bg-[#4169E1] px-4 text-[14px] font-medium text-white shadow-sm"
              >
                <span>Lọc loại sân</span>
                <span>⌄</span>
              </button>
            </div>

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setShowCourtList(true);
              }}
              className="h-[40px] min-w-[120px] rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-700 outline-none"
            >
              {uniqueTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          {showCourtList && (
            <div className="mb-3 w-[260px] rounded-[16px] bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3 text-[13px] font-medium text-slate-500">
                Tên sân
              </div>

              <div className="max-h-[220px] overflow-y-auto">
                {filteredCourts.map((court) => {
                  const active = selectedCourtId === court.id;

                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => handleChooseCourt(court.id)}
                      className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        active ? 'bg-[#EEF3FF]' : ''
                      }`}
                    >
                      <img
                        src={court.image}
                        alt={court.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <span className="text-[15px] text-slate-700">{court.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden rounded-[18px] bg-white shadow-sm">
            <div className="h-full overflow-y-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th className="w-[170px] border-b border-slate-100 px-4 py-3 text-left text-[15px] font-bold text-slate-800">
                      Thời gian
                    </th>

                    {visibleCourts.map((court) => (
                      <th
                        key={court.id}
                        className="min-w-[135px] border-b border-l border-slate-100 px-3 py-3 text-center"
                      >
                        <div className="text-[14px] font-bold text-slate-700">
                          {court.name.replace('Sân bóng đá ', 'Sân ')}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {court.type}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {initialSlots.map((slot) => (
                    <tr key={slot.time}>
                      <td className="border-b border-slate-100 px-4 py-3 text-[13px] text-slate-700">
                        {slot.time}
                      </td>

                      {visibleCourts.map((court) => {
                        const status = slot.statuses[court.id] || 'available';
                        const statusInfo = statusMap[status];

                        return (
                          <td
                            key={`${slot.time}-${court.id}`}
                            className="border-b border-l border-slate-100 px-3 py-3 text-center"
                          >
                            <button
                              type="button"
                              onClick={() => handleChooseCourt(court.id)}
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

        {selectedCourt && (
          <aside className="self-start rounded-[16px] bg-white p-3.5 shadow-[0_8px_24px_rgba(76,90,140,0.12)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-slate-800 uppercase">
                {selectedCourt.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedCourtId(null)}
                className="text-[20px] leading-none text-slate-400"
              >
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
              onClick={handleBook}
              className="mt-4 h-[38px] w-full rounded-xl bg-[#4169E1] text-[15px] font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Đặt sân
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DatsanSV;