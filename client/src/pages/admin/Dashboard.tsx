import AdminLayout from '../../components/layout/AdminLayout';

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="px-7 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm text-slate-500">Tổng số sân</div>
            <div className="text-3xl font-bold text-slate-800">12</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm text-slate-500">Đặt sân hôm nay</div>
            <div className="text-3xl font-bold text-slate-800">24</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm text-slate-500">Đang chờ duyệt</div>
            <div className="text-3xl font-bold text-blue-600">8</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm text-slate-500">Doanh thu tháng</div>
            <div className="text-3xl font-bold text-green-600">5.2M</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
