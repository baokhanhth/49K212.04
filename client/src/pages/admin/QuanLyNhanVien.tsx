import AdminLayout from '../../components/layout/AdminLayout';
import { useState, useEffect } from 'react';
import { nhanVienApi } from '../../services/api';
import type { NhanVien } from '../../types';

const QuanLyNhanVien = () => {
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Popup state
  const [selectedUser, setSelectedUser] = useState<NhanVien | null>(null);
  const [actionType, setActionType] = useState<'lock' | 'unlock' | null>(null);
  const [processing, setProcessing] = useState(false);

  // Tạo nhân viên modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ hoTen: '', sdt: '', emailCaNhan: '' });
  const [createError, setCreateError] = useState('');
  const [createResult, setCreateResult] = useState<{ matKhauMacDinh: string } | null>(null);

  const fetchNhanVien = async () => {
    try {
      setLoading(true);
      const data = await nhanVienApi.getAll();
      setNhanViens(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNhanVien();
  }, []);

  const handleConfirm = async () => {
    if (!selectedUser || !actionType) return;
    setProcessing(true);
    try {
      if (actionType === 'lock') {
        await nhanVienApi.khoaTaiKhoan(selectedUser.userId);
      } else {
        await nhanVienApi.moKhoaTaiKhoan(selectedUser.userId);
      }
      await fetchNhanVien();
    } catch {
      // ignore
    } finally {
      setProcessing(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleCreateNhanVien = async () => {
    setCreateError('');
    setCreateResult(null);
    try {
      const data = await nhanVienApi.taoNhanVien(createForm);
      setCreateResult(data);
      setCreateForm({ hoTen: '', sdt: '', emailCaNhan: '' });
      await fetchNhanVien();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Tạo tài khoản thất bại';
      setCreateError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const filtered = nhanViens.filter(
    (nv) =>
      nv.hoTen.toLowerCase().includes(search.toLowerCase()) ||
      (nv.emailCaNhan ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (nv.sdt ?? '').includes(search),
  );

  return (
    <AdminLayout>
      <div className="px-7 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">
            Quản lý nhân viên
          </h1>
          <button
            onClick={() => { setShowCreateModal(true); setCreateError(''); setCreateResult(null); }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Tạo tài khoản nhân viên
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {/* Search */}
          <div className="mb-5 flex justify-end">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">Đang tải...</div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">SĐT</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Không có nhân viên nào
                      </td>
                    </tr>
                  ) : (
                    filtered.map((nv) => (
                      <tr key={nv.userId} className="border-t">
                        <td className="px-4 py-3 font-medium">{nv.hoTen}</td>
                        <td className="px-4 py-3">{nv.emailCaNhan ?? '—'}</td>
                        <td className="px-4 py-3">{nv.sdt ?? '—'}</td>
                        <td className="px-4 py-3">
                          {nv.trangThai ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {nv.trangThai ? (
                            <button
                              onClick={() => {
                                setSelectedUser(nv);
                                setActionType('lock');
                              }}
                              className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600"
                            >
                              🔒 Khóa
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(nv);
                                setActionType('unlock');
                              }}
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                            >
                              🔓 Mở khóa
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popup xác nhận khóa/mở khóa */}
        {selectedUser && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[420px] rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">
                {actionType === 'lock'
                  ? 'Xác nhận khóa tài khoản'
                  : 'Xác nhận mở khóa tài khoản'}
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                {actionType === 'lock'
                  ? `Bạn có chắc chắn muốn khóa tài khoản này? Nhân viên "${selectedUser.hoTen}" sẽ bị đăng xuất ngay lập tức và không thể đăng nhập lại.`
                  : `Bạn muốn mở khóa tài khoản cho nhân viên "${selectedUser.hoTen}"?`}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setActionType(null);
                  }}
                  disabled={processing}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    actionType === 'lock'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {processing ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal tạo nhân viên */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[450px] rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                Tạo tài khoản nhân viên
              </h2>

              {createResult ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                    Tạo tài khoản thành công!
                  </div>
                  <p className="text-sm text-slate-600">
                    Mật khẩu mặc định:{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {createResult.matKhauMacDinh}
                    </span>
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setShowCreateModal(false); setCreateResult(null); }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Họ tên</label>
                    <input
                      type="text"
                      value={createForm.hoTen}
                      onChange={(e) => setCreateForm({ ...createForm, hoTen: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="Nguyễn Văn B"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
                    <input
                      type="text"
                      value={createForm.sdt}
                      onChange={(e) => setCreateForm({ ...createForm, sdt: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="0905123456"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email cá nhân</label>
                    <input
                      type="email"
                      value={createForm.emailCaNhan}
                      onChange={(e) => setCreateForm({ ...createForm, emailCaNhan: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="nhanvien@gmail.com"
                    />
                  </div>

                  {createError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{createError}</div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleCreateNhanVien}
                      disabled={!createForm.hoTen || !createForm.sdt || !createForm.emailCaNhan}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Tạo tài khoản
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default QuanLyNhanVien;
