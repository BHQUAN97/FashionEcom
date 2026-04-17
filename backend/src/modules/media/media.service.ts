import { randomUUID } from 'crypto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { MediaEntity } from './entities/media.entity';
import { MediaQueryDto } from './dto/media-query.dto';
import { BaseService } from '@/common/services/base.service';

// Multer file interface (tranh import Express.Multer.File truc tiep)
interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/** Whitelist MIME types duoc phep upload */
const ALLOWED_MIMETYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

/** Extensions bi chan — chong upload shell/script */
const BLOCKED_EXTENSIONS = new Set([
  '.php', '.phtml', '.php3', '.php4', '.php5',
  '.exe', '.bat', '.cmd', '.sh', '.ps1',
  '.jsp', '.asp', '.aspx', '.cgi', '.pl',
  '.htaccess', '.svg', '.html', '.htm', '.js',
]);

/** Map MIME type -> safe extension */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

@Injectable()
export class MediaService extends BaseService<MediaEntity> {
  // Thu muc luu tru goc
  private readonly storagePath = path.resolve(process.cwd(), 'storage');

  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepo: Repository<MediaEntity>,
  ) {
    super(mediaRepo, 'sysMediaId', 'Media');
    // Dam bao thu muc storage ton tai (sync chi chay 1 lan khi khoi tao)
    if (!existsSync(this.storagePath)) {
      fs.mkdir(this.storagePath, { recursive: true });
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
   * Upload file — validate MIME/extension, luu vao local storage, tao record trong DB
   * BAO MAT: whitelist MIME type + block dangerous extensions + regenerate filename
   */
  async upload(file: UploadedFile, userId: string | null) {
    // Validate MIME type
    if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `File type '${file.mimetype}' khong duoc phep. Chi chap nhan: ${[...ALLOWED_MIMETYPES].join(', ')}`,
      );
    }

    // Validate extension — chong upload shell/script voi fake MIME
    const originalExt = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTENSIONS.has(originalExt)) {
      throw new BadRequestException(`Extension '${originalExt}' bi chan vi ly do bao mat`);
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const subDir = path.join(this.storagePath, 'uploads', yearMonth);

    await fs.mkdir(subDir, { recursive: true });

    // Regenerate filename voi safe extension tu MIME type (khong dung extension goc)
    const safeExt = MIME_TO_EXT[file.mimetype] || originalExt;
    const uniqueName = `${randomUUID()}${safeExt}`;
    const filePath = path.join(subDir, uniqueName);

    // Ghi file (async — khong block event loop)
    await fs.writeFile(filePath, file.buffer);

    // Luu record
    const relativePath = `/uploads/${yearMonth}/${uniqueName}`;
    const media = this.mediaRepo.create({
      sysMediaId: randomUUID(),
      sysMediaFilename: file.originalname,
      sysMediaPath: relativePath,
      sysMediaType: file.mimetype.startsWith('video') ? 2 : 1,
      sysMediaSize: file.size,
      sysMediaAlt: path.basename(file.originalname, path.extname(file.originalname)),
      sysUserId: userId,
    });

    return this.mediaRepo.save(media);
  }

  /**
   * Xoa media — xoa file vat ly + record DB
   * BAO MAT: validate resolved path nam trong storage directory (chong path traversal)
   */
  async remove(id: string) {
    const media = await super.findOne(id);

    // BAO MAT: Path traversal protection — dam bao file nam trong storagePath
    const fullPath = path.resolve(this.storagePath, media.sysMediaPath.replace(/^\//, ''));
    if (!fullPath.startsWith(this.storagePath)) {
      throw new BadRequestException('Duong dan file khong hop le — path traversal detected');
    }

    // Xoa file vat ly (async)
    try {
      await fs.unlink(fullPath);
    } catch {
      // File khong ton tai — bo qua
    }

    return this.mediaRepo.remove(media);
  }
}
