import {
  Controller, Get, Post, Delete,
  Param, Query, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MediaQueryDto } from './dto/media-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER,
    UserRole.STAFF, UserRole.CONTENT_EDITOR,
  )
  async findAll(@Query() query: MediaQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Post('upload')
  @Roles(
    UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER,
    UserRole.STAFF, UserRole.CONTENT_EDITOR,
  )
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.mediaService.upload(file, userId);
    return { data, message: 'Upload thanh cong' };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.mediaService.remove(id);
    return { data: null, message: 'Xoa media thanh cong' };
  }
}
