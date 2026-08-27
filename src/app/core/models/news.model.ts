export interface NewsDto {
  id: number;
  title: string;
  text: string;
  dateCreated: string;
}

export interface CreateNewsDto {
  title: string;
  text: string;
}
