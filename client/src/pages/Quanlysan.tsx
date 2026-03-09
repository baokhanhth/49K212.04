import { useMemo, useState } from 'react';

interface Court {
id: number;
tenSan: string;
loaiSan: string;
giaThue: number;
trangThai: boolean;
viTri?: string;
hinhAnh?: string;
}

const mockCourts: Court[] = [
{
id: 1,
tenSan: 'Sân bóng chuyền A',
loaiSan: 'Bóng chuyền',
giaThue: 20000,
trangThai: true,
viTri: 'Khu A',
hinhAnh:
'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=120&q=80',
},
{
id: 2,
tenSan: 'Sân bóng đá B',
loaiSan: 'Bóng đá',
giaThue: 20000,
trangThai: true,
viTri: 'Khu B',
hinhAnh:
'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80',
},
{
id: 3,
tenSan: 'Sân Tennis B',
loaiSan: 'Tennis',
giaThue: 15000,
trangThai: false,
viTri: 'Khu C',
hinhAnh:
'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=120&q=80',
},
{
id: 4,
tenSan: 'Sân Bóng Rổ C',
loaiSan: 'Bóng rổ',
giaThue: 20000,
trangThai: true,
viTri: 'Khu D',
hinhAnh:
'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=120&q=80',
},
];

const QuanLySan: React.FC = () => {
const [courts, setCourts] = useState<Court[]>(mockCourts);
const [keyword, setKeyword] = useState<string>('');
const [selectedLoaiSan, setSelectedLoaiSan] = useState<string>('all');

const formatPrice = (price: number) => {
return new Intl.NumberFormat('vi-VN').format(price);
};

const loaiSanOptions = useMemo(() => {
return ['all', ...new Set(courts.map((court) => court.loaiSan))];
}, [courts]);

const filteredCourts = useMemo(() => {
return courts.filter((court) => {
const matchLoaiSan =
selectedLoaiSan === 'all' || court.loaiSan === selectedLoaiSan;

const matchKeyword = court.tenSan
.toLowerCase()
.includes(keyword.trim().toLowerCase());

return matchLoaiSan && matchKeyword;
});
}, [courts, keyword, selectedLoaiSan]);

const handleToggleStatus = (id: number) => {
setCourts((prev) =>
prev.map((court) =>
court.id === id ? { ...court, trangThai: !court.trangThai } : court
)
);
};

const handleDelete = (id: number) => {
const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sân này không?');
if (!confirmed) return;

setCourts((prev) => prev.filter((court) => court.id !== id));
};

const handleEdit = (court: Court) => {
alert(`Mở form chỉnh sửa cho: ${court.tenSan}`);
};

const handleAddCourt = () => {
alert('Mở form thêm sân thể thao');
};

return (
<div className="min-h-full">
<div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
<div className="flex items-center gap-3 text-base text-slate-500">
<span className="font-medium text-blue-500">Sân thể thao</span>
<span>{'>'}</span>
<span className="font-medium text-slate-700">Quản lý sân</span>
</div>

<div className="flex items-center gap-4">
<div className="relative w-[320px]">
<input
value={keyword}
onChange={(e) => setKeyword(e.target.value)}
placeholder="Tìm kiếm..."
className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-blue-400 focus:bg-white"
/>
</div>

<img
src="https://i.pravatar.cc/100?img=20"
alt="avatar"
className="h-11 w-11 rounded-full object-cover"
/>
</div>
</div>

<section className="px-8 py-8">
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
{loaiSanOptions
.filter((item) => item !== 'all')
.map((item) => (
<option key={item} value={item} className="text-slate-800">
{item}
</option>
))}
</select>
</div>

<button
onClick={handleAddCourt}
className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#4169E1] px-6 text-lg font-semibold text-white shadow-sm transition hover:opacity-90"
>
+ Thêm sân thể thao
</button>
</div>

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
<tr key={court.id} className="border-t border-slate-100">
<td className="px-5 py-4">
<div className="flex items-center gap-4">
<img
src={court.hinhAnh}
alt={court.tenSan}
className="h-12 w-12 rounded-full object-cover"
/>
<span className="text-lg font-semibold text-slate-800">
{court.tenSan}
</span>
</div>
</td>

<td className="px-5 py-4 text-lg text-slate-700">
{formatPrice(court.giaThue)}
</td>

<td className="px-5 py-4">
<div className="flex items-center gap-3">
<span
className={`text-lg font-medium ${
court.trangThai ? 'text-emerald-600' : 'text-amber-500'
}`}
>
{court.trangThai ? 'Trống' : 'Bảo trì'}
</span>

<button
type="button"
onClick={() => handleToggleStatus(court.id)}
className={`relative h-8 w-16 rounded-full transition ${
court.trangThai ? 'bg-emerald-500' : 'bg-amber-400'
}`}
>
<span
className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
court.trangThai ? 'left-9' : 'left-1'
}`}
/>
</button>
</div>
</td>

<td className="px-5 py-4">
<div className="flex items-center gap-3">
<button
onClick={() => handleEdit(court)}
className="rounded-xl bg-emerald-500 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
>
Sửa
</button>
<button
onClick={() => handleDelete(court.id)}
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
</div>
</section>
</div>
);
};

export default QuanLySan;
