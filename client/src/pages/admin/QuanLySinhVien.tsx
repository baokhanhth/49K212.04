import AdminLayout from '../../components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { sinhVienApi, getStoredUser } from '../../services/api';

interface SinhVienItem {
  userId: number;
  hoTen: string;
  msv: string;
  trangThai: boolean;
  diemUyTin: number;
}

const QuanLySinhVien = () => {
  const [users, setUsers] = useState<SinhVienItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 👉 STATE POPUP
  const [selectedUser, setSelectedUser] = useState<SinhVienItem | null>(null);
  const [actionType, setActionType] = useState<'lock' | 'unlock' | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    sinhVienApi.getAll({ keyword: keyword || undefined, page, limit: 10 })
      .then((data: any) => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setUsers(list);
        if (data?.totalPages) setTotalPages(data.totalPages);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchStudents();
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;
    const admin = getStoredUser();
    setSubmitting(true);
    try {
      if (actionType === 'lock') {
        await sinhVienApi.khoaQuyen(selectedUser.userId, {
          nguoiThucHien: admin?.userId || 0,
          lyDo: reason || undefined,
        });
      } else {
        await sinhVienApi.khoiPhucQuyen(selectedUser.userId, {
          nguoiThucHien: admin?.userId || 0,
          lyDo: reason || undefined,
        });
      }
      fetchStudents();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
      setSelectedUser(null);
      setActionType(null);
      setReason('');
    }
  };

  return (
    <AdminLayout>
      <div className="px-7 py-8">

        <h1 className="mb-6 text-2xl font-semibold text-slate-800">
          Quản lý sinh viên
        </h1>

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          {/* Top */}
          <div className="mb-5 flex justify-end">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="rounded-lg border px-3 py-2 text-sm w-60"
            />
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Đang tải...</div>
          ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Mã sinh viên</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Điểm uy tín</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user.userId} className="border-t">

                    <td className="px-4 py-3 font-medium">
                      {user.hoTen}
                    </td>

                    <td className="px-4 py-3">{user.msv}</td>

                    <td className="px-4 py-3">
                      {user.trangThai ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                          Bị khóa quyền đặt sân
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">{user.diemUyTin ?? '--'}</td>

                    {/* ACTION */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">

                        {/* KHÓA */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('lock');
                          }}
                          disabled={!user.trangThai}
                          className={`rounded-lg px-3 py-2 text-xs font-medium
                            ${
                              user.trangThai
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          Khóa quyền đặt sân
                        </button>

                        {/* KHÔI PHỤC */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('unlock');
                          }}
                          disabled={user.trangThai}
                          className={`rounded-lg px-3 py-2 text-xs font-medium
                            ${
                              !user.trangThai
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          Khôi phục quyền đặt sân
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              ‹
            </button>
            <span className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white">{page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              ›
            </button>
          </div>

        </div>

        {/* 🔥 POPUP */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            
            <div className="w-[400px] rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                {actionType === 'lock'
                  ? 'Xác nhận khóa quyền'
                  : 'Xác nhận khôi phục'}
              </h2>

              <p className="text-sm text-slate-600 mb-4">
                {actionType === 'lock'
                  ? 'Bạn chắc chắn muốn khóa quyền đặt sân của sinh viên này?'
                  : 'Bạn muốn khôi phục quyền đặt sân của sinh viên này?'}
              </p>

              {/* Input lý do */}
              {actionType === 'lock' && (
                <textarea
                  placeholder="Nhập lý do (không bắt buộc)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm mb-4"
                />
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setActionType(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Hủy
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="rounded-lg px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Xác nhận
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default QuanLySinhVien;
