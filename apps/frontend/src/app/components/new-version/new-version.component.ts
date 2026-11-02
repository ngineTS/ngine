import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';

@Component({
  selector: 'app-version-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stage">
      <div class="wrap">

        <h1 class="title">Great things are coming!</h1>

        <div class="labels">
          <span class="ver v1">V1</span>
          <span class="ver v2">V2</span>
        </div>

        <div class="bar-region">
          <div class="bar-outer">
            <div class="bar-fill" [style.width.%]="filled ? target : 0"></div>
            <div class="bar-tip" [style.left.%]="filled ? target : 0">
              <div class="bar-tip-ring"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .wrap {
      display: flex;
      flex-direction: column;
      gap: 44px;
    }

    .title {
      text-align: center;
    }

    .labels {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .ver {
      font-size: clamp(36px, 6vw, 48px);
      font-weight: 700;
      letter-spacing: .03em;
      line-height: 1;
    }

    .ver.v1 { color: #2B2B2B; }
    .ver.v2 { color: #985ab5; }

    .bar-region { position: relative; }

    .bar-outer {
      height: 22px;
      border-radius: 100px;
      background: rgba(152, 90, 181, .1);
      border: 1px solid rgba(152, 90, 181, .18);
      position: relative;
      overflow: visible;
    }

    .bar-fill {
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 0;
      border-radius: 100px;
      background: #985ab5;
      transition: width 2s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .bar-fill::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
      animation: sheen 2.8s linear infinite;
    }

    @keyframes sheen {
      from { transform: translateX(-100%); }
      to   { transform: translateX(200%); }
    }

    .bar-tip {
      position: absolute;
      top: 50%; left: 0;
      transform: translate(-50%, -50%);
      transition: left 2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }

    .bar-tip-ring {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: #985ab5;
      box-shadow: 0 0 0 7px rgba(152, 90, 181, .15);
      animation: pulse 2.2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 7px rgba(152, 90, 181, .15); }
      50%       { box-shadow: 0 0 0 14px rgba(152, 90, 181, .05); }
    }
  `]
})
export class NewVersionComponent extends NavigationBaseComponent {
  readonly target = 60;
  filled = false;

  constructor(private cdr: ChangeDetectorRef) { super(); }

  ngOnInit(): void {
    setTimeout(() => {
      this.filled = true;
      this.cdr.markForCheck();
    }, 200);
  }
}
