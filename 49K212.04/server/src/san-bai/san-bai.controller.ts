import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { SanBaiService } from "./san-bai.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Controller("san-bai")
export class SanBaiController {
  constructor(private readonly sanBaiService: SanBaiService) {}

  @Get("chitiet-sanbai/:id")
  chiTietSanBai(@Param("id") id: number) {
    return this.sanBaiService.chiTietSanBai(Number(id));
  }
  // API upload ảnh sân
  @Post("upload-anh/:id")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/san-bai",
        filename: (req, file, cb) => {
          const filename = Date.now() + "-" + file.originalname;
          cb(null, filename);
        },
      }),
    })
  )
  async uploadAnh(
    @Param("id") id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    const path = `/uploads/san-bai/${file.filename}`;

    await this.sanBaiService.updateAnhSan(Number(id), path);

    return {
      message: "Upload thành công",
      path: path,
    };
  }
}
