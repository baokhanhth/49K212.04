/**
 * Seed data for tables that were created but empty on Azure.
 * Uses transactions so IDENTITY_INSERT ON persists.
 */
const sql = require('mssql');

const config = {
  server: 'sale-web-server.database.windows.net',
  port: 1433,
  user: 'salesadmin@sale-web-server',
  password: 'SaleWeb@2024!',
  database: 'footballteam',
  options: { encrypt: true, trustServerCertificate: true },
  requestTimeout: 60000,
  connectionTimeout: 30000,
};

async function run() {
  let pool;
  try {
    console.log('Connecting to Azure SQL...');
    pool = await sql.connect(config);
    console.log('Connected!\n');

    // Check which tables need seeding (exist but empty)
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `);
    const allTables = tablesResult.recordset.map(r => r.TABLE_NAME);
    console.log('Tables:', allTables.join(', '));

    for (const t of allTables) {
      const cnt = await pool.request().query(`SELECT COUNT(*) as cnt FROM [${t}]`);
      console.log(`  [${t}] = ${cnt.recordset[0].cnt} rows`);
    }

    // Seed NguoiDung
    const nguoiDungCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM NguoiDung`);
    if (nguoiDungCount.recordset[0].cnt === 0) {
      console.log('\nSeeding NguoiDung...');
      const tx = new sql.Transaction(pool);
      await tx.begin();
      try {
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[NguoiDung] ON`);
        const users = [
          [1,'sv1','123456','231121521228','49K21.2','Nguyễn Văn An','0905123456','231121521228@due.udn.vn','an@gmail.com',null,0,40,2],
          [2,'sv2','123456','231121521229','49K21.2','Trần Thị Bình','0905234567','231121521229@due.udn.vn','binh@gmail.com',null,1,100,2],
          [3,'sv3','123456','231121521230','49K21.2','Lê Văn Cường','0905345678','231121521230@due.udn.vn','cuong@gmail.com',null,1,100,2],
          [4,'sv4','123456','231121521231','49K21.2','Phạm Thị Dung','0905456789','231121521231@due.udn.vn','dung@gmail.com',null,1,100,2],
          [5,'sv5','123456','231121521232','49K21.2','Hoàng Văn Đức','0905567890','231121521232@due.udn.vn','duc@gmail.com',null,1,100,2],
          [6,'sv6','123456','231121521233','49K21.2','Đặng Thị Hạnh','0905678901','231121521233@due.udn.vn','hanh@gmail.com',null,1,100,2],
          [7,'admin','$2b$10$H6wjL8TnFObz75N8sHJ6uePv91MkTXJ687QqePKQQrYKNJVeMkmFy',null,null,'Quản Trị Hệ Thống','0912345678','admin@due.udn.vn','admin@gmail.com',null,1,100,1],
          [8,'nv1','123456',null,null,'Nguyễn Văn Hùng','0913456789','nv1@due.udn.vn','hung@gmail.com',null,1,100,3],
          [9,'nv2','123456',null,null,'Lê Thị Lan','0914567890','nv2@due.udn.vn','lan@gmail.com',null,1,100,3],
          [10,'nv3','123456',null,null,'Trần Văn Minh','0915678901','nv3@due.udn.vn','minh@gmail.com',null,1,100,3],
        ];
        for (const u of users) {
          const req = new sql.Request(tx);
          req.input('uid', sql.Int, u[0]);
          req.input('username', sql.NVarChar(50), u[1]);
          req.input('matkhau', sql.NVarChar(255), u[2]);
          req.input('msv', sql.VarChar(12), u[3]);
          req.input('lop', sql.VarChar(10), u[4]);
          req.input('hoten', sql.NVarChar(100), u[5]);
          req.input('sdt', sql.VarChar(10), u[6]);
          req.input('emailtruong', sql.VarChar(80), u[7]);
          req.input('emailcanhan', sql.VarChar(80), u[8]);
          req.input('anhdaidien', sql.NVarChar(255), u[9]);
          req.input('trangthai', sql.Bit, u[10]);
          req.input('diemuytin', sql.Int, u[11]);
          req.input('mavaitro', sql.Int, u[12]);
          await req.query(`INSERT [dbo].[NguoiDung] ([UserID],[Username],[MatKhau],[MSV],[Lop],[HoTen],[SDT],[EmailTruong],[EmailCaNhan],[AnhDaiDien],[TrangThai],[DiemUyTin],[MaVaiTro]) VALUES (@uid,@username,@matkhau,@msv,@lop,@hoten,@sdt,@emailtruong,@emailcanhan,@anhdaidien,@trangthai,@diemuytin,@mavaitro)`);
        }
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[NguoiDung] OFF`);
        await tx.commit();
        console.log('  ✓ NguoiDung seeded (10 users)');
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }

    // Seed DatSan
    const datSanCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM DatSan`);
    if (datSanCount.recordset[0].cnt === 0) {
      console.log('Seeding DatSan...');
      const tx = new sql.Transaction(pool);
      await tx.begin();
      try {
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[DatSan] ON`);
        const datSanData = [
          [1,1,1,'2026-03-12T00:05:23.383',80000,'Đã duyệt',7],
          [2,2,2,'2026-03-12T00:05:23.383',80000,'Đã thanh toán',7],
          [3,3,3,'2026-03-12T00:05:23.383',80000,'Đã check-in',7],
          [4,4,4,'2026-03-12T00:05:23.383',80000,'Hoàn thành',7],
          [5,5,5,'2026-03-12T00:05:23.383',80000,'Chờ duyệt',null],
          [6,6,6,'2026-03-12T00:05:23.383',80000,'Bị từ chối',7],
          [7,1,7,'2026-03-12T00:05:23.383',100000,'Đã duyệt',7],
          [8,2,8,'2026-03-12T00:05:23.383',100000,'Đã thanh toán',7],
          [9,3,9,'2026-03-12T00:05:23.383',100000,'Đã check-in',7],
          [10,4,10,'2026-03-12T00:05:23.383',100000,'Bị từ chối',1],
          [11,5,11,'2026-03-12T00:05:23.383',120000,'No-show',7],
          [12,6,12,'2026-03-12T00:05:23.383',120000,'Đã hủy',null],
          [13,1,13,'2026-03-12T00:05:23.383',200000,'Đã duyệt',7],
          [14,2,14,'2026-03-12T00:05:23.383',200000,'Đã thanh toán',7],
          [15,3,15,'2026-03-12T00:05:23.383',200000,'Đã check-in',7],
          [16,4,16,'2026-03-12T00:05:23.383',200000,'Hoàn thành',7],
          [17,5,17,'2026-03-12T00:05:23.383',150000,'Chờ duyệt',null],
          [18,6,18,'2026-03-12T00:05:23.383',150000,'Đã duyệt',7],
          [19,1,19,'2026-03-12T00:05:23.383',150000,'Đã thanh toán',7],
          [20,2,20,'2026-03-12T00:05:23.383',150000,'Đã check-in',7],
        ];
        for (const d of datSanData) {
          const req = new sql.Request(tx);
          req.input('id', sql.Int, d[0]);
          req.input('uid', sql.Int, d[1]);
          req.input('mls', sql.Int, d[2]);
          req.input('nd', sql.DateTime, new Date(d[3]));
          req.input('tt', sql.Decimal(18,2), d[4]);
          req.input('st', sql.NVarChar(50), d[5]);
          req.input('duyet', sql.Int, d[6]);
          await req.query(`INSERT [dbo].[DatSan] ([MaDatSan],[UserID],[MaLichSan],[NgayDat],[TongTien],[TrangThai],[NguoiDuyet]) VALUES (@id,@uid,@mls,@nd,@tt,@st,@duyet)`);
        }
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[DatSan] OFF`);
        await tx.commit();
        console.log('  ✓ DatSan seeded (20 bookings)');
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }

    // Seed VeDienTu
    const veCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM VeDienTu`);
    if (veCount.recordset[0].cnt === 0) {
      console.log('Seeding VeDienTu...');
      const tx = new sql.Transaction(pool);
      await tx.begin();
      try {
        const veData = [
          ['VE000000001',1,'QR_1',null,null],['VE000000002',2,'QR_2',null,null],
          ['VE000000003',3,'QR_3','2026-03-12T00:08:46.527',null],
          ['VE000000004',4,'QR_4','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'],
          ['VE000000005',5,'QR_5',null,null],['VE000000006',6,'QR_6',null,null],
          ['VE000000007',7,'QR_7',null,null],['VE000000008',8,'QR_8',null,null],
          ['VE000000009',9,'QR_9','2026-03-12T00:08:46.527',null],
          ['VE000000010',10,'QR_10','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'],
          ['VE000000011',11,'QR_11',null,null],['VE000000012',12,'QR_12',null,null],
          ['VE000000013',13,'QR_13',null,null],['VE000000014',14,'QR_14',null,null],
          ['VE000000015',15,'QR_15','2026-03-12T00:08:46.527',null],
          ['VE000000016',16,'QR_16','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'],
          ['VE000000017',17,'QR_17',null,null],['VE000000018',18,'QR_18',null,null],
          ['VE000000019',19,'QR_19',null,null],
          ['VE000000020',20,'QR_20','2026-03-12T00:08:46.527',null],
        ];
        for (const v of veData) {
          const req = new sql.Request(tx);
          req.input('mv', sql.VarChar(12), v[0]);
          req.input('mds', sql.Int, v[1]);
          req.input('qr', sql.NVarChar(255), v[2]);
          req.input('ci', sql.DateTime, v[3] ? new Date(v[3]) : null);
          req.input('co', sql.DateTime, v[4] ? new Date(v[4]) : null);
          await req.query(`INSERT [dbo].[VeDienTu] ([MaVe],[MaDatSan],[QRCode],[ThoiGianCheckIn],[ThoiGianCheckOut]) VALUES (@mv,@mds,@qr,@ci,@co)`);
        }
        await tx.commit();
        console.log('  ✓ VeDienTu seeded (20 tickets)');
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }

    // Seed ThanhToan
    const ttCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM ThanhToan`);
    if (ttCount.recordset[0].cnt === 0) {
      console.log('Seeding ThanhToan...');
      const tx = new sql.Transaction(pool);
      await tx.begin();
      try {
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[ThanhToan] ON`);
        const ttData = [
          [1,1,null,null,0,null],[2,2,1,'2026-03-12T00:14:25.660',1,8],
          [3,3,1,'2026-03-12T00:14:25.660',1,9],[4,4,0,'2026-03-12T00:14:25.660',1,8],
          [5,5,null,null,0,null],[6,6,null,null,0,null],
          [7,7,1,'2026-03-12T00:14:25.660',1,9],[8,8,0,'2026-03-12T00:14:25.660',1,8],
          [9,9,1,'2026-03-12T00:14:25.660',1,9],[10,10,0,'2026-03-12T00:14:25.660',1,10],
          [11,11,1,'2026-03-12T00:14:25.660',1,8],[12,12,null,null,0,null],
          [13,13,1,'2026-03-12T00:14:25.660',1,10],[14,14,1,'2026-03-12T00:14:25.660',1,9],
          [15,15,0,'2026-03-12T00:14:25.660',1,8],[16,16,0,'2026-03-12T00:14:25.660',1,9],
          [17,17,null,null,0,null],[18,18,1,'2026-03-12T00:14:25.660',1,8],
          [19,19,1,'2026-03-12T00:14:25.660',1,9],[20,20,0,'2026-03-12T00:14:25.660',1,10],
        ];
        for (const t of ttData) {
          const req = new sql.Request(tx);
          req.input('id', sql.Int, t[0]);
          req.input('mds', sql.Int, t[1]);
          req.input('pt', sql.Bit, t[2]);
          req.input('tg', sql.DateTime, t[3] ? new Date(t[3]) : null);
          req.input('tttt', sql.Bit, t[4]);
          req.input('nv', sql.Int, t[5]);
          await req.query(`INSERT [dbo].[ThanhToan] ([MaThanhToan],[MaDatSan],[PhuongThuc],[ThoiGianThanhToan],[TrangThaiThanhToan],[NhanVienKiemTra]) VALUES (@id,@mds,@pt,@tg,@tttt,@nv)`);
        }
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[ThanhToan] OFF`);
        await tx.commit();
        console.log('  ✓ ThanhToan seeded (20 payments)');
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }

    // Seed ChiTietDatSan
    const ctCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM ChiTietDatSan`);
    if (ctCount.recordset[0].cnt === 0) {
      console.log('Seeding ChiTietDatSan...');
      const tx = new sql.Transaction(pool);
      await tx.begin();
      try {
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[ChiTietDatSan] ON`);
        const ctData = [
          [1,1,80000],[2,2,80000],[3,3,80000],[4,4,80000],[5,5,80000],[6,6,80000],
          [7,7,100000],[8,8,100000],[9,9,100000],[10,10,100000],
          [11,11,120000],[12,12,120000],
          [13,13,200000],[14,14,200000],[15,15,200000],[16,16,200000],
          [17,17,150000],[18,18,150000],[19,19,150000],[20,20,150000],
        ];
        for (const c of ctData) {
          const req = new sql.Request(tx);
          req.input('id', sql.Int, c[0]);
          req.input('mds', sql.Int, c[1]);
          req.input('gia', sql.Decimal(18,2), c[2]);
          await req.query(`INSERT [dbo].[ChiTietDatSan] ([MaChiTiet],[MaDatSan],[GiaTheoGio]) VALUES (@id,@mds,@gia)`);
        }
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[ChiTietDatSan] OFF`);
        await tx.commit();
        console.log('  ✓ ChiTietDatSan seeded (20 records)');
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }

    // Seed LichSuDiem
    const lsdCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM LichSuDiem`);
    if (lsdCount.recordset[0].cnt === 0) {
      console.log('Seeding LichSuDiem...');
      const tx = new sql.Transaction(pool);
      await tx.begin();
      try {
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[LichSuDiem] ON`);
        const lsdData = [
          [1,4,'2026-03-12T00:13:00.790',5,'Hoàn thành đặt sân #4'],
          [2,4,'2026-03-12T00:13:00.790',5,'Hoàn thành đặt sân #10'],
          [3,4,'2026-03-12T00:13:00.790',5,'Hoàn thành đặt sân #16'],
          [4,3,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #3'],
          [5,3,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #9'],
          [6,3,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #15'],
          [7,2,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #20'],
          [8,5,'2026-03-12T00:13:00.790',-5,'No-show đặt sân #11'],
          [9,6,'2026-03-12T00:13:00.790',-10,'Đã hủy đặt sân #12'],
        ];
        for (const l of lsdData) {
          const req = new sql.Request(tx);
          req.input('id', sql.Int, l[0]);
          req.input('uid', sql.Int, l[1]);
          req.input('tg', sql.DateTime, new Date(l[2]));
          req.input('dtd', sql.Int, l[3]);
          req.input('gc', sql.NVarChar(500), l[4]);
          await req.query(`INSERT [dbo].[LichSuDiem] ([MaCapNhat],[UserID],[ThoiGianCapNhat],[DiemThayDoi],[GhiChu]) VALUES (@id,@uid,@tg,@dtd,@gc)`);
        }
        await new sql.Request(tx).query(`SET IDENTITY_INSERT [dbo].[LichSuDiem] OFF`);
        await tx.commit();
        console.log('  ✓ LichSuDiem seeded (9 records)');
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    }

    // Final verification
    console.log('\n========== VERIFICATION ==========');
    const finalTables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `);
    for (const r of finalTables.recordset) {
      const countResult = await pool.request().query(`SELECT COUNT(*) as cnt FROM [${r.TABLE_NAME}]`);
      console.log(`  [${r.TABLE_NAME}] = ${countResult.recordset[0].cnt} rows`);
    }
    console.log('\n✅ Database seeding complete!');

  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.precedingErrors) {
      for (const e of err.precedingErrors) console.error('  -', e.message);
    }
  } finally {
    if (pool) await pool.close();
  }
}

run();
