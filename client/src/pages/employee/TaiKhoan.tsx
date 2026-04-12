import { useEffect, useMemo, useState } from 'react';
import EmployeeLayout from '../../components/layout/EmployeeLayout';
import { nguoiDungApi } from '../../services/api';
import type { HoSoResponse } from '../../types';
import { AxiosError } from 'axios';

type ProfileErrors = { emailCaNhan?: string; sdt?: string };
type PasswordForm = { matKhauHienTai: string; matKhauMoi: string; xacNhanMatKhau: string };
type PasswordErrors = { matKhauHienTai?: string; matKhauMoi?: string; xacNhanMatKhau?: string };

const initialPassword: PasswordForm = { matKhauHienTai: '', matKhauMoi: '', xacNhanMatKhau: '' };
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v: string) => /^\d{10}$/.test(v);
const isStrongPassword = (v: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v);

const TaiKhoan = () => {
  const [profile, setProfile] = useState<HoSoResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [draftEmail, setDraftEmail] = useState('');
  const [draftSdt, setDraftSdt] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState<PasswordForm>(initialPassword);
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({});
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await nguoiDungApi.layHoSo();
      setProfile(data);
    } catch { setProfile(null); }
    finally { setLoadingProfile(false); }
  };

  const showMissingEmailWarning = useMemo(() => {
    return profile ? !profile.emailCaNhan?.trim() : false;
  }, [profile]);

  const handleEdit = () => {
    if (!profile) return;
    setDraftEmail(profile.emailCaNhan || '');
    setDraftSdt(profile.sdt || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileErrors({});
    setProfileSuccess('');
    setIsEditing(true);
  };

  const handleCancel = () => { setIsEditing(false); setAvatarFile(null); setAvatarPreview(null); setProfileErrors({}); };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validateProfile = () => {
    const errs: ProfileErrors = {};
    if (!draftEmail.trim()) errs.emailCaNhan = 'Vui lòng nhập email cá nhân';
    else if (!isValidEmail(draftEmail.trim())) errs.emailCaNhan = 'Email không hợp lệ';
    if (draftSdt.trim() && !isValidPhone(draftSdt.trim())) errs.sdt = 'Số điện thoại không hợp lệ';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      if (avatarFile) await nguoiDungApi.uploadAnhDaiDien(avatarFile);
      const data = await nguoiDungApi.capNhatHoSo({ emailCaNhan: draftEmail.trim(), sdt: draftSdt.trim() || undefined });
      setProfile(data);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setProfileSuccess('Cập nhật thành công');
    } catch (error) {
      const msg = (error as AxiosError<{ message?: string }>).response?.data?.message || 'Cập nhật thất bại';
      setProfileErrors({ emailCaNhan: msg });
    } finally { setSavingProfile(false); }
  };

  const handlePwChange = (field: keyof PasswordForm, value: string) => {
    setPwForm(prev => ({ ...prev, [field]: value }));
    setPwErrors(prev => ({ ...prev, [field]: undefined }));
    setPwSuccess('');
  };

  const validatePw = () => {
    const errs: PasswordErrors = {};
    if (!pwForm.matKhauHienTai) errs.matKhauHienTai = 'Vui lòng nhập mật khẩu hiện tại';
    if (!isStrongPassword(pwForm.matKhauMoi)) errs.matKhauMoi = 'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
    if (pwForm.xacNhanMatKhau !== pwForm.matKhauMoi) errs.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSavePw = async () => {
    if (!validatePw()) return;
    setSavingPw(true);
    try {
      await nguoiDungApi.doiMatKhau(pwForm);
      setPwForm(initialPassword);
      setPwSuccess('Đổi mật khẩu thành công');
    } catch (error) {
      const msg = (error as AxiosError<{ message?: string }>).response?.data?.message;
      if (msg?.includes('hiện tại')) setPwErrors({ matKhauHienTai: 'Mật khẩu hiện tại không đúng' });
      else if (msg?.includes('khớp')) setPwErrors({ xacNhanMatKhau: 'Mật khẩu xác nhận không khớp' });
      else setPwErrors({ matKhauHienTai: msg || 'Đổi mật khẩu thất bại' });
    } finally { setSavingPw(false); }
  };

  if (loadingProfile) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
          <p className="text-slate-500">Đang tải hồ sơ...</p>
        </div>
      </EmployeeLayout>
    );
  }

  if (!profile) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
          <p className="text-red-500">Không thể tải hồ sơ. Vui lòng đăng nhập lại.</p>
        </div>
      </EmployeeLayout>
    );
  }

  const avatarSrc = avatarPreview || (profile.anhDaiDien
    ? profile.anhDaiDien
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.hoTen)}&background=E5E7EB&color=1F2937&size=256`);

  return (
    <EmployeeLayout>
      <div className="px-4 py-4 bg-slate-100 min-h-screen">
        <h1 className="mb-3 text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>

        {showMissingEmailWarning && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 shadow-sm">
            Vui lòng nhập email cá nhân để dùng cho Khôi phục mật khẩu và Nhận thông báo hệ thống
          </div>
        )}

        {profileSuccess && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 shadow-sm">
            {profileSuccess}
          </div>
        )}

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            {!isEditing ? (
              <button onClick={handleEdit} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} disabled={savingProfile} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Hủy
                </button>
                <button onClick={handleSaveProfile} disabled={savingProfile} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
                  {savingProfile ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[140px_minmax(0,1fr)]">
            <div className="flex flex-col items-center">
              <img src={avatarSrc} alt="Ảnh đại diện" className="h-24 w-24 rounded-full border-3 border-slate-100 object-cover shadow-sm" />
              {isEditing && (
                <label className="mt-2 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Chọn ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>

            <div>
              <div className="mb-3 border-b border-slate-200 pb-3">
                <h3 className="text-xl font-bold text-slate-800">{profile.hoTen}</h3>
                <p className="mt-1 text-sm text-slate-500">Nhân viên</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Tên</label>
                  <input value={profile.hoTen} disabled className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 outline-none" />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Email cá nhân</label>
                  <input
                    value={isEditing ? draftEmail : (profile.emailCaNhan || '')}
                    disabled={!isEditing}
                    onChange={(e) => { setDraftEmail(e.target.value); setProfileErrors(prev => ({ ...prev, emailCaNhan: undefined })); setProfileSuccess(''); }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${
                      !isEditing ? 'border-slate-200 bg-slate-100' : profileErrors.emailCaNhan ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'
                    }`}
                  />
                  {profileErrors.emailCaNhan && <p className="mt-1 text-xs text-red-500">{profileErrors.emailCaNhan}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">SĐT</label>
                  <input
                    value={isEditing ? draftSdt : (profile.sdt || '')}
                    disabled={!isEditing}
                    onChange={(e) => { setDraftSdt(e.target.value); setProfileErrors(prev => ({ ...prev, sdt: undefined })); setProfileSuccess(''); }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${
                      !isEditing ? 'border-slate-200 bg-slate-100' : profileErrors.sdt ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'
                    }`}
                  />
                  {profileErrors.sdt && <p className="mt-1 text-xs text-red-500">{profileErrors.sdt}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {pwSuccess && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 shadow-sm">
            {pwSuccess}
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">Đổi mật khẩu</h2>
            <p className="mt-0.5 text-xs text-slate-500">Cập nhật mật khẩu đăng nhập</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Mật khẩu hiện tại</label>
              <input type="password" value={pwForm.matKhauHienTai} onChange={(e) => handlePwChange('matKhauHienTai', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${pwErrors.matKhauHienTai ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'}`} />
              {pwErrors.matKhauHienTai && <p className="mt-1 text-xs text-red-500">{pwErrors.matKhauHienTai}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Mật khẩu mới</label>
              <input type="password" value={pwForm.matKhauMoi} onChange={(e) => handlePwChange('matKhauMoi', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${pwErrors.matKhauMoi ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'}`} />
              {pwErrors.matKhauMoi && <p className="mt-1 text-xs text-red-500">{pwErrors.matKhauMoi}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Xác nhận mật khẩu</label>
              <input type="password" value={pwForm.xacNhanMatKhau} onChange={(e) => handlePwChange('xacNhanMatKhau', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${pwErrors.xacNhanMatKhau ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white focus:border-blue-500'}`} />
              {pwErrors.xacNhanMatKhau && <p className="mt-1 text-xs text-red-500">{pwErrors.xacNhanMatKhau}</p>}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={handleSavePw} disabled={savingPw} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
              {savingPw ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default TaiKhoan;
