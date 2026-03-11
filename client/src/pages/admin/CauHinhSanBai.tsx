import { useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';


interface ClosedDay {
  dayNumber: number;
  weekday: string;
  status: 'open' | 'closed' | 'today';
}


const initialDays: ClosedDay[] = [
  { dayNumber: 1, weekday: 'CN', status: 'closed' },
  { dayNumber: 2, weekday: 'T2', status: 'open' },
  { dayNumber: 3, weekday: 'T3', status: 'open' },
  { dayNumber: 4, weekday: 'T4', status: 'closed' },
  { dayNumber: 5, weekday: 'T5', status: 'open' },
  { dayNumber: 6, weekday: 'T6', status: 'today' },
  { dayNumber: 7, weekday: 'T7', status: 'open' },
];


const CauHinhSanBai: React.FC = () => {
  const [maxAdvanceDays, setMaxAdvanceDays] = useState<number>(7);
  const [days, setDays] = useState<ClosedDay[]>(initialDays);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<string>('Tất cả các sân');


  const weekLabel = useMemo(() => {
    return 'Tuần: 02/03/2026 - 08/03/2026';
  }, []);


  const handleDecrease = () => {
    setMaxAdvanceDays((prev) => (prev > 1 ? prev - 1 : 1));
  };


  const handleIncrease = () => {
    setMaxAdvanceDays((prev) => prev + 1);
  };


  const handleToggleDay = (dayNumber: number) => {
    setDays((prev) =>
      prev.map((item) => {
        if (item.dayNumber !== dayNumber) return item;
        if (item.status === 'today') return item;
        return {
          ...item,
          status: item.status === 'closed' ? 'open' : 'closed',
        };
      })
    );
  };


  const handleSave = () => {
    alert('Lưu thay đổi thành công');
  };


  const handleQuickClose = () => {
    alert(
      `Đóng khoảng ngày từ ${fromDate || '...'} đến ${toDate || '...'} cho ${selectedCourt}`
    );
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
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-[16px] text-slate-700 outline-none focus:border-blue-400"
                >
                  <option>Tất cả các sân</option>
                  <option>Sân bóng đá A</option>
                  <option>Sân bóng đá B</option>
                  <option>Sân bóng chuyền C</option>
                  <option>Sân tennis D</option>
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
