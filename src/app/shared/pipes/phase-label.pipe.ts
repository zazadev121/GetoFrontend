import { Pipe, PipeTransform } from '@angular/core';
import { UserPhase } from '../../core/models/enums';

@Pipe({
  name: 'phaseLabel',
  standalone: true
})
export class PhaseLabelPipe implements PipeTransform {
  transform(value: number | UserPhase | string | null | undefined): string {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);

    switch (numericValue) {
      case UserPhase.PhaseOne:
        return 'Phase One';
      case UserPhase.PhaseTwo:
        return 'Phase Two';
      case UserPhase.PhaseThree:
        return 'Phase Three';
      case UserPhase.Canceled:
        return 'Canceled';
      default:
        return 'N/A';
    }
  }
}
