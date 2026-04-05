import { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import { nguoiDungApi } from "../../services/api";
import type { HoSoResponse } from "../../types";
import { AxiosError } from "axios";

type ProfileErrors = {
  emailCaNhan?: string;
  sdt?: string;
};

type PasswordForm = {
  matKhauHienTai: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
};

type PasswordErrors = {
  matKhauHienTai?: string;
  matKhauMoi?: string;
  xacNhanMatKhau?: string;
};

const initialPassword: PasswordForm = {
  matKhauHienTai: "",
  matKhauMoi: "",
  xacNhanMatKhau: "",
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPhone = (value: string) => /^\d{10}$/.test(value);

const isStrongPassword = (value: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

const TaiKhoanStudent = () => {
  const [profile, setProfile] = useState<HoSoResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [draftEmailCaNhan, setDraftEmailCaNhan] = useState("");
  const [draftSdt, setDraftSdt] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>(initialPassword);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await nguoiDungApi.layHoSo();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const showMissingEmailWarning = useMemo(() => {
    if (!profile) return false;
    return !profile.emailCaNhan || profile.emailCaNhan.trim() === "";
  }, [profile]);

  const handleEdit = () => {
    if (!profile) return;
    setDraftEmailCaNhan(profile.emailCaNhan || "");
    setDraftSdt(profile.sdt || "");
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileErrors({});
    setProfileSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfileErrors({});
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validateProfile = () => {
    const errors: ProfileErrors = {};

    if (!draftEmailCaNhan.trim()) {
      errors.emailCaNhan = "Vui lòng nhập email cá nhân";
    } else if (!isValidEmail(draftEmailCaNhan.trim())) {
      errors.emailCaNhan = "Email không hợp lệ";
    }

    if (draftSdt.trim() && !isValidPhone(draftSdt.trim())) {
      errors.sdt = "Số điện thoại không hợp lệ";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setSavingProfile(true);
    try {
      if (avatarFile) {
        await nguoiDungApi.uploadAnhDaiDien(avatarFile);
      }

      const data = await nguoiDungApi.capNhatHoSo({
        emailCaNhan: draftEmailCaNhan.trim(),
        sdt: draftSdt.trim() || undefined,
      });

      setProfile(data);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setProfileSuccess("Cập nhật thành công");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg = axiosError.response?.data?.message || "Cập nhật thất bại";
      setProfileErrors({ emailCaNhan: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    setPasswordSuccess("");
  };

  const validatePassword = () => {
    const errors: PasswordErrors = {};

    if (!passwordForm.matKhauHienTai) {
      errors.matKhauHienTai = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!isStrongPassword(passwordForm.matKhauMoi)) {
      errors.matKhauMoi =
        "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    if (passwordForm.xacNhanMatKhau !== passwordForm.matKhauMoi) {
      errors.xacNhanMatKhau = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) return;

    setSavingPassword(true);
    try {
      await nguoiDungApi.doiMatKhau({
        matKhauHienTai: passwordForm.matKhauHienTai,
        matKhauMoi: passwordForm.matKhauMoi,
        xacNhanMatKhau: passwordForm.xacNhanMatKhau,
      });
      setPasswordForm(initialPassword);
      setPasswordSuccess("Đổi mật khẩu thành công");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg = axiosError.response?.data?.message;
      if (msg?.includes("hiện tại")) {
        setPasswordErrors({ matKhauHienTai: "Mật khẩu hiện tại không đúng" });
      } else if (msg?.includes("khớp")) {
        setPasswordErrors({ xacNhanMatKhau: "Mật khẩu xác nhận không khớp" });
      } else {
        setPasswordErrors({ matKhauHienTai: msg || "Đổi mật khẩu thất bại" });
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
          <p className="text-slate-500">Đang tải hồ sơ...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!profile) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
          <p className="text-red-500">Không thể tải hồ sơ. Vui lòng đăng nhập lại.</p>
        </div>
      </StudentLayout>
    );
  }

  const avatarSrc =
    avatarPreview ||
    (profile.anhDaiDien
      ? profile.anhDaiDien
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.hoTen)}&background=E5E7EB&color=1F2937&size=256`);

  return (
    <StudentLayout>
      <div className="px-4 py-4 bg-slate-100 min-h-screen">
        <h1 className="mb-3 text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>

        {showMissingEmailWarning && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 shadow-sm">
            Vui lòng nhập email cá nhân để dùng cho Khôi phục mật khẩu, Nhận vé điện tử và Nhận thông báo hệ thống
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
              <button
                onClick={handleEdit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={savingProfile}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingProfile ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[140px_minmax(0,1fr)]">
            <div className="flex flex-col items-center">
              <img
                src={avatarSrc}
                alt="Ảnh đại diện"
                className="h-24 w-24 rounded-full border-3 border-slate-100 object-cover shadow-sm"
              />

              {isEditing && (
                <label className="mt-2 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>

            <div>
              <div className="mb-3 border-b border-slate-200 pb-3">
                <h3 className="text-xl font-bold text-slate-800">
                  {profile.hoTen}
                </h3>
                {profile.diemUyTin !== undefined && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-amber-500">
                    <span>★</span>
                    <span className="text-slate-700">
                      {profile.diemUyTin} Điểm uy tín
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Tên
                  </label>
                  <input
                    value={profile.hoTen}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                </div>

                {profile.msv && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      MSSV
                    </label>
                    <input
                      value={profile.msv}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Email trường
                  </label>
                  <input
                    value={profile.emailTruong}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Email cá nhân
                  </label>
                  <input
                    value={isEditing ? draftEmailCaNhan : (profile.emailCaNhan || "")}
                    disabled={!isEditing}
                    onChange={(e) => {
                      setDraftEmailCaNhan(e.target.value);
                      setProfileErrors((prev) => ({ ...prev, emailCaNhan: undefined }));
                      setProfileSuccess("");
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${
                      !isEditing
                        ? "border-slate-200 bg-slate-100"
                        : profileErrors.emailCaNhan
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500"
                    }`}
                  />
                  {profileErrors.emailCaNhan && (
                    <p className="mt-1 text-xs text-red-500">
                      {profileErrors.emailCaNhan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    SĐT
                  </label>
                  <input
                    value={isEditing ? draftSdt : (profile.sdt || "")}
                    disabled={!isEditing}
                    onChange={(e) => {
                      setDraftSdt(e.target.value);
                      setProfileErrors((prev) => ({ ...prev, sdt: undefined }));
                      setProfileSuccess("");
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${
                      !isEditing
                        ? "border-slate-200 bg-slate-100"
                        : profileErrors.sdt
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500"
                    }`}
                  />
                  {profileErrors.sdt && (
                    <p className="mt-1 text-xs text-red-500">
                      {profileErrors.sdt}
                    </p>
                  )}
                </div>

                {profile.diemUyTin !== undefined && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Điểm uy tín
                    </label>
                    <input
                      value={String(profile.diemUyTin)}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 shadow-sm">
            {passwordSuccess}
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">Đổi mật khẩu</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Cập nhật mật khẩu đăng nhập
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={passwordForm.matKhauHienTai}
                onChange={(e) =>
                  handlePasswordChange("matKhauHienTai", e.target.value)
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${
                  passwordErrors.matKhauHienTai
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white focus:border-blue-500"
                }`}
              />
              {passwordErrors.matKhauHienTai && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordErrors.matKhauHienTai}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordForm.matKhauMoi}
                onChange={(e) =>
                  handlePasswordChange("matKhauMoi", e.target.value)
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${
                  passwordErrors.matKhauMoi
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white focus:border-blue-500"
                }`}
              />
              {passwordErrors.matKhauMoi && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordErrors.matKhauMoi}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={passwordForm.xacNhanMatKhau}
                onChange={(e) =>
                  handlePasswordChange("xacNhanMatKhau", e.target.value)
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition ${
                  passwordErrors.xacNhanMatKhau
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white focus:border-blue-500"
                }`}
              />
              {passwordErrors.xacNhanMatKhau && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordErrors.xacNhanMatKhau}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSavePassword}
              disabled={savingPassword}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {savingPassword ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default TaiKhoanStudent;