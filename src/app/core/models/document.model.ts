import { UserPhase } from './enums';

export interface DocumentDto {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  phase: UserPhase;
}
