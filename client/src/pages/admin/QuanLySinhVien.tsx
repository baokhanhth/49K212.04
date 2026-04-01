import AdminLayout from '../../components/layout/AdminLayout';
import { useState } from 'react';

const QuanLySinhVien = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Nguyễn Văn A', code: 'SV001', status: 'active', score: 75 },
    { id: 2, name: 'Lê Thị B', code: 'SV002', status: 'active', score: 95 },
    { id: 3, name: 'Trần Văn C', code: 'SV003', status: 'locked', score: 20 },
    { id: 4, name: 'Hoàng Minh D', code: 'SV004', status: 'active', score: 69 },
    { id: 5, name: 'Đỗ Thị E', code: 'SV005', status: 'active', score: 78 },
    { id: 6, name: 'Phạm Văn F', code: 'SV006', status: 'locked', score: 68 },
  ]);

  // 👉 STATE POPUP
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'lock' | 'unlock' | null>(null);
  const [reason, setReason] = useState('');

  // 👉 CONFIRM ACTION
  const handleConfirm = () => {
    if (!selectedUser) return;

    if (actionType === 'lock') {
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id ? { ...u, status: 'locked' } : u
        )
      );
    }

    if (actionType === 'unlock') {
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id ? { ...u, status: 'active' } : u
        )
      );
    }

    setSelectedUser(null);
    setActionType(null);
    setReason('');
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
              className="rounded-lg border px-3 py-2 text-sm w-60"
            />
          </div>

          {/* Table */}
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
                  <tr key={user.id} className="border-t">

                    <td className="px-4 py-3 font-medium">
                      {user.name}
                    </td>

                    <td className="px-4 py-3">{user.code}</td>

                    <td className="px-4 py-3">
                      {user.status === 'active' ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                          Bị khóa quyền đặt sân
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">{user.score}</td>

                    {/* ACTION */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">

                        {/* KHÓA */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('lock');
                          }}
                          disabled={user.status === 'locked'}
                          className={`rounded-lg px-3 py-2 text-xs font-medium
                            ${
                              user.status === 'active'
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
                          disabled={user.status === 'active'}
                          className={`rounded-lg px-3 py-2 text-xs font-medium
                            ${
                              user.status === 'locked'
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

          {/* Pagination */}
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-md border px-3 py-1 text-sm">‹</button>
            <button className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white">1</button>
            <button className="rounded-md border px-3 py-1 text-sm">›</button>
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
                  className="rounded-lg px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700"
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
