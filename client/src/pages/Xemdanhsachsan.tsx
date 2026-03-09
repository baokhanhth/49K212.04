import { useState } from "react";

const sports = [
"Bóng đá",
"Cầu lông",
"Bóng chuyền",
"Bóng rổ",
"Tennis",
"Pickleball"
];

const fields = ["Sân 1","Sân 2","Sân 3"];

const times = [
"06:00 - 07:00",
"07:00 - 08:00",
"08:00 - 09:00",
"09:00 - 10:00",
"10:00 - 11:00",
"11:00 - 12:00",
"12:00 - 13:00",
"13:00 - 14:00",
"14:00 - 15:00",
"15:00 - 16:00",
"16:00 - 17:00",
"17:00 - 18:00",
"18:00 - 19:00",
"19:00 - 20:00"
];

const statusList = ["Trống","Đã đặt","Chờ duyệt","Bảo trì"];

const randomStatus = () =>{
return statusList[Math.floor(Math.random()*statusList.length)];
}

const statusColor=(s:string)=>{
if(s==="Trống") return "bg-[#DFF4ED] text-[#17A673]";
if(s==="Đã đặt") return "bg-[#F9E0E0] text-[#E55353]";
if(s==="Chờ duyệt") return "bg-[#FFF3CD] text-[#E0A800]";
return "bg-[#E2E3E5] text-[#6C757D]";
}

export default function Xemdanhsachsan(){

const[showFilter,setShowFilter]=useState(false);
const[selectedSports,setSelectedSports]=useState(["Bóng đá","Cầu lông"]);
const[detail,setDetail]=useState<any>(null);

const toggleSport=(sport:string)=>{
if(selectedSports.includes(sport)){
setSelectedSports(selectedSports.filter(s=>s!==sport));
}else{
setSelectedSports([...selectedSports,sport]);
}
}

return(

<div className="flex min-h-screen bg-gradient-to-r from-blue-100 to-gray-100">

{/* SIDEBAR */}

<div className="w-64 bg-gradient-to-b from-blue-900 to-blue-600 text-white flex flex-col">

<div className="p-6">

<h2 className="text-xl font-bold">N4 DUE</h2>

<p className="text-sm text-blue-200">
Hệ thống quản lý và đặt lịch sân thể thao
</p>

</div>

<nav className="flex-1 px-4 space-y-3">

<div className="bg-blue-500 p-2 rounded">Đặt sân</div>
<div className="hover:bg-blue-500 p-2 rounded cursor-pointer">Vé của tôi</div>
<div className="hover:bg-blue-500 p-2 rounded cursor-pointer">Lịch sử đặt sân</div>
<div className="hover:bg-blue-500 p-2 rounded cursor-pointer">Tài khoản</div>

</nav>

<button className="m-4 bg-blue-500 p-2 rounded">
Đăng xuất
</button>

</div>

{/* MAIN */}

<div className="flex-1 p-10 flex gap-6">

<div className="flex-1">

<h1 className="text-3xl font-bold mb-6">ĐẶT SÂN</h1>

{/* FORM */}

<div className="bg-white rounded-xl p-6 shadow flex gap-10 mb-6">

<div>
<p className="text-gray-400 text-sm">Sinh viên</p>
<p className="font-semibold">Quang Minh</p>
</div>

<div>
<p className="text-gray-400 text-sm">Lớp</p>
<select className="border rounded px-3 py-1">
<option>20K01</option>
</select>
</div>

<div>
<p className="text-gray-400 text-sm">Ngày</p>
<input type="date" className="border rounded px-3 py-1"/>
</div>

</div>

{/* FILTER */}

<div className="flex gap-4 mb-6 relative">

<button
onClick={()=>setShowFilter(!showFilter)}
className="bg-blue-600 text-white px-4 py-2 rounded-lg"

>

Lọc loại sân </button>

{showFilter &&(

<div className="absolute top-12 bg-white shadow-xl rounded-xl w-48">

{sports.map(s=>(

<label key={s} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">

<input
type="checkbox"
checked={selectedSports.includes(s)}
onChange={()=>toggleSport(s)}
className="accent-blue-600"
/>

{s}

</label>

))}

</div>

)}

</div>

{/* TABLE */}

<div className="bg-white rounded-xl shadow overflow-hidden">

<table className="w-full text-center">

<thead className="bg-gray-100">

<tr>

<th className="p-4">Thời gian</th>

{sports.map(s=>{

if(!selectedSports.includes(s)) return null;

return fields.map(f=>(

<th key={s+f} className="p-4">
{f}
<div className="text-xs text-gray-400">{s}</div>
</th>

))

})}

</tr>

</thead>

<tbody>

{times.map(time=>(

<tr key={time} className="border-t">

<td className="p-4">{time}</td>

{sports.map(s=>{

if(!selectedSports.includes(s)) return null;

return fields.map((f,i)=>{

const st=randomStatus();

return(

<td key={time+s+i} className="p-4">

<span
onClick={()=>{
if(st==="Trống"){
setDetail({
sport:s,
field:f
})
}
}}
className={`${statusColor(st)} px-3 py-1 rounded-full text-sm cursor-pointer`}

>

{st}

</span>

</td>

)

})

})}

</tr>

))}

</tbody>

</table>

</div>

{/* LEGEND */}

<div className="flex gap-6 mt-4 text-sm">

<div className="flex items-center gap-2">
<span className="w-3 h-3 bg-[#17A673] rounded-full"></span>Trống
</div>

<div className="flex items-center gap-2">
<span className="w-3 h-3 bg-[#E55353] rounded-full"></span>Đã đặt
</div>

<div className="flex items-center gap-2">
<span className="w-3 h-3 bg-[#E0A800] rounded-full"></span>Chờ duyệt
</div>

<div className="flex items-center gap-2">
<span className="w-3 h-3 bg-[#6C757D] rounded-full"></span>Bảo trì
</div>

</div>

</div>

{/* DETAIL PANEL */}

{detail &&(

<div className="w-80 bg-white rounded-xl shadow-xl p-6">

<div className="flex justify-between mb-4">

<h2 className="font-bold text-lg">
SÂN {detail.sport.toUpperCase()} {detail.field.replace("Sân ","")}
</h2>

<button onClick={()=>setDetail(null)}>✕</button>

</div>

<img
src="https://images.unsplash.com/photo-1599058917212-d750089bc07e"
className="rounded-lg mb-4"
/>

<p className="mb-2">
<b>Giá thuê:</b> 100.000đ / giờ
</p>

<p className="mb-2">
<b>Loại sân:</b> {detail.sport}
</p>

<p className="mb-4">
<b>Vị trí:</b> Sân ngoài trời
</p>

<button className="w-full bg-blue-600 text-white py-2 rounded-lg">
Đặt sân
</button>

</div>

)}

</div>

</div>

);
}
