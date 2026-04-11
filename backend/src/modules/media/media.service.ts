import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { MediaEntity } from './entities/media.entity';
import { MediaQueryDto } from './dto/media-query.dto';
import { BaseService } from '../../common/services/base.service';

// Multer file interface (tranh import Express.Multer.File truc tiep)
interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class MediaService extends BaseService<MediaEntity> {
  // Thu muc luu tru goc
  private readonly storagePath = path.resolve(process.cwd(), 'storage');

  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepo: Repository<MediaEntity>,
  ) {
    super(mediaRepo, 'sysMediaId', 'Media');
    // Dam bao thu muc storage ton tai
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  /**
   * Danh sach media + filter + pagination
   */
  async findAll(query: MediaQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.mediaRepo.createQueryBuilder('m');

    if (query.search) {
      qb.andWhere('m.sysMediaFilename LIKE :s', { s: `%${query.search}%` });
    }
    if (query.type !== undefined) {
      qb.andWhere('m.sysMediaType = :type', { type: query.type });
    }

    qb.orderBy('m.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return this.paginate(data, total, page, limit);
  }

  /**
   * Upload file — luu vao local storage, tao record trong DB
   * Sharp resize se duoc bo sung sau khi cai sharp package
   */
  async upload(file: UploadedFile, userId: string | null) {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const subDir = path.join(this.storagePath, 'uploads', yearMonth);

    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    // Tao ten file unique
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    const filePath = path.join(subDir, uniqueName);

    // Ghi file
    fs.writeFileSync(filePath, file.buffer);

    // Luu record
    const relativePath = `/uploads/${yearMonth}/${uniqueName}`;
    const media = this.mediaRepo.create({
      sysMediaId: uuidv4(),
      sysMediaFilename: file.originalname,
      sysMediaPath: relativePath,
      sysMediaType: file.mimetype.startsWith('video') ? 2 : 1,
      sysMediaSize: file.size,
      sysMediaAlt: path.basename(file.originalname, ext),
      sysUserId: userId,
    });

    return this.mediaRepo.save(media);
  }

  /**
   * Xoa media — xoa file vat ly + record DB
   */
  async remove(id: string) {
    const media = await super.findOne(id);

    // Xoa file vat ly
    const fullPath = path.join(this.storagePath, media.sysMediaPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return this.mediaRepo.remove(media);
  }
}
