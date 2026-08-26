import { Pipe, PipeTransform, inject } from '@angular/core';
import { UserPhase } from '../../core/models/enums';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 'phaseLabel',
  standalone: true,
  pure: false
})
export class PhaseLabelPipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: number | UserPhase | string | null | undefined): string {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);

    switch (numericValue) {
      case UserPhase.PhaseOne:
        return this.translationService.t('phase.phaseOne');
      case UserPhase.PhaseTwo:
        return this.translationService.t('phase.phaseTwo');
      case UserPhase.PhaseThree:
        return this.translationService.t('phase.phaseThree');
      case UserPhase.Canceled:
        return this.translationService.t('phase.canceled');
      default:
        return 'N/A';
    }
  }
}
