export interface NewsAttachmentDto {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export const MAX_NEWS_PHOTOS = 4;

export function isNewsPhotoFileName(fileName: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(fileName);
}

export interface NewsLinkDto {
  label: string;
  url: string;
}

export interface NewsDto {
  id: number;
  title: string;
  text: string;
  titleEn?: string;
  textEn?: string;
  dateCreated: string;
  links?: NewsLinkDto[];
  attachments?: NewsAttachmentDto[];
}

export interface CreateNewsDto {
  title: string;
  text: string;
  titleEn?: string;
  textEn?: string;
  links?: NewsLinkDto[];
}
