import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

import { calculateViewDimensions, ViewDimensions } from '@swimlane/ngx-charts/release/common/view-dimensions.helper';
import { ColorHelper } from '@swimlane/ngx-charts/release/common/color.helper';
import { BaseChartComponent } from '@swimlane/ngx-charts/release/common/base-chart.component';

@Component({
  selector: 'app-gauge',
  template: `
  <ngx-charts-chart
  [view]="[width, height]"
  [showLegend]="legend"
  [legendOptions]="legendOptions"
  [activeEntries]="activeEntries"
  [animations]="animations"
  (legendLabelActivate)="onActivate($event)"
  (legendLabelDeactivate)="onDeactivate($event)"
  (legendLabelClick)="onClick($event)"
>
  <svg:g [attr.transform]="translation" class="pie-chart chart">
    <svg:g ngx-charts-pie-series
      [colors]="colors"
      [series]="data"
      [showLabels]="false"
      [labelFormatting]="labelFormatting"
      [trimLabels]="trimLabels"
      [maxLabelLength]="maxLabelLength"
      [activeEntries]="activeEntries"
      [innerRadius]="innerRadius"
      [outerRadius]="outerRadius"
      [explodeSlices]="explodeSlices"
      [gradient]="gradient"
      [animations]="animations"
      [tooltipDisabled]="tooltipDisabled"
      [tooltipTemplate]="tooltipTemplate"
      [tooltipText]="tooltipText"
      (dblclick)="dblclick.emit($event)"
      (select)="onClick($event)"
      (activate)="onActivate($event)"
      (deactivate)="onDeactivate($event)"
    />
  </svg:g>
</ngx-charts-chart>
  `,
  styleUrls: ['./gauge.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeComponent extends BaseChartComponent {

  @Input() labels = false;
  @Input() legend = false;
  @Input() legendTitle: string = 'Legend';
  @Input() explodeSlices = false;
  @Input() doughnut = false;
  @Input() arcWidth = 0.25;
  @Input() gradient: boolean;
  @Input() activeEntries: any[] = [];
  @Input() tooltipDisabled: boolean = false;
  @Input() labelFormatting: any;
  @Input() trimLabels: boolean = true;
  @Input() maxLabelLength: number = 10;
  @Input() tooltipText: any;

  @Output() dblclick = new EventEmitter();
  @Output() select = new EventEmitter();
  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;

  data: any;
  dims: ViewDimensions;
  domain: any[];
  outerRadius: number;
  innerRadius: number;
  transform: string;
  colors: ColorHelper;
  legendWidth: number;
  margin = [20, 20, 20, 20];
  legendOptions: any;
  translation: string;

  @Input() valueFormatting: (value: number) => any;
  @Input() nameFormatting: (value: string) => any;
  @Input() percentageFormatting: (value: number) => any;

  update(): void {
    super.update();

    this.dims = calculateViewDimensions({
      width: (this.width * 4) / 12.0,
      height: this.height,
      margins: this.margin,
      showLegend: true,
    });

    // const xOffset = this.dims.width / 2;
    // const yOffset = this.margin[0] + this.dims.height / 2;
    
    const xOffset = this.margin[3] + this.dims.width / 2;
    const yOffset = this.margin[0] + this.dims.height / 2;
    this.translation = `translate(${xOffset}, ${xOffset})`;
    // this.transform = `translate(${xOffset} , ${yOffset})`;
    this.legendWidth = this.width - this.dims.width - this.margin[1];

    this.outerRadius = Math.min(this.dims.width, this.dims.height) / 2.5;
    this.innerRadius = this.outerRadius * 0.75;


    this.domain = this.getDomain();

    // sort data according to domain
    this.data = this.results.sort((a, b) => {
      return this.domain.indexOf(a.name) - this.domain.indexOf(b.name);
    });

    
    this.setColors();
    this.legendOptions = this.getLegendOptions();
  }

  getDomain(): any[] {
    const items = [];

    this.results.map(d => {
      let label = d.name;
      if (label.constructor.name === 'Date') {
        label = label.toLocaleDateString();
      } else {
        label = label.toLocaleString();
      }

      if (items.indexOf(label) === -1) {
        items.push(label);
      }
    });

    return items;
  }

  onClick(data) {
    this.select.emit(data);
  }

  setColors(): void {
    this.colors = new ColorHelper(this.scheme, 'ordinal', this.domain, this.customColors);
  }

  onActivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [ item, ...this.activeEntries ];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

  getLegendOptions() {
    return {
      scaleType: 'ordinal',
      domain: this.domain,
      colors: this.colors,
      title: this.legendTitle
    };
  }
}

