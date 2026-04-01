import AdminLayout from '../../components/layout/AdminLayout';

const QuanLyNhanVien = () => {
  return (
    <AdminLayout>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-orange-500 text-5xl">
              🚧
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-slate-800">
            Trang quản lý nhân viên
          </h1>
          <p className="text-lg text-slate-600">
            Đang được phát triển...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Tính năng này sẽ sớm có mặt trong phiên bản tiếp theo.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuanLyNhanVien;
