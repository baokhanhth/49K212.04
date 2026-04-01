import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  SanBai,
  LoaiSan,
  QuerySanBaiParams,
  LichSan,
  QueryLichSanParams,
  DatSan,
  QueryDatSanParams,
  CreateDatSanDto,
  DuyetDatSanDto,
  MatrixItem,
  DangNhapDto,
  DangNhapResponse,
  HoSoResponse,
  CapNhatHoSoDto,
  DoiMatKhauDto,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - unwrap { success, data } envelope
api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/dang-nhap';
    }
    return Promise.reject(error);
  }
);

// ===== Sân Bãi API =====
export const sanBaiApi = {
  getAll: (params?: QuerySanBaiParams): Promise<SanBai[]> =>
    api.get('/san-bai', { params }),

  getById: (id: number): Promise<SanBai> =>
    api.get(`/san-bai/${id}`),

  getLoaiSan: (): Promise<LoaiSan[]> =>
    api.get('/san-bai/loai-san'),

  create: (data: FormData): Promise<SanBai> =>
    api.post('/san-bai', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: FormData): Promise<SanBai> =>
    api.patch(`/san-bai/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateTrangThai: (id: number, trangThai: string): Promise<SanBai> =>
    api.patch(`/san-bai/${id}/trang-thai`, { trangThai }),

  delete: (id: number): Promise<void> =>
    api.delete(`/san-bai/${id}`),
};

// ===== Lịch Sân API =====
export const lichSanApi = {
  getAll: (params?: QueryLichSanParams): Promise<LichSan[]> =>
    api.get('/lich-san', { params }),

  getById: (id: number): Promise<LichSan> =>
    api.get(`/lich-san/${id}`),

  generate: (data: {
    maSan: number;
    tuNgay: string;
    denNgay: string;
    danhSachKhungGio: { gioBatDau: string; gioKetThuc: string }[];
  }): Promise<{ created: number; skipped: number }> =>
    api.post('/lich-san/generate', data),

  toggle: (data: {
    maSan: number;
    ngayApDung: string;
    danhSachKhungGio: { gioBatDau: string; gioKetThuc: string }[];
    moLich: boolean;
  }): Promise<{ message: string; affected: number }> =>
    api.post('/lich-san/toggle', data),

  delete: (id: number): Promise<void> =>
    api.delete(`/lich-san/${id}`),
};

// ===== Đặt Sân API =====
export const datSanApi = {
  getAll: (params?: QueryDatSanParams): Promise<DatSan[]> =>
    api.get('/dat-san', { params }),

  getById: (id: number): Promise<DatSan> =>
    api.get(`/dat-san/${id}`),

  getMatrix: (params: { maSan?: number; ngay?: string; maLoaiSan?: number }): Promise<MatrixItem[]> =>
    api.get('/dat-san/matrix', { params }),

  getLichSu: (maNguoiDung: number): Promise<DatSan[]> =>
    api.get('/dat-san/lich-su', { params: { maNguoiDung } }),

  create: (data: CreateDatSanDto): Promise<DatSan> =>
    api.post('/dat-san', data),

  duyet: (id: number, data: DuyetDatSanDto): Promise<DatSan> =>
    api.patch(`/dat-san/${id}/duyet`, data),

  cancel: (id: number): Promise<void> =>
    api.delete(`/dat-san/${id}`),
};

// ===== Auth API =====
export const authApi = {
  dangNhap: (data: DangNhapDto): Promise<DangNhapResponse> =>
    api.post('/auth/dang-nhap', data),

  dangXuat: (): Promise<void> =>
    api.post('/auth/dang-xuat'),
};

// ===== Người Dùng API =====
export const nguoiDungApi = {
  layHoSo: (): Promise<HoSoResponse> =>
    api.get('/nguoi-dung/ho-so'),

  capNhatHoSo: (data: CapNhatHoSoDto): Promise<HoSoResponse> =>
    api.patch('/nguoi-dung/ho-so', data),

  doiMatKhau: (data: DoiMatKhauDto): Promise<void> =>
    api.patch('/nguoi-dung/doi-mat-khau', data),

  uploadAnhDaiDien: (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/nguoi-dung/ho-so/upload-anh-dai-dien', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
