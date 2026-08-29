import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * The slowly rotating wax-seal badge — a small piece of physical-feeling craft
 * that anchors the hero blocks the way a stamped seal anchors a document.
 */
@Component({
  selector: 'app-seal-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seal" [attr.aria-label]="text">
      <svg class="seal__ring" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id="seal-path-{{ uid }}"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
        </defs>
        <text>
          <textPath [attr.href]="'#seal-path-' + uid" startOffset="0">{{ text }}</textPath>
        </text>
      </svg>
      <span class="seal__mark" aria-hidden="true">
        <i class="fa-solid" [ngClass]="icon"></i>
      </span>
    </div>
  `
})
export class SealBadgeComponent {
  @Input() text = 'GETO PROJECT · SINCE 2020 · ';
  @Input() icon = 'fa-seedling';

  /** Unique id so several seals on one page don't share a text path. */
  uid = Math.random().toString(36).slice(2, 8);
}
