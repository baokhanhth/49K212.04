import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { sanBaiApi } from '../../services/api';
import type { SanBai, LoaiSan } from '../../types';

const QuanLySan: React.FC = () => {
  const [courts, setCourts] = useState<SanBai[]>([]);
  const [loaiSanList, setLoaiSanList] = useState<LoaiSan[]>([]);
  const [keyword] = useState<string>('');
  const [selectedLoaiSan, setSelectedLoaiSan] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Load data
  useEffect(() => {
    Promise.all([sanBaiApi.getAll(), sanBaiApi.getLoaiSan()])
      .then(([sanList, loaiList]) => {
        setCourts(Array.isArray(sanList) ? sanList : []);
        setLoaiSanList(Array.isArray(loaiList) ? loaiList : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loaiSanOptions = useMemo(() => {
    return ['all', ...loaiSanList.map((l) => l.tenLoaiSan)];
  }, [loaiSanList]);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const loaiTen = court.loaiSan?.tenLoaiSan || '';
      const matchLoaiSan =
        selectedLoaiSan === 'all' || loaiTen === selectedLoaiSan;

      const matchKeyword = court.tenSan
        .toLowerCase()
        .includes(keyword.trim().toLowerCase());

      return matchLoaiSan && matchKeyword;
    });
  }, [courts, keyword, selectedLoaiSan]);

  const handleToggleStatus = async (court: SanBai) => {
    const newStatus = court.trangThai === 'Hoạt động' ? 'Bảo trì' : 'Hoạt động';
    try {
      const updated = await sanBaiApi.updateTrangThai(court.maSan, newStatus);
      setCourts((prev) =>
        prev.map((c) => (c.maSan === court.maSan ? { ...c, trangThai: updated?.trangThai || newStatus } : c))
      );
    } catch {
      alert('Cập nhật trạng thái thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sân này không?');
    if (!confirmed) return;
    try {
      await sanBaiApi.delete(id);
      setCourts((prev) => prev.filter((court) => court.maSan !== id));
    } catch {
      alert('Xóa sân thất bại');
    }
  };

  const handleEdit = (court: SanBai) => {
    alert(`Mở form chỉnh sửa cho: ${court.tenSan}`);
  };

  const handleAddCourt = () => {
    alert('Mở form thêm sân thể thao');
  };

  const getImageUrl = (court: SanBai) => {
    if (court.hinhAnh) return `/api/uploads/san-bai/${court.hinhAnh}`;
    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80';
  };

  return (
    <AdminLayout>
      <div className="px-7 py-8">
        <h1 className="mb-8 text-[48px] font-extrabold text-slate-800">
          Quản lý sân
        </h1>

        <div className="rounded-[26px] bg-white px-7 py-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-[280px]">
              <select
                value={selectedLoaiSan}
                onChange={(e) => setSelectedLoaiSan(e.target.value)}
                className="h-14 w-full appearance-none rounded-2xl border-0 bg-[#4169E1] px-5 text-lg font-semibold text-white outline-none"
              >
                <option value="all">Lọc loại sân</option>
                {loaiSanOptions
                  .filter((item) => item !== 'all')
                  .map((item) => (
                    <option key={item} value={item} className="text-slate-800">
                      {item}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleAddCourt}
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#4169E1] px-6 text-lg font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              + Thêm sân thể thao
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-lg text-slate-500">Đang tải...</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-lg font-medium text-slate-500">
                    Tên sân
                  </th>
                  <th className="px-5 py-3 text-left text-lg font-medium text-slate-500">
                    Giá thuê (/giờ)
                  </th>
                  <th className="px-5 py-3 text-left text-lg font-medium text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-lg font-medium text-slate-500">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCourts.map((court) => (
                  <tr key={court.maSan} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={getImageUrl(court)}
                          alt={court.tenSan}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <span className="text-lg font-semibold text-slate-800">
                          {court.tenSan}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-lg text-slate-700">
                      {formatPrice(court.giaThue)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-medium ${
                            court.trangThai === 'Hoạt động' ? 'text-emerald-600' : 'text-amber-500'
                          }`}
                        >
                          {court.trangThai}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(court)}
                          className={`relative h-8 w-16 rounded-full transition ${
                            court.trangThai === 'Hoạt động' ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                              court.trangThai === 'Hoạt động' ? 'left-9' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(court)}
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(court.maSan)}
                          className="rounded-xl bg-rose-500 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCourts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-lg text-slate-500"
                    >
                      Không có sân phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuanLySan;
