import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LichSanService } from './lich-san.service';

@Injectable()
export class LichSanScheduler {
    private readonly logger = new Logger(LichSanScheduler.name);

    constructor(private readonly lichSanService: LichSanService) { }

    @Cron('0 0 * * *', {
        timeZone: 'Asia/Ho_Chi_Minh',
    })
    async tuDongTaoLichSanMoiDem() {
        this.logger.log('Bắt đầu job tự động tạo lịch sân lúc 0h');

        try {
            await this.lichSanService.taoLichTuDong();
            this.logger.log('Tạo lịch sân tự động thành công');
        } catch (error) {
            this.logger.error('Tạo lịch sân tự động thất bại', error.stack);
        }
    }
}