# US-20: Quản lý lịch hoạt động sân — API Documentation

> **User Story:** Là một quản trị viên (Admin), tôi muốn thiết lập khoảng thời gian cho phép đặt trước và đóng/mở thủ công các ngày cụ thể để tôi có thể kiểm soát việc sử dụng sân bãi.

**Base URL:** `http://localhost:5000/api`

---

## Mục lục

1. [Khung Giờ](#1-khung-giờ)
2. [Lịch Sân](#2-lịch-sân)
3. [Cấu Hình Đặt Sân](#3-cấu-hình-đặt-sân)

---

## 1. Khung Giờ

Quản lý các khung giờ hoạt động (ví dụ: 06:00–08:00, 08:00–10:00, ...).

### 1.1. Lấy danh sách khung giờ

```
GET /api/khung-gio
```

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "maKhungGio": 1,
      "gioBatDau": "06:00:00",
      "gioKetThuc": "08:00:00"
    },
    {
      "maKhungGio": 2,
      "gioBatDau": "08:00:00",
      "gioKetThuc": "10:00:00"
    }
  ],
  "message": "Lấy danh sách khung giờ thành công"
}
```

---

### 1.2. Lấy chi tiết khung giờ

```
GET /api/khung-gio/:id
```

| Param | Type  | Mô tả         |
| ----- | ----- | -------------- |
| `id`  | `int` | Mã khung giờ   |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "maKhungGio": 1,
    "gioBatDau": "06:00:00",
    "gioKetThuc": "08:00:00"
  },
  "message": "Lấy khung giờ thành công"
}
```

**Response 404:**

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy khung giờ với mã 99"
}
```

---

### 1.3. Tạo khung giờ mới

```
POST /api/khung-gio
```

**Request Body:**

| Field        | Type     | Required | Validation                          |
| ------------ | -------- | -------- | ----------------------------------- |
| `gioBatDau`  | `string` | ✅       | Định dạng `HH:mm` hoặc `HH:mm:ss` |
| `gioKetThuc` | `string` | ✅       | Định dạng `HH:mm` hoặc `HH:mm:ss`, phải > `gioBatDau` |

**Ví dụ:**

```json
{
  "gioBatDau": "06:00",
  "gioKetThuc": "08:00"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "maKhungGio": 1,
    "gioBatDau": "06:00:00",
    "gioKetThuc": "08:00:00"
  },
  "message": "Tạo khung giờ thành công"
}
```

**Response 400:**

```json
{
  "statusCode": 400,
  "message": "Giờ bắt đầu phải nhỏ hơn giờ kết thúc"
}
```

```json
{
  "statusCode": 400,
  "message": "Khung giờ này đã tồn tại"
}
```

---

### 1.4. Cập nhật khung giờ

```
PATCH /api/khung-gio/:id
```

| Param | Type  | Mô tả       |
| ----- | ----- | ------------ |
| `id`  | `int` | Mã khung giờ |

**Request Body (partial):**

| Field        | Type     | Required | Validation                          |
| ------------ | -------- | -------- | ----------------------------------- |
| `gioBatDau`  | `string` | ❌       | Định dạng `HH:mm` hoặc `HH:mm:ss` |
| `gioKetThuc` | `string` | ❌       | Định dạng `HH:mm` hoặc `HH:mm:ss` |

**Ví dụ:**

```json
{
  "gioKetThuc": "09:00"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "maKhungGio": 1,
    "gioBatDau": "06:00:00",
    "gioKetThuc": "09:00:00"
  },
  "message": "Cập nhật khung giờ thành công"
}
```

---

### 1.5. Xóa khung giờ

```
DELETE /api/khung-gio/:id
```

| Param | Type  | Mô tả       |
| ----- | ----- | ------------ |
| `id`  | `int` | Mã khung giờ |

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Xóa khung giờ thành công"
}
```

---

## 2. Lịch Sân

Quản lý lịch hoạt động sân — cho phép Admin thiết lập khoảng thời gian đặt trước và đóng/mở thủ công.

### 2.1. Lấy danh sách lịch sân (có lọc)

```
GET /api/lich-san
```

**Query Parameters:**

| Param       | Type     | Required | Mô tả                                                  |
| ----------- | -------- | -------- | ------------------------------------------------------- |
| `maSan`     | `int`    | ❌       | Lọc theo mã sân                                        |
| `tuNgay`    | `string` | ❌       | Ngày bắt đầu (YYYY-MM-DD)                              |
| `denNgay`   | `string` | ❌       | Ngày kết thúc (YYYY-MM-DD)                              |
| `maKhungGio`| `int`    | ❌       | Lọc theo khung giờ                                      |
| `trangThai` | `string` | ❌       | `trong` = chỉ lịch trống, `da_dat` = chỉ lịch đã đặt  |

**Ví dụ:**

```
GET /api/lich-san?maSan=1&tuNgay=2026-03-10&denNgay=2026-03-15&trangThai=trong
```

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "maLichSan": 1,
      "maSan": 1,
      "ngayApDung": "2026-03-10",
      "maKhungGio": 1,
      "maDatSan": null,
      "sanBai": {
        "maSan": 1,
        "tenSan": "Sân A",
        "hinhAnh": null,
        "viTri": "Khu A",
        "giaThue": 200000,
        "trangThai": true,
        "maLoaiSan": 1,
        "loaiSan": {
          "maLoaiSan": 1,
          "tenLoaiSan": "Sân 5 người"
        }
      },
      "khungGio": {
        "maKhungGio": 1,
        "gioBatDau": "06:00:00",
        "gioKetThuc": "08:00:00"
      }
    }
  ],
  "message": "Lấy danh sách lịch sân thành công"
}
```

---

### 2.2. Lấy chi tiết lịch sân

```
GET /api/lich-san/:id
```

| Param | Type  | Mô tả      |
| ----- | ----- | ----------- |
| `id`  | `int` | Mã lịch sân |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "maLichSan": 1,
    "maSan": 1,
    "ngayApDung": "2026-03-10",
    "maKhungGio": 1,
    "maDatSan": null,
    "sanBai": { "..." },
    "khungGio": { "..." }
  },
  "message": "Lấy lịch sân thành công"
}
```

---

### 2.3. Tạo một lịch sân

```
POST /api/lich-san
```

**Request Body:**

| Field       | Type     | Required | Validation                            |
| ----------- | -------- | -------- | ------------------------------------- |
| `maSan`     | `int`    | ✅       | Sân phải tồn tại                     |
| `ngayApDung`| `string` | ✅       | Định dạng `YYYY-MM-DD`, không quá khứ |
| `maKhungGio`| `int`    | ✅       | Khung giờ phải tồn tại               |

**Ví dụ:**

```json
{
  "maSan": 1,
  "ngayApDung": "2026-03-15",
  "maKhungGio": 2
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "maLichSan": 10,
    "maSan": 1,
    "ngayApDung": "2026-03-15",
    "maKhungGio": 2,
    "maDatSan": null
  },
  "message": "Tạo lịch sân thành công"
}
```

**Lỗi có thể gặp:**

| Status | Trường hợp                        |
| ------ | --------------------------------- |
| 404    | Sân không tồn tại                 |
| 404    | Khung giờ không tồn tại           |
| 400    | Ngày ở trong quá khứ              |
| 400    | Lịch sân đã tồn tại (trùng lặp)  |

---

### 2.4. Tạo hàng loạt lịch sân (Generate) ⭐

> **Chức năng chính US-20:** Thiết lập khoảng thời gian cho phép đặt trước.

```
POST /api/lich-san/generate
```

**Request Body:**

| Field              | Type       | Required | Validation                                 |
| ------------------ | ---------- | -------- | ------------------------------------------ |
| `maSan`            | `int`      | ✅       | Sân phải tồn tại                           |
| `tuNgay`           | `string`   | ✅       | `YYYY-MM-DD`, không quá khứ                |
| `denNgay`          | `string`   | ✅       | `YYYY-MM-DD`, phải >= `tuNgay`             |
| `danhSachKhungGio` | `int[]`    | ✅       | Mảng mã khung giờ, không rỗng, phải tồn tại |

> ⚠️ Khoảng thời gian tối đa là **90 ngày**.

**Ví dụ:**

```json
{
  "maSan": 1,
  "tuNgay": "2026-03-10",
  "denNgay": "2026-03-20",
  "danhSachKhungGio": [1, 2, 3]
}
```

Hệ thống sẽ tạo lịch sân cho sân 1, từ ngày 10/03 đến 20/03, mỗi ngày 3 khung giờ → tối đa **33 bản ghi**. Nếu bản ghi đã tồn tại sẽ bỏ qua.

**Response 201:**

```json
{
  "success": true,
  "data": {
    "created": 30,
    "skipped": 3
  },
  "message": "Đã tạo 30 lịch sân, bỏ qua 3 lịch đã tồn tại"
}
```

**Lỗi có thể gặp:**

| Status | Trường hợp                             |
| ------ | -------------------------------------- |
| 404    | Sân không tồn tại                      |
| 400    | Ngày bắt đầu > ngày kết thúc          |
| 400    | Ngày bắt đầu ở trong quá khứ          |
| 400    | Khoảng thời gian vượt quá 90 ngày     |
| 400    | Khung giờ không tồn tại               |

---

### 2.5. Đóng/Mở lịch sân thủ công (Toggle) ⭐

> **Chức năng chính US-20:** Đóng/mở thủ công các ngày cụ thể.

```
POST /api/lich-san/toggle
```

**Request Body:**

| Field              | Type       | Required | Validation                                   |
| ------------------ | ---------- | -------- | -------------------------------------------- |
| `maSan`            | `int`      | ✅       | Sân phải tồn tại                             |
| `ngayApDung`       | `string`   | ✅       | `YYYY-MM-DD`                                 |
| `danhSachKhungGio` | `int[]`    | ✅       | Mảng mã khung giờ, không rỗng                |
| `moLich`           | `boolean`  | ✅       | `true` = mở (tạo lịch), `false` = đóng (xóa lịch chưa đặt) |

#### Mở lịch (`moLich: true`)

Tạo lịch sân cho các khung giờ chưa có.

```json
{
  "maSan": 1,
  "ngayApDung": "2026-03-25",
  "danhSachKhungGio": [1, 2, 3],
  "moLich": true
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Đã mở 3 khung giờ cho sân 1 ngày 2026-03-25",
    "affected": 3
  },
  "message": "Đã mở 3 khung giờ cho sân 1 ngày 2026-03-25"
}
```

#### Đóng lịch (`moLich: false`)

Xóa lịch sân **chưa được đặt** cho các khung giờ chỉ định. Lịch đã có đặt sân (`maDatSan != null`) sẽ **không bị xóa**.

```json
{
  "maSan": 1,
  "ngayApDung": "2026-03-25",
  "danhSachKhungGio": [1, 2, 3],
  "moLich": false
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Đã đóng 2 khung giờ cho sân 1 ngày 2026-03-25",
    "affected": 2
  },
  "message": "Đã đóng 2 khung giờ cho sân 1 ngày 2026-03-25"
}
```

> Ở ví dụ trên, chỉ 2/3 khung giờ bị đóng vì khung giờ còn lại đã có đặt sân.

---

### 2.6. Xóa lịch sân đơn lẻ

```
DELETE /api/lich-san/:id
```

| Param | Type  | Mô tả       |
| ----- | ----- | ------------ |
| `id`  | `int` | Mã lịch sân  |

> Chỉ xóa được lịch sân chưa có đặt sân (`maDatSan = null`).

**Response 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Xóa lịch sân thành công"
}
```

**Response 400:**

```json
{
  "statusCode": 400,
  "message": "Không thể xóa lịch sân đã có đặt sân"
}
```

---

### 2.7. Xóa lịch sân theo ngày

```
DELETE /api/lich-san/by-date/:maSan/:ngayApDung
```

| Param       | Type     | Mô tả                    |
| ----------- | -------- | ------------------------- |
| `maSan`     | `int`    | Mã sân                   |
| `ngayApDung`| `string` | Ngày áp dụng (YYYY-MM-DD)|

> Xóa tất cả lịch sân **trống** (chưa đặt) của sân trong ngày chỉ định.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "deleted": 5
  },
  "message": "Đã xóa 5 lịch sân"
}
```

---

### 2.8. Khoá/Mở khoá lịch sân (Admin) ⭐

> **Chức năng:** Admin khoá lịch sân cụ thể để sinh viên không đặt được. Ví dụ: chiều thứ 7 trường có sự kiện, admin khoá các khung giờ chiều → sinh viên không thấy và không đặt được. Mở khoá lại bình thường.
>
> Lịch bị khoá **vẫn tồn tại** trong hệ thống (admin vẫn thấy), chỉ **ẩn với sinh viên**. Khác với "Đóng lịch" (toggle `moLich: false`) là xóa lịch.

```
POST /api/lich-san/khoa
```

**Request Body:**

| Field              | Type       | Required | Validation                                    |
| ------------------ | ---------- | -------- | --------------------------------------------- |
| `maSan`            | `int`      | ✅       | Sân phải tồn tại                              |
| `ngayApDung`       | `string`   | ✅       | `YYYY-MM-DD`                                  |
| `danhSachKhungGio` | `int[]`    | ✅       | Mảng mã khung giờ, không rỗng                 |
| `khoa`             | `boolean`  | ✅       | `true` = khoá, `false` = mở khoá              |
| `lyDoKhoa`         | `string`   | ❌       | Lý do khoá (tối đa 500 ký tự, chỉ cần khi khoá) |

#### Khoá lịch (`khoa: true`)

```json
{
  "maSan": 1,
  "ngayApDung": "2026-03-07",
  "danhSachKhungGio": [3, 4, 5],
  "khoa": true,
  "lyDoKhoa": "Trường có sự kiện chiều thứ 7"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Đã khoá 3 khung giờ cho sân 1 ngày 2026-03-07",
    "affected": 3
  },
  "message": "Đã khoá 3 khung giờ cho sân 1 ngày 2026-03-07"
}
```

#### Mở khoá lịch (`khoa: false`)

```json
{
  "maSan": 1,
  "ngayApDung": "2026-03-07",
  "danhSachKhungGio": [3, 4, 5],
  "khoa": false
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "message": "Đã mở khoá 3 khung giờ cho sân 1 ngày 2026-03-07",
    "affected": 3
  },
  "message": "Đã mở khoá 3 khung giờ cho sân 1 ngày 2026-03-07"
}
```

> **Lưu ý:**
> - Lịch đã có đặt sân (`maDatSan != null`) sẽ **không bị khoá**.
> - Lịch không tồn tại sẽ bị bỏ qua.
> - Khi khoá, trường `biKhoa = true` và `lyDoKhoa` được lưu.
> - Khi mở khoá, `biKhoa = false` và `lyDoKhoa = null`.

---

## 3. Cấu Hình Đặt Sân

Quản lý cấu hình số ngày cho phép đặt trước sân (`max_day`).

> **Quy tắc:** Admin nhập `soNgayDatTruoc` (ví dụ: 7). Hệ thống sẽ tự động tính khoảng ngày cho phép đặt sân = `[hôm nay, hôm nay + soNgayDatTruoc]`. Sinh viên chỉ được đặt sân trong khoảng ngày này.
>
> **Ví dụ:** Hôm nay là 03/03, `soNgayDatTruoc = 7` → Sinh viên được đặt từ 03/03 đến 10/03. Ngày 02/03 hoặc 11/03 sẽ bị từ chối. Ngày hôm sau (04/03) thì khoảng cho phép tự động dịch thành 04/03 → 11/03.

### 3.1. Lấy cấu hình đặt sân

```
GET /api/cau-hinh/dat-san
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "soNgayDatTruoc": 7,
    "ngayBatDau": "2026-03-03",
    "ngayKetThuc": "2026-03-10"
  },
  "message": "Lấy cấu hình đặt sân thành công"
}
```

> `ngayBatDau` và `ngayKetThuc` được **tính tự động** dựa trên ngày hiện tại + `soNgayDatTruoc`. Frontend dùng API này để disable/lock các ngày ngoài khoảng cho phép.

---

### 3.2. Cập nhật số ngày đặt trước (Admin)

```
PUT /api/cau-hinh/dat-san
```

**Request Body:**

| Field             | Type  | Required | Validation        |
| ----------------- | ----- | -------- | ----------------- |
| `soNgayDatTruoc`  | `int` | ✅       | Từ 1 đến 90 ngày |

**Ví dụ:**

```json
{
  "soNgayDatTruoc": 7
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "soNgayDatTruoc": 7,
    "ngayBatDau": "2026-03-03",
    "ngayKetThuc": "2026-03-10"
  },
  "message": "Đã cập nhật số ngày đặt trước thành 7 ngày. Sinh viên được phép đặt sân từ 2026-03-03 đến 2026-03-10"
}
```

**Response 400:**

```json
{
  "statusCode": 400,
  "message": "Số ngày đặt trước tối thiểu là 1"
}
```

---

### 3.3. Lấy danh sách lịch sân cho sinh viên

```
GET /api/lich-san/cho-sinh-vien
```

> API này chỉ trả về lịch sân **trống** và **không bị khoá** trong khoảng ngày cho phép `[hôm nay, hôm nay + soNgayDatTruoc]`.

**Query Parameters:** (giống `GET /api/lich-san`)

| Param       | Type     | Required | Mô tả                     |
| ----------- | -------- | -------- | -------------------------- |
| `maSan`     | `int`    | ❌       | Lọc theo mã sân           |
| `tuNgay`    | `string` | ❌       | Sẽ bị ép >= hôm nay       |
| `denNgay`   | `string` | ❌       | Sẽ bị ép <= hôm nay + max |
| `maKhungGio`| `int`    | ❌       | Lọc theo khung giờ        |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "maLichSan": 1,
      "maSan": 1,
      "ngayApDung": "2026-03-03",
      "maKhungGio": 1,
      "maDatSan": null,
      "sanBai": { "..." },
      "khungGio": { "..." }
    }
  ],
  "message": "Lấy danh sách lịch sân cho sinh viên thành công"
}
```

---

### 3.4. Validation khi đặt sân

Khi sinh viên đặt sân, hệ thống sẽ kiểm tra ngày đặt có nằm trong khoảng cho phép. Nếu ngoài khoảng:

**Response 400:**

```json
{
  "statusCode": 400,
  "message": "Ngày 2026-03-11 nằm ngoài khoảng cho phép đặt sân. Chỉ được đặt từ 2026-03-03 đến 2026-03-10 (7 ngày kể từ hôm nay)"
}
```

---

## Database Schema liên quan

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌───────────────┐
│ LoaiSan  │     │  SanBai  │     │ KhungGio │     │CauHinhHeThong │
├──────────┤     ├──────────┤     ├──────────┤     ├───────────────┤
│MaLoaiSan │◄────│MaLoaiSan │     │MaKhungGio│     │MaCauHinh (PK) │
│TenLoaiSan│     │MaSan     │     │GioBatDau │     │TenCauHinh     │
└──────────┘     │TenSan    │     │GioKetThuc│     │GiaTri         │
                 │HinhAnh   │     └────┬─────┘     │MoTa           │
                 │ViTri     │          │           └───────────────┘
                 │GiaThue   │          │
                 │TrangThai │          │
                 └────┬─────┘          │
                      │                │
                      │   ┌────────────┘
                      │   │
                 ┌────▼───▼──┐
                 │  LichSan  │
                 ├───────────┤
                 │MaLichSan  │
                 │MaSan (FK) │
                 │NgayApDung │
                 │MaKhungGio(FK)│
                 │MaDatSan   │ ← null = trống, có giá trị = đã đặt
                 │BiKhoa     │ ← false = bình thường, true = bị khoá
                 │LyDoKhoa   │ ← lý do khoá (nullable)
                 └───────────┘
```

**Bảng CauHinhHeThong:**

| Column      | Type           | Mô tả                                    |
| ----------- | -------------- | ----------------------------------------- |
| MaCauHinh   | int (PK, AI)   | Mã cấu hình                              |
| TenCauHinh  | nvarchar(100)  | Key cấu hình (unique), vd: `SO_NGAY_DAT_TRUOC` |
| GiaTri      | nvarchar(255)  | Giá trị cấu hình, vd: `7`                |
| MoTa        | nvarchar(500)  | Mô tả (nullable)                         |

**Ràng buộc:**
- `UNIQUE (MaSan, NgayApDung, MaKhungGio)` — mỗi sân chỉ có 1 slot cho mỗi khung giờ trong ngày
- `NgayApDung >= ngày hiện tại` — không tạo lịch cho quá khứ
- `UNIQUE (TenCauHinh)` — mỗi key cấu hình là duy nhất

---

## Response Format chung

Mọi response đều follow cấu trúc `ApiResponse<T>`:

```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## Error Format

```json
{
  "statusCode": 400,
  "message": "Mô tả lỗi",
  "error": "Bad Request"
}
```
