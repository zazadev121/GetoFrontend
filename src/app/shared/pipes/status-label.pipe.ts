import { Pipe, PipeTransform } from '@angular/core';
import { UserStatus } from '../../core/models/enums';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: number | UserStatus | string | null | undefined): string {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    
    switch (numericValue) {
      case UserStatus.Approved:
        return 'Approved';
      case UserStatus.Pending:
        return 'Pending';
      case UserStatus.Rejected:
        return 'Rejected';
      case UserStatus.Resubmission:
        return 'Resubmission';
      default:
        return 'Unknown';
    }
  }
}
