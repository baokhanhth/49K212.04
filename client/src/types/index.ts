// Common types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ===== Loại Sân =====
export interface LoaiSan {
  maLoaiSan: number;
  tenLoaiSan: string;
}

// ===== Sân Bãi =====
export interface SanBai {
  maSan: number;
  tenSan: string;
  hinhAnh: string | null;
  viTri: string | null;
  giaThue: number;
  trangThai: string;
  maLoaiSan: number;
  loaiSan?: LoaiSan;
}

export interface QuerySanBaiParams {
  tenSan?: string;
  maLoaiSan?: number;
  trangThai?: string;
}

export interface CreateSanBaiDto {
  tenSan: string;
  maLoaiSan: number;
  giaThue: number;
  viTri?: string;
  trangThai?: string;
}

// ===== Lịch Sân =====
export interface LichSan {
  maLichSan: number;
  maSan: number;
  ngayApDung: string;
  gioBatDau: string;
  gioKetThuc: string;
  sanBai?: SanBai;
  datSan?: DatSan | null;
}

export interface QueryLichSanParams {
  maSan?: number;
  tuNgay?: string;
  denNgay?: string;
  gioBatDau?: string;
  gioKetThuc?: string;
  trangThai?: 'trong' | 'da_dat';
}

// ===== Đặt Sân =====
export interface DatSan {
  maDatSan: number;
  userId: number;
  maLichSan: number;
  ngayDat: string;
  tongTien: number | null;
  trangThai: string;
  nguoiDuyet: number | null;
  lichSan?: LichSan;
}

export interface QueryDatSanParams {
  trangThai?: string;
  maSan?: number;
  ngay?: string;
}

export interface CreateDatSanDto {
  userId: number;
  maLichSan: number;
}

export interface DuyetDatSanDto {
  trangThai: 'Đã duyệt' | 'Bị từ chối';
  nguoiDuyet: number;
}

// ===== Matrix (cho sinh viên xem lịch trống) =====
export interface MatrixItem {
  maLichSan: number;
  tenSan: string;
  loaiSan: string;
  khungGio: string;
  trangThai: string;
  giaThue: number;
  canBook: boolean;
  maSan?: number;
  gioBatDau?: string;
  gioKetThuc?: string;
  hinhAnh?: string | null;
  viTri?: string | null;
}
