import { useEffect, useMemo, useState, useCallback } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { dashboardApi } from '../../services/api';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Grid2x2,
  QrCode,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ChartMode = 'booking' | 'revenue';
type CalendarView = 'day' | 'week' | 'month';

type ChartItem = {
  name: string;
  value: number;
};

type EventItem = {
  label: string;
  color: string;
};

type SummaryCard = {
  title: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  iconBg: string;
};

type CalendarEventMap = Record<number, EventItem[]>;

const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const cheDoXemMap: Record<CalendarView, string> = {
  day: 'ngay',
  week: 'tuan',
  month: 'thang',
};

const tinhTrangColorMap: Record<string, string> = {
  'Trống': 'bg-violet-400 text-white',
  'Chờ duyệt': 'bg-orange-500 text-white',
  'Đã được đặt': 'bg-blue-400 text-white',
  'Đang sử dụng': 'bg-yellow-300 text-black',
  'Đã sử dụng xong': 'bg-green-500 text-white',
  'Không sử dụng': 'bg-red-500 text-white',
  'Bảo trì': 'bg-amber-400 text-black',
};

const Dashboard = () => {
  const [chartMode, setChartMode] = useState<ChartMode>('booking');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // API data states
  const [thongKe, setThongKe] = useState<any>(null);
  const [hieuSuat, setHieuSuat] = useState<any[]>([]);
  const [lichTongHop, setLichTongHop] = useState<any[]>([]);

  // Fetch summary stats
  useEffect(() => {
    dashboardApi.getThongKe()
      .then((data) => setThongKe(data))
      .catch(() => { /* silent */ });
  }, []);

  // Fetch chart data
  useEffect(() => {
    dashboardApi.getHieuSuat()
      .then((data) => setHieuSuat(Array.isArray(data) ? data : []))
      .catch(() => setHieuSuat([]));
  }, []);

  // Fetch calendar data
  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

  const loadCalendar = useCallback(() => {
    dashboardApi.getLichTongHop({
      cheDoXem: cheDoXemMap[calendarView],
      ngay: formatDateStr(calendarDate),
    })
      .then((data) => setLichTongHop(Array.isArray(data) ? data : []))
      .catch(() => setLichTongHop([]));
  }, [calendarView, calendarDate]);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  const navigateCalendar = (direction: number) => {
    setCalendarDate((prev) => {
      const d = new Date(prev);
      if (calendarView === 'day') d.setDate(d.getDate() + direction);
      else if (calendarView === 'week') d.setDate(d.getDate() + direction * 7);
      else d.setMonth(d.getMonth() + direction);
      return d;
    });
  };

  const isSummaryEmpty = !thongKe;

  const summaryCards: SummaryCard[] = [
    {
      title: 'Tổng số sân',
      value: thongKe?.tongSoSan?.toString() || '--',
      icon: <CalendarDays size={20} />,
      bg: 'from-blue-500 to-blue-400',
      iconBg: 'bg-blue-600/30',
    },
    {
      title: 'Số lượt đặt sân hôm nay',
      value: thongKe?.datSanHomNay?.toString() || '--',
      icon: <Grid2x2 size={20} />,
      bg: 'from-emerald-500 to-green-400',
      iconBg: 'bg-emerald-600/30',
    },
    {
      title: 'Doanh thu của tháng hiện tại',
      value: thongKe ? `${Number(thongKe.doanhThuThang).toLocaleString('vi-VN')}đ` : '--',
      icon: <DollarSign size={20} />,
      bg: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-700/30',
    },
    {
      title: 'Số lượt đặt sân có trạng thái "Chờ duyệt"',
      value: thongKe?.choDuyet?.toString() || '--',
      icon: <QrCode size={20} />,
      bg: 'from-rose-500 to-red-500',
      iconBg: 'bg-red-700/30',
    },
  ];

  const bookingData: ChartItem[] = hieuSuat.map((item) => ({
    name: item.tenSan || `Sân ${item.maSan}`,
    value: Number(item.soLuongBooking) || 0,
  }));

  const revenueData: ChartItem[] = hieuSuat.map((item) => ({
    name: item.tenSan || `Sân ${item.maSan}`,
    value: Number(item.doanhThu) || 0,
  }));

  const chartData = chartMode === 'booking' ? bookingData : revenueData;

  const formatYAxis = (value: number) => {
    if (chartMode === 'booking') return `${value}`;
    return `${(value / 1000000).toFixed(0)}M`;
  };

  const formatTooltipValue = (value: number | string) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return '';
    if (chartMode === 'booking') return `${numericValue} booking`;
    return `${numericValue.toLocaleString('vi-VN')}đ`;
  };

  // Month calendar: build from calendarDate
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
  const todayDate = today.getDate();

  const monthCalendarDays: (number | '')[][] = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday-based
    const weeks: (number | '')[][] = [];
    let week: (number | '')[] = Array(startDayOfWeek).fill('');
    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(d);
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push('');
      weeks.push(week);
    }
    return weeks;
  }, [calYear, calMonth]);

  const monthEvents: CalendarEventMap = useMemo(() => {
    const map: CalendarEventMap = {};
    lichTongHop.forEach((item) => {
      const day = new Date(item.ngayApDung).getDate();
      if (!map[day]) map[day] = [];
      map[day].push({
        label: `${item.tenSan || 'Sân'} ${item.khungGio || ''}`.trim(),
        color: tinhTrangColorMap[item.tinhTrang] || 'bg-gray-400 text-white',
      });
    });
    return map;
  }, [lichTongHop]);

  // Week view
  const weekEvents = useMemo(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grouped: Record<string, { label: string; color: string }[]> = {};
    lichTongHop.forEach((item) => {
      const d = new Date(item.ngayApDung);
      const dayIdx = (d.getDay() + 6) % 7;
      const key = dayLabels[dayIdx];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        label: `${item.tenSan || 'Sân'} - ${item.khungGio || ''}`.trim(),
        color: tinhTrangColorMap[item.tinhTrang] || 'bg-gray-400 text-white',
      });
    });
    return dayLabels.map((day) => {
      const dateForDay = new Date(calendarDate);
      const currentDayIdx = (dateForDay.getDay() + 6) % 7;
      dateForDay.setDate(dateForDay.getDate() - currentDayIdx + dayLabels.indexOf(day));
      return {
        day,
        date: dateForDay.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        events: grouped[day] || [],
      };
    });
  }, [lichTongHop, calendarDate]);

  // Day view
  const dayEvents = useMemo(() => {
    return lichTongHop.map((item) => ({
      time: item.khungGio || '',
      title: `${item.tenSan || 'Sân'} - ${item.tinhTrang || ''}`,
      color: tinhTrangColorMap[item.tinhTrang] || 'bg-gray-400 text-white',
    }));
  }, [lichTongHop]);

  const legendItems = [
    { label: 'Đã được đặt', color: 'bg-blue-400' },
    { label: 'Đang sử dụng', color: 'bg-yellow-400' },
    { label: 'Đã sử dụng xong', color: 'bg-green-500' },
    { label: 'Trống', color: 'bg-violet-400' },
    { label: 'Chờ duyệt', color: 'bg-orange-500' },
    { label: 'Không sử dụng', color: 'bg-red-500' },
    { label: 'Bảo trì', color: 'bg-amber-400' },
  ];

  const totalMonthEvents = Object.values(monthEvents).reduce(
    (total, current) => total + current.length,
    0
  );
  const totalWeekEvents = weekEvents.reduce((total, item) => total + item.events.length, 0);
  const totalDayEvents = dayEvents.length;

  const totalCalendarEvents =
    calendarView === 'month'
      ? totalMonthEvents
      : calendarView === 'week'
      ? totalWeekEvents
      : totalDayEvents;

  const calendarTitle = useMemo(() => {
    if (calendarView === 'month') {
      return calendarDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    }
    if (calendarView === 'week') {
      const monday = new Date(calendarDate);
      const dayIdx = (monday.getDay() + 6) % 7;
      monday.setDate(monday.getDate() - dayIdx);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `Tuần ${monday.toLocaleDateString('vi-VN')} - ${sunday.toLocaleDateString('vi-VN')}`;
    }
    return calendarDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [calendarView, calendarDate]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f5f5f7]">
        <div className="border-b border-slate-200 bg-white px-8 py-4">
          <h1 className="text-[18px] font-medium text-slate-700">Dashboard</h1>
        </div>

        <div className="px-6 py-5">
          <section>
            <h2 className="mb-4 text-[16px] font-bold text-slate-900">
              Thống kê tổng quan
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-[16px] bg-gradient-to-r ${item.bg} px-4 py-3 text-white shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold leading-4">
                        {isSummaryEmpty ? '--' : item.value}
                      </p>
                      <p className="mt-1 text-[12px] leading-4 text-white/95">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isSummaryEmpty && (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                Chưa có dữ liệu thống kê tổng quan.
              </div>
            )}
          </section>

          <section className="mt-6 rounded-[20px] bg-transparent">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-[16px] font-bold text-slate-900">
                  Thống kê hiệu suất
                </h2>

                <div className="relative">
                  <select
                    value={chartMode}
                    onChange={(e) => setChartMode(e.target.value as ChartMode)}
                    className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-[14px] text-slate-500 shadow-sm outline-none"
                  >
                    <option value="booking">Số lượng booking</option>
                    <option value="revenue">Doanh thu</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-transparent">
              {chartData.length > 0 ? (
                <div className="h-[320px] rounded-[20px] bg-transparent">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap={16}>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 14 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 13 }}
                        tickFormatter={formatYAxis}
                      />
                      <Tooltip
                        formatter={(value: any) => [formatTooltipValue(value), '']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[8, 8, 0, 0]}
                        fill={chartMode === 'booking' ? '#F2A355' : '#3B82F6'}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                  Chưa có dữ liệu biểu đồ.
                </div>
              )}
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-[22px] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-slate-900">
                  Lịch tổng hợp
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarView('day')}
                    className={`rounded-[16px] border px-5 py-2.5 text-[13px] font-semibold transition ${
                      calendarView === 'day'
                        ? 'border-slate-900 bg-[#3f67f2] text-white shadow-[0_0_0_2px_#111827]'
                        : 'border-transparent bg-slate-200 text-slate-700'
                    }`}
                  >
                    Ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarView('week')}
                    className={`rounded-[16px] border px-5 py-2.5 text-[13px] font-semibold transition ${
                      calendarView === 'week'
                        ? 'border-slate-900 bg-[#3f67f2] text-white shadow-[0_0_0_2px_#111827]'
                        : 'border-transparent bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarView('month')}
                    className={`rounded-[16px] border px-5 py-2.5 text-[13px] font-semibold transition ${
                      calendarView === 'month'
                        ? 'border-slate-900 bg-[#3f67f2] text-white shadow-[0_0_0_2px_#111827]'
                        : 'border-transparent bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tháng
                  </button>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigateCalendar(-1)}
                  className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-[16px] font-semibold text-slate-800">
                  {calendarTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => navigateCalendar(1)}
                  className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {totalCalendarEvents === 0 ? (
                <div className="flex h-[260px] items-center justify-center rounded-[14px] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                  Chưa có dữ liệu lịch tổng hợp.
                </div>
              ) : (
                <>
                  {calendarView === 'month' && (
                    <>
                      <div className="overflow-hidden rounded-[14px] border border-slate-200">
                        <div className="grid grid-cols-7 bg-[#f8f8f8] text-center text-[14px] font-medium text-slate-600">
                          {weekDayLabels.map((day) => (
                            <div
                              key={day}
                              className="border-b border-r border-slate-200 py-2 last:border-r-0"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {monthCalendarDays.map((week, rowIndex) => (
                          <div key={rowIndex} className="grid grid-cols-7">
                            {week.map((day, colIndex) => (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                className="relative min-h-[64px] border-b border-r border-slate-200 bg-white p-1.5 last:border-r-0"
                              >
                                {day !== '' && (
                                  <>
                                    <div
                                      className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                        isCurrentMonth && day === todayDate
                                          ? 'bg-blue-50 font-semibold text-blue-600'
                                          : 'text-slate-700'
                                      }`}
                                    >
                                      {day}
                                    </div>

                                    <div className="space-y-1">
                                      {monthEvents[day]?.map((event, idx) => (
                                        <div
                                          key={idx}
                                          className={`truncate rounded-md px-1.5 py-1 text-[10px] font-medium ${event.color}`}
                                        >
                                          {event.label}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {calendarView === 'week' && (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {weekEvents.map((item) => (
                        <div
                          key={item.day}
                          className="rounded-[14px] border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="mb-2">
                            <p className="text-[14px] font-semibold text-slate-900">
                              {item.day}
                            </p>
                            <p className="text-[12px] text-slate-500">{item.date}</p>
                          </div>

                          {item.events.length > 0 ? (
                            <div className="space-y-2">
                              {item.events.map((event, idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-md px-2 py-1.5 text-[12px] font-medium ${event.color}`}
                                >
                                  {event.label}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-md border border-dashed border-slate-300 px-2 py-3 text-[12px] text-slate-500">
                              Không có lịch.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {calendarView === 'day' && (
                    <div className="space-y-3">
                      {dayEvents.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-2 rounded-[14px] border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center"
                        >
                          <div className="min-w-[120px] text-[13px] font-semibold text-slate-700">
                            {item.time}
                          </div>
                          <div
                            className={`rounded-md px-3 py-2 text-[13px] font-medium ${item.color}`}
                          >
                            {item.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-slate-600">
                    {legendItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <span className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;