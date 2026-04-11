import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { lichSanApi, sanBaiApi } from '../../services/api';
import type { SanBai } from '../../types';


interface ClosedDay {
  date: string;
  dayNumber: number;
  weekday: string;
  status: 'open' | 'closed' | 'today';
}

const COURT_ALL_VALUE = 'all';

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const getWeekStart = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(0, 0, 0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const formatDisplayDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDisplayDate = (text: string) => {
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getWeekDays = (weekStart: Date, openDates: Set<string>) => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const iso = toIsoDate(date);
    const isToday = iso === toIsoDate(new Date());
    return {
      date: iso,
      dayNumber: date.getDate(),
      weekday: WEEKDAY_LABELS[date.getDay()],
      status: isToday ? 'today' : openDates.has(iso) ? 'open' : 'closed',
    } as ClosedDay;
  });
};

const CauHinhSanBai: React.FC = () => {
  const [maxAdvanceDays, setMaxAdvanceDays] = useState<number>(7);
  const [days, setDays] = useState<ClosedDay[]>([]);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedCourtId, setSelectedCourtId] = useState<string>(COURT_ALL_VALUE);
  const [courts, setCourts] = useState<SanBai[]>([]);
  const [loadingCourts, setLoadingCourts] = useState<boolean>(true);
  const [weekStart] = useState<Date>(() => getWeekStart(new Date()));

  const loadCourts = useCallback(async () => {
    try {
      const data = await sanBaiApi.getAll();
      setCourts(Array.isArray(data) ? data : []);
    } catch {
      setCourts([]);
    } finally {
      setLoadingCourts(false);
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const tuNgay = toIsoDate(weekStart);
      const denNgay = toIsoDate(addDays(weekStart, 6));
      const params = {
        maSan: selectedCourtId === COURT_ALL_VALUE ? undefined : Number(selectedCourtId),
        tuNgay,
        denNgay,
      };
      const data = await lichSanApi.getAll(params);
      const dates = Array.isArray(data)
        ? data.map((item) => item.ngayApDung)
        : [];
      setDays(getWeekDays(weekStart, new Set(dates)));
    } catch {
      setDays(getWeekDays(weekStart, new Set()));
    }
  }, [selectedCourtId, weekStart]);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    const saved = localStorage.getItem('cau-hinh-san-bai-maxAdvanceDays');
    if (saved) {
      const value = Number(saved);
      if (!Number.isNaN(value) && value > 0) {
        setMaxAdvanceDays(value);
      }
    }
  }, []);

  const courtOptions = useMemo(() => {
    return [{ value: COURT_ALL_VALUE, label: 'Tất cả các sân' }].concat(
      courts.map((court) => ({ value: String(court.maSan), label: court.tenSan })),
    );
  }, [courts]);

  const selectedCourtLabel = useMemo(() => {
    if (selectedCourtId === COURT_ALL_VALUE) return 'Tất cả các sân';
    return courts.find((court) => court.maSan === Number(selectedCourtId))?.tenSan ?? 'Sân chưa chọn';
  }, [selectedCourtId, courts]);

  const weekLabel = useMemo(() => {
    return `Tuần: ${formatDisplayDate(weekStart)} - ${formatDisplayDate(addDays(weekStart, 6))}`;
  }, [weekStart]);


  const handleDecrease = () => {
    setMaxAdvanceDays((prev) => (prev > 1 ? prev - 1 : 1));
  };


  const handleIncrease = () => {
    setMaxAdvanceDays((prev) => prev + 1);
  };


  const handleToggleDay = async (dayNumber: number) => {
    const day = days.find((item) => item.dayNumber === dayNumber);
    if (!day || day.status === 'today') return;

    const isOpening = day.status === 'closed';
    const targetCourts = selectedCourtId === COURT_ALL_VALUE
      ? courts
      : courts.filter((court) => court.maSan === Number(selectedCourtId));

    if (targetCourts.length === 0) {
      alert('Không tìm thấy sân để cập nhật.');
      return;
    }

    try {
      const promises = targetCourts.map(async (court) => {
        if (isOpening) {
          return lichSanApi.toggle({
            maSan: court.maSan,
            ngayApDung: day.date,
            danhSachKhungGio: [
              { gioBatDau: '06:00:00', gioKetThuc: '22:00:00' },
            ],
            moLich: true,
          });
        } else {
          return lichSanApi.removeByDate(court.maSan, day.date);
        }
      });

      await Promise.all(promises);

      const actionText = isOpening ? 'mở' : 'đóng';
      const courtText = selectedCourtId === COURT_ALL_VALUE
        ? 'tất cả các sân'
        : selectedCourtLabel;
      alert(`Đã ${actionText} lịch cho ${courtText} ngày ${formatDisplayDate(new Date(day.date))}`);

      await loadSchedule();
    } catch {
      alert('Cập nhật trạng thái ngày thất bại.');
    }
  };


  const handleSave = () => {
    localStorage.setItem('cau-hinh-san-bai-maxAdvanceDays', String(maxAdvanceDays));
    alert('Lưu số ngày đặt trước thành công.');
  };


  const handleQuickClose = async () => {
    if (selectedCourtId === COURT_ALL_VALUE) {
      alert('Vui lòng chọn một sân cụ thể để đóng khoảng ngày.');
      return;
    }

    const from = parseDisplayDate(fromDate);
    const to = parseDisplayDate(toDate);
    if (!from || !to || from > to) {
      alert('Vui lòng nhập khoảng ngày hợp lệ theo định dạng dd/mm/yyyy.');
      return;
    }

    const dates: string[] = [];
    let current = new Date(from);
    while (current <= to) {
      dates.push(toIsoDate(current));
      current = addDays(current, 1);
    }

    try {
      await Promise.all(
        dates.map((ngayApDung) =>
          lichSanApi.removeByDate(Number(selectedCourtId), ngayApDung),
        ),
      );
      alert(`Đóng khoảng ngày từ ${fromDate} đến ${toDate} cho ${selectedCourtLabel} thành công.`);
      await loadSchedule();
    } catch {
      alert('Đóng khoảng ngày thất bại.');
    }
  };


  const getDayClass = (status: ClosedDay['status']) => {
    if (status === 'closed') {
      return 'border-red-500 text-slate-800';
    }
    if (status === 'today') {
      return 'border-blue-500 text-blue-600';
    }
    return 'border-slate-200 text-slate-800';
  };


  const getBadge = (status: ClosedDay['status']) => {
    if (status === 'closed') {
      return <span className="mt-2 text-sm font-medium text-red-500">Đóng</span>;
    }
    return <span className="mt-2 text-sm font-medium text-transparent">.</span>;
  };


  return (
    <AdminLayout>
      <div className="px-7 py-8">
        <div className="mx-auto max-w-[1120px]">
        <section className="mb-6">
          <h2 className="mb-4 text-[18px] font-semibold text-slate-800">
            Thiết lập thời gian đặt sân
          </h2>


          <div className="flex min-h-[84px] items-center justify-between rounded-2xl bg-white px-6 shadow-sm">
            <div className="flex items-center gap-6">
              <span className="text-[18px] font-medium text-slate-700">
                Số ngày đặt trước tối đa
              </span>


              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-[28px] text-slate-400"
                >
                  -
                </button>


                <span className="min-w-[18px] text-center text-[28px] font-medium text-slate-700">
                  {maxAdvanceDays}
                </span>


                <button
                  type="button"
                  onClick={handleIncrease}
                  className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-[28px] text-slate-400"
                >
                  +
                </button>
              </div>
            </div>


            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#4169E1] px-6 py-3 text-[18px] font-semibold text-white transition hover:opacity-90"
            >
              Lưu thay đổi
            </button>
          </div>
        </section>


        <section>
          <h2 className="mb-4 text-[18px] font-semibold text-slate-800">
            Thiết lập ngày đóng/mở đặt sân
          </h2>


          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_270px]">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-[16px] text-slate-500"
                >
                  {'<'} Trước
                </button>


                <h3 className="text-[20px] font-semibold text-slate-700">
                  {weekLabel}
                </h3>


                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-[16px] text-slate-500"
                >
                  Sau {'>'}
                </button>
              </div>


              <div className="mb-3 grid grid-cols-7 gap-3 px-1">
                {days.map((item) => (
                  <div
                    key={`weekday-${item.dayNumber}`}
                    className="text-center text-[16px] font-medium text-slate-500"
                  >
                    {item.weekday}
                  </div>
                ))}
              </div>


              <div className="grid grid-cols-7 gap-3">
                {days.map((item) => (
                  <button
                    key={item.dayNumber}
                    type="button"
                    onClick={() => handleToggleDay(item.dayNumber)}
                    className={`flex h-[94px] flex-col items-center justify-center rounded-xl border-2 bg-white transition ${getDayClass(
                      item.status
                    )}`}
                  >
                    <span className="text-[24px] font-semibold">{item.dayNumber}</span>
                    {getBadge(item.status)}
                  </button>
                ))}
              </div>


              <div className="mt-8 flex flex-wrap items-center gap-8 text-[16px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-md border-[3px] border-blue-500 bg-white" />
                  <span>Hôm nay</span>
                </div>


                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-md border border-slate-300 bg-white" />
                  <span>Mở đặt</span>
                </div>


                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-md border-[3px] border-red-500 bg-white" />
                  <span>Đóng đặt</span>
                </div>
              </div>
            </div>


            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-[20px] font-semibold text-slate-800">
                Thao tác nhanh
              </h3>


              <div className="mb-4">
                <label className="mb-2 block text-[16px] font-medium text-slate-600">
                  Từ ngày
                </label>
                <input
                  type="text"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-[16px] outline-none focus:border-blue-400"
                />
              </div>


              <div className="mb-4">
                <label className="mb-2 block text-[16px] font-medium text-slate-600">
                  Đến ngày
                </label>
                <input
                  type="text"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-[16px] outline-none focus:border-blue-400"
                />
              </div>


              <div className="mb-6">
                <label className="mb-2 block text-[16px] font-medium text-slate-600">
                  Sân áp dụng
                </label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-[16px] text-slate-700 outline-none focus:border-blue-400"
                >
                  {courtOptions.map((court) => (
                    <option key={court.value} value={court.value}>
                      {court.label}
                    </option>
                  ))}
                  {loadingCourts && (
                    <option disabled>Đang tải sân...</option>
                  )}
                </select>
              </div>


              <button
                type="button"
                onClick={handleQuickClose}
                className="w-full rounded-lg bg-[#E53935] px-4 py-3 text-[18px] font-semibold text-white transition hover:opacity-90"
              >
                ⊗ Đóng khoảng ngày
              </button>
            </div>
          </div>
        </section>
        </div>
      </div>
    </AdminLayout>
  );
};


export default CauHinhSanBai;
