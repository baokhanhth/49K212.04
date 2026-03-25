import { useMemo, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";

type ProfileForm = {
  ten: string;
  mssv: string;
  emailTruong: string;
  emailCaNhan: string;
  sdt: string;
  diemUyTin: number;
  avatar: string;
};

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

const initialProfile: ProfileForm = {
  ten: "Quang Minh",
  mssv: "231121521238",
  emailTruong: "231121521238@due.edu.vn",
  emailCaNhan: "nguyenquangminh123@gmail.com",
  sdt: "0905123456",
  diemUyTin: 80,
  avatar:
    "https://ui-avatars.com/api/?name=Quang+Minh&background=E5E7EB&color=1F2937&size=256",
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
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

const TaiKhoanStudent = () => {
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);
  const [draftProfile, setDraftProfile] = useState<ProfileForm>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState<PasswordForm>(initialPassword);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const showMissingEmailWarning = useMemo(
    () => !profile.emailCaNhan.trim() || (isEditing && !draftProfile.emailCaNhan.trim()),
    [profile.emailCaNhan, isEditing, draftProfile.emailCaNhan]
  );

  const handleEdit = () => {
    setDraftProfile(profile);
    setProfileErrors({});
    setProfileSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftProfile(profile);
    setProfileErrors({});
    setIsEditing(false);
  };

  const handleProfileChange = (
    field: keyof ProfileForm,
    value: string | number
  ) => {
    setDraftProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    setProfileErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setProfileSuccess("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    handleProfileChange("avatar", objectUrl);
  };

  const validateProfile = () => {
    const errors: ProfileErrors = {};

    if (!draftProfile.emailCaNhan.trim()) {
      errors.emailCaNhan = "Vui lòng nhập email cá nhân";
    } else if (!isValidEmail(draftProfile.emailCaNhan.trim())) {
      errors.emailCaNhan = "Email không hợp lệ";
    }

    if (!isValidPhone(draftProfile.sdt.trim())) {
      errors.sdt = "Số điện thoại không hợp lệ";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateProfile()) return;

    setProfile(draftProfile);
    setIsEditing(false);
    setProfileSuccess("Cập nhật thành công");
  };

  const handlePasswordChange = (
    field: keyof PasswordForm,
    value: string
  ) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPasswordErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setPasswordSuccess("");
  };

  const validatePassword = () => {
    const errors: PasswordErrors = {};

    if (passwordForm.matKhauHienTai !== "Password@123") {
      errors.matKhauHienTai = "Mật khẩu hiện tại không đúng";
    }

    if (!isStrongPassword(passwordForm.matKhauMoi)) {
      errors.matKhauMoi =
        "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt";
    }

    if (passwordForm.xacNhanMatKhau !== passwordForm.matKhauMoi) {
      errors.xacNhanMatKhau = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePassword = () => {
    if (!validatePassword()) return;

    setPasswordForm(initialPassword);
    setPasswordSuccess("Đổi mật khẩu thành công");
  };

  const currentProfile = isEditing ? draftProfile : profile;

  return (
    <StudentLayout>
      <div className="px-7 py-8 bg-slate-100 min-h-screen">
        <div className="mb-4 text-sm text-slate-500">
          Tài khoản <span className="mx-2">{">"}</span>
          <span className="text-slate-700 font-medium">Hồ sơ cá nhân</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold text-slate-800">Hồ sơ cá nhân</h1>

        {showMissingEmailWarning && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 shadow-sm">
            Vui lòng nhập email cá nhân để dùng cho Khôi phục mật khẩu, Nhận vé điện tử và Nhận thông báo hệ thống
          </div>
        )}

        {profileSuccess && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm">
            {profileSuccess}
          </div>
        )}

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h2>
              <p className="mt-1 text-sm text-slate-500">
                Xem và cập nhật thông tin cá nhân
              </p>
            </div>

            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Lưu
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex flex-col items-center">
              <img
                src={currentProfile.avatar}
                alt="Ảnh đại diện"
                className="h-36 w-36 rounded-full border-4 border-slate-100 object-cover shadow-sm"
              />

              {isEditing && (
                <label className="mt-4 cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Chọn ảnh đại diện
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
              <div className="mb-5 border-b border-slate-200 pb-5">
                <h3 className="text-3xl font-bold text-slate-800">
                  {currentProfile.ten}
                </h3>
                <div className="mt-3 flex items-center gap-2 text-xl font-semibold text-amber-500">
                  <span>★</span>
                  <span className="text-slate-700">
                    {currentProfile.diemUyTin} Điểm uy tín
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Tên
                  </label>
                  <input
                    value={currentProfile.ten}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    MSSV
                  </label>
                  <input
                    value={currentProfile.mssv}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Email trường
                  </label>
                  <input
                    value={currentProfile.emailTruong}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Email cá nhân
                  </label>
                  <input
                    value={currentProfile.emailCaNhan}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleProfileChange("emailCaNhan", e.target.value)
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-slate-700 outline-none transition ${
                      !isEditing
                        ? "border-slate-200 bg-slate-100"
                        : profileErrors.emailCaNhan
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500"
                    }`}
                  />
                  {profileErrors.emailCaNhan && (
                    <p className="mt-2 text-sm text-red-500">
                      {profileErrors.emailCaNhan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    SĐT
                  </label>
                  <input
                    value={currentProfile.sdt}
                    disabled={!isEditing}
                    onChange={(e) => handleProfileChange("sdt", e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-slate-700 outline-none transition ${
                      !isEditing
                        ? "border-slate-200 bg-slate-100"
                        : profileErrors.sdt
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 bg-white focus:border-blue-500"
                    }`}
                  />
                  {profileErrors.sdt && (
                    <p className="mt-2 text-sm text-red-500">
                      {profileErrors.sdt}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Điểm uy tín
                  </label>
                  <input
                    value={String(currentProfile.diemUyTin)}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm">
            {passwordSuccess}
          </div>
        )}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Đổi mật khẩu</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cập nhật mật khẩu đăng nhập
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={passwordForm.matKhauHienTai}
                onChange={(e) =>
                  handlePasswordChange("matKhauHienTai", e.target.value)
                }
                className={`w-full rounded-xl border px-4 py-3 text-slate-700 outline-none transition ${
                  passwordErrors.matKhauHienTai
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white focus:border-blue-500"
                }`}
              />
              {passwordErrors.matKhauHienTai && (
                <p className="mt-2 text-sm text-red-500">
                  {passwordErrors.matKhauHienTai}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordForm.matKhauMoi}
                onChange={(e) =>
                  handlePasswordChange("matKhauMoi", e.target.value)
                }
                className={`w-full rounded-xl border px-4 py-3 text-slate-700 outline-none transition ${
                  passwordErrors.matKhauMoi
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white focus:border-blue-500"
                }`}
              />
              {passwordErrors.matKhauMoi && (
                <p className="mt-2 text-sm text-red-500">
                  {passwordErrors.matKhauMoi}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={passwordForm.xacNhanMatKhau}
                onChange={(e) =>
                  handlePasswordChange("xacNhanMatKhau", e.target.value)
                }
                className={`w-full rounded-xl border px-4 py-3 text-slate-700 outline-none transition ${
                  passwordErrors.xacNhanMatKhau
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-white focus:border-blue-500"
                }`}
              />
              {passwordErrors.xacNhanMatKhau && (
                <p className="mt-2 text-sm text-red-500">
                  {passwordErrors.xacNhanMatKhau}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSavePassword}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default TaiKhoanStudent;