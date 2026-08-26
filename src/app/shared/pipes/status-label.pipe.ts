import { Pipe, PipeTransform, inject } from '@angular/core';
import { UserStatus } from '../../core/models/enums';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'statusLabel',
  standalone: true,
  pure: false
})
export class StatusLabelPipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: number | UserStatus | string | null | undefined): string {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    
    switch (numericValue) {
      case UserStatus.Approved:
        return this.translationService.t('status.approved');
      case UserStatus.Pending:
        return this.translationService.t('status.pending');
      case UserStatus.Rejected:
        return this.translationService.t('status.rejected');
      case UserStatus.Resubmission:
        return this.translationService.t('status.resubmission');
      default:
        return this.translationService.t('status.unknown');
    }
  }
}
