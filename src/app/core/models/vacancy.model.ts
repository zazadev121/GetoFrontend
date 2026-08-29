export interface VacancyAttachmentDto {
  id: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface VacancyLinkDto {
  label: string;
  url: string;
}

export interface VacancyDto {
  id: number;
  title: string;
  text: string;
  titleEn?: string;
  textEn?: string;
  salary?: string;
  dateCreated: string;
  links?: VacancyLinkDto[];
  attachments?: VacancyAttachmentDto[];
}

export interface CreateVacancyDto {
  title: string;
  text: string;
  titleEn?: string;
  textEn?: string;
  salary?: string;
  links?: VacancyLinkDto[];
}
