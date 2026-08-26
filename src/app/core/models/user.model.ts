import { UserRoles, UserStatus, UserPhase } from './enums';
import { DocumentDto } from './document.model';

export interface UserWithDocumentsDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRoles;
  status: UserStatus;
  userPhase: UserPhase;
  isVerified: boolean;
  documents: DocumentDto[];
}
