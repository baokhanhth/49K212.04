import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { sanBaiApi } from '../../services/api';
import type { SanBai, LoaiSan } from '../../types';

type CourtForm = {
  tenSan: string;
  giaThue: string;
  trangThai: string;
  maLoaiSan: string;
  hinhAnh: string;
};

const FIXED_LOAI_SAN: LoaiSan[] = [
  { maLoaiSan: 1, tenLoaiSan: 'Bóng đá' } as LoaiSan,
  { maLoaiSan: 2, tenLoaiSan: 'Cầu lông' } as LoaiSan,
  { maLoaiSan: 3, tenLoaiSan: 'Bóng rổ' } as LoaiSan,
  { maLoaiSan: 4, tenLoaiSan: 'Bóng chuyền' } as LoaiSan,
  { maLoaiSan: 5, tenLoaiSan: 'Pickleball' } as LoaiSan,
];

const EMPTY_FORM: CourtForm = {
  tenSan: '',
  giaThue: '',
  trangThai: 'Hoạt động',
  maLoaiSan: '',
  hinhAnh: '',
};

const QuanLySan: React.FC = () => {
  const [courts, setCourts] = useState<SanBai[]>([]);
  const [selectedLoaiSan, setSelectedLoaiSan] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addForm, setAddForm] = useState<CourtForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<CourtForm>(EMPTY_FORM);
  const [editingCourtId, setEditingCourtId] = useState<number | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const normalizeCourt = (court: SanBai): SanBai => {
    const rawLoaiTen =
      court.loaiSan?.tenLoaiSan || (court as any).tenLoaiSan || '';
    const rawLoaiId =
      court.loaiSan?.maLoaiSan || (court as any).maLoaiSan || undefined;

    const matchedLoai = FIXED_LOAI_SAN.find(
      (item) =>
        item.tenLoaiSan.toLowerCase() === String(rawLoaiTen).toLowerCase() ||
        String(item.maLoaiSan) === String(rawLoaiId)
    );

    return {
      ...court,
      loaiSan: matchedLoai || court.loaiSan,
    };
  };

  useEffect(() => {
    sanBaiApi
      .getAll()
      .then((sanList) => {
        const rawCourts = Array.isArray(sanList) ? sanList : [];
        setCourts(rawCourts.map(normalizeCourt));
      })
      .catch(() => {
        setCourts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      if (selectedLoaiSan === 'all') return true;

      const maLoaiSanFromCourt =
        court.loaiSan?.maLoaiSan ?? (court as any).maLoaiSan;

      return String(maLoaiSanFromCourt) === selectedLoaiSan;
    });
  }, [courts, selectedLoaiSan]);

  const getImageUrl = (court: SanBai) => {
    if (court.hinhAnh) {
      if (
        court.hinhAnh.startsWith('http://') ||
        court.hinhAnh.startsWith('https://')
      ) {
        return court.hinhAnh;
      }
      return `/api/uploads/san-bai/${court.hinhAnh}`;
    }

    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80';
  };

  const resetAddForm = () => {
    setAddForm(EMPTY_FORM);
  };

  const resetEditForm = () => {
    setEditForm(EMPTY_FORM);
    setEditingCourtId(null);
  };

  const handleChangeAddForm = (field: keyof CourtForm, value: string) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeEditForm = (field: keyof CourtForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    resetAddForm();
  };

  const handleOpenEditModal = (court: SanBai) => {
    const maLoaiSan =
      court.loaiSan?.maLoaiSan ?? (court as any).maLoaiSan ?? '';

    setEditingCourtId(court.maSan);
    setEditForm({
      tenSan: court.tenSan || '',
      giaThue: String(court.giaThue || ''),
      trangThai: court.trangThai || 'Hoạt động',
      maLoaiSan: String(maLoaiSan),
      hinhAnh: court.hinhAnh || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    resetEditForm();
  };

  const validateCourtForm = (form: CourtForm) => {
    if (!form.tenSan.trim()) {
      alert('Vui lòng nhập tên sân');
      return false;
    }

    if (!form.giaThue.trim() || Number(form.giaThue) <= 0) {
      alert('Vui lòng nhập giá thuê hợp lệ');
      return false;
    }

    if (!form.maLoaiSan) {
      alert('Vui lòng chọn loại sân');
      return false;
    }

    return true;
  };

  const handleSubmitAddCourt = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateCourtForm(addForm)) return;

    try {
      setIsSubmitting(true);

      const selectedLoai = FIXED_LOAI_SAN.find(
        (item) => String(item.maLoaiSan) === addForm.maLoaiSan
      );

      const payload = {
        tenSan: addForm.tenSan.trim(),
        giaThue: Number(addForm.giaThue),
        trangThai: addForm.trangThai,
        hinhAnh: addForm.hinhAnh.trim(),
        maLoaiSan: Number(addForm.maLoaiSan),
      };

      // Nếu backend có API create thì mở dòng dưới
      // const created = normalizeCourt(await sanBaiApi.create(payload));

      const created = {
        maSan: Date.now(),
        tenSan: payload.tenSan,
        giaThue: payload.giaThue,
        trangThai: payload.trangThai,
        hinhAnh: payload.hinhAnh,
        maLoaiSan: payload.maLoaiSan,
        loaiSan: selectedLoai,
      } as SanBai;

      setCourts((prev) => [created, ...prev]);
      handleCloseAddModal();
    } catch {
      alert('Thêm sân thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEditCourt = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (editingCourtId === null) return;
    if (!validateCourtForm(editForm)) return;

    try {
      setIsSubmitting(true);

      const selectedLoai = FIXED_LOAI_SAN.find(
        (item) => String(item.maLoaiSan) === editForm.maLoaiSan
      );

      const payload = {
        tenSan: editForm.tenSan.trim(),
        giaThue: Number(editForm.giaThue),
        trangThai: editForm.trangThai,
        hinhAnh: editForm.hinhAnh.trim(),
        maLoaiSan: Number(editForm.maLoaiSan),
      };

      // Nếu backend có API update thật thì dùng:
      // const updated = normalizeCourt(
      //   await sanBaiApi.update(editingCourtId, payload)
      // );

      const updated = {
        maSan: editingCourtId,
        tenSan: payload.tenSan,
        giaThue: payload.giaThue,
        trangThai: payload.trangThai,
        hinhAnh: payload.hinhAnh,
        maLoaiSan: payload.maLoaiSan,
        loaiSan: selectedLoai,
      } as SanBai;

      setCourts((prev) =>
        prev.map((court) =>
          court.maSan === editingCourtId
            ? { ...court, ...updated, loaiSan: selectedLoai }
            : court
        )
      );

      handleCloseEditModal();
    } catch {
      alert('Cập nhật sân thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (court: SanBai) => {
    const newStatus = court.trangThai === 'Hoạt động' ? 'Bảo trì' : 'Hoạt động';

    try {
      const updated = await sanBaiApi.updateTrangThai(court.maSan, newStatus);
      setCourts((prev) =>
        prev.map((c) =>
          c.maSan === court.maSan
            ? { ...c, trangThai: updated?.trangThai || newStatus }
            : c
        )
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
                {FIXED_LOAI_SAN.map((item) => (
                  <option
                    key={item.maLoaiSan}
                    value={item.maLoaiSan}
                    className="text-slate-800"
                  >
                    {item.tenLoaiSan}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#4169E1] px-6 text-lg font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              + Thêm sân thể thao
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-lg text-slate-500">
              Đang tải...
            </div>
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
                          <div>
                            <div className="text-lg font-semibold text-slate-800">
                              {court.tenSan}
                            </div>
                            <div className="text-sm text-slate-500">
                              {court.loaiSan?.tenLoaiSan || 'Chưa có loại sân'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-lg text-slate-700">
                        {formatPrice(court.giaThue)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-lg font-medium ${
                              court.trangThai === 'Hoạt động'
                                ? 'text-emerald-600'
                                : 'text-amber-500'
                            }`}
                          >
                            {court.trangThai}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(court)}
                            className={`relative h-8 w-16 rounded-full transition ${
                              court.trangThai === 'Hoạt động'
                                ? 'bg-emerald-500'
                                : 'bg-amber-400'
                            }`}
                          >
                            <span
                              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                                court.trangThai === 'Hoạt động'
                                  ? 'left-9'
                                  : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditModal(court)}
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-[28px] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-3xl font-bold text-slate-800">
                Thêm sân thể thao
              </h2>
              <button
                onClick={handleCloseAddModal}
                className="text-2xl text-slate-400 transition hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitAddCourt} className="space-y-5">
              <div>
                <label className="mb-2 block text-lg font-medium text-slate-700">
                  Tên sân
                </label>
                <input
                  type="text"
                  value={addForm.tenSan}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, tenSan: e.target.value }))
                  }
                  placeholder="Nhập tên sân"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Giá thuê (/giờ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.giaThue}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        giaThue: e.target.value,
                      }))
                    }
                    placeholder="Ví dụ: 180000"
                    className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Trạng thái
                  </label>
                  <select
                    value={addForm.trangThai}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        trangThai: e.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bảo trì">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-slate-700">
                  Loại sân
                </label>
                <select
                  value={addForm.maLoaiSan}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      maLoaiSan: e.target.value,
                    }))
                  }
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                >
                  <option value="">Chọn loại sân</option>
                  {FIXED_LOAI_SAN.map((item) => (
                    <option key={item.maLoaiSan} value={item.maLoaiSan}>
                      {item.tenLoaiSan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-slate-700">
                  Hình ảnh
                </label>
                <input
                  type="text"
                  value={addForm.hinhAnh}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, hinhAnh: e.target.value }))
                  }
                  placeholder="Nhập tên file hoặc URL ảnh"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="rounded-2xl bg-slate-200 px-6 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-[#4169E1] px-6 py-3 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang thêm...' : 'Thêm sân'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-[28px] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-3xl font-bold text-slate-800">
                Chỉnh sửa sân
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-2xl text-slate-400 transition hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitEditCourt} className="space-y-5">
              <div>
                <label className="mb-2 block text-lg font-medium text-slate-700">
                  Tên sân
                </label>
                <input
                  type="text"
                  value={editForm.tenSan}
                  onChange={(e) =>
                    handleChangeEditForm('tenSan', e.target.value)
                  }
                  placeholder="Nhập tên sân"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Giá thuê (/giờ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.giaThue}
                    onChange={(e) =>
                      handleChangeEditForm('giaThue', e.target.value)
                    }
                    placeholder="Ví dụ: 180000"
                    className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Trạng thái
                  </label>
                  <select
                    value={editForm.trangThai}
                    onChange={(e) =>
                      handleChangeEditForm('trangThai', e.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bảo trì">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-slate-700">
                  Loại sân
                </label>
                <select
                  value={editForm.maLoaiSan}
                  onChange={(e) =>
                    handleChangeEditForm('maLoaiSan', e.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                >
                  <option value="">Chọn loại sân</option>
                  {FIXED_LOAI_SAN.map((item) => (
                    <option key={item.maLoaiSan} value={item.maLoaiSan}>
                      {item.tenLoaiSan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-lg font-medium text-slate-700">
                  Hình ảnh
                </label>
                <input
                  type="text"
                  value={editForm.hinhAnh}
                  onChange={(e) =>
                    handleChangeEditForm('hinhAnh', e.target.value)
                  }
                  placeholder="Nhập tên file hoặc URL ảnh"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-lg outline-none focus:border-[#4169E1]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="rounded-2xl bg-slate-200 px-6 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-[#4169E1] px-6 py-3 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default QuanLySan;