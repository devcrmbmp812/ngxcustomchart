
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import * as shape from 'd3-shape';
import * as d3 from 'd3';

import { colorSets } from '@swimlane/ngx-charts/release/utils/color-sets';
import { formatLabel } from '@swimlane/ngx-charts/release/common/label.helper';
import {
  single,
  multi,
  generateData,
  timelineFilterBarData,
  fiscalYearReport
} from './data';
import { data as countries } from 'emoji-flags';
import chartGroups from './chartTypes';

function multiFormat(value) {
  if (value < 1000) return `${value.toFixed(2)}ms`;
  value /= 1000;
  if (value < 60) return `${value.toFixed(2)}s`;
  value /= 60;
  if (value < 60) return `${value.toFixed(2)}mins`;
  value /= 60;
  return `${value.toFixed(2)}hrs`;
}

@Component({
  selector: 'app-root',
  providers: [Location, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../node_modules/@swimlane/ngx-ui/release/index.css', './app.component.scss'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  legend_left: boolean = false;
  legend_top: boolean = false;
  legend_right: boolean = true;
  legend_bottom: boolean = false;

  theme = 'dark';
  chartType: string;
  chartGroups: any[];
  chart: any;
  realTimeData: boolean = false;
  countries: any[];
  single: any[];
  multi: any[];
  fiscalYearReport: any[];
  dateData: any[];
  dateDataWithRange: any[];
  statusData: any[];
  sparklineData: any[];
  timelineFilterBarData: any[];
  linearScale: boolean = false;
  range: boolean = false;

  view: any[];
  width: number = 700;
  height: number = 300;
  fitContainer: boolean = false;

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = 'Legend';
  showXAxisLabel = true;
  tooltipDisabled = false;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'GDP Per Capita';
  showGridLines = true;
  innerPadding = '10%';
  barPadding = 8;
  groupPadding = 16;
  roundDomains = false;
  maxRadius = 10;
  minRadius = 3;
  showSeriesOnHover = true;
  roundEdges: boolean = true;
  animations: boolean = true;
  xScaleMin: any;
  xScaleMax: any;
  yScaleMin: number;
  yScaleMax: number;
  showDataLabel = false;

  curves = {
    Basis: shape.curveBasis,
    'Basis Closed': shape.curveBasisClosed,
    Bundle: shape.curveBundle.beta(1),
    Cardinal: shape.curveCardinal,
    'Cardinal Closed': shape.curveCardinalClosed,
    'Catmull Rom': shape.curveCatmullRom,
    'Catmull Rom Closed': shape.curveCatmullRomClosed,
    Linear: shape.curveLinear,
    'Linear Closed': shape.curveLinearClosed,
    'Monotone X': shape.curveMonotoneX,
    'Monotone Y': shape.curveMonotoneY,
    Natural: shape.curveNatural,
    Step: shape.curveStep,
    'Step After': shape.curveStepAfter,
    'Step Before': shape.curveStepBefore,
    default: shape.curveLinear
  };

  // line interpolation
  curveType: string = 'Linear';
  curve: any = this.curves[this.curveType];
  interpolationTypes = [
    'Basis',
    'Bundle',
    'Cardinal',
    'Catmull Rom',
    'Linear',
    'Monotone X',
    'Monotone Y',
    'Natural',
    'Step',
    'Step After',
    'Step Before'
  ];

  closedCurveType: string = 'Linear Closed';
  closedCurve: any = this.curves[this.closedCurveType];
  closedInterpolationTypes = ['Basis Closed', 'Cardinal Closed', 'Catmull Rom Closed', 'Linear Closed'];

  colorSets: any;
  colorScheme: any;
  schemeType: string = 'ordinal';
  
  rangeFillOpacity: number = 0.15;

  // pie
  showLabels = true;
  explodeSlices = false;
  doughnut = false;
  arcWidth = 0.25;

  // line, area
  autoScale = true;
  timeline = false;

  // margin
  margin: boolean = false;
  marginTop: number = 40;
  marginRight: number = 40;
  marginBottom: number = 40;
  marginLeft: number = 40;

  // demos
  totalSales = 0;
  salePrice = 100;
  personnelCost = 100;

  mathText = '3 - 1.5*sin(x) + cos(2*x) - 1.5*abs(cos(x))';
  mathFunction: (o: any) => any;

  sumBy: string = 'Size';

  // Reference lines
  showRefLines: boolean = true;
  showRefLabels: boolean = true;

  // Supports any number of reference lines.
  refLines = [{ value: 42500, name: 'Maximum' }, { value: 37750, name: 'Average' }, { value: 33000, name: 'Minimum' }];

  constructor(public location: Location) {
    this.mathFunction = this.getFunction();

    Object.assign(this, {
      single,
      multi,
      countries,
      chartGroups,
      colorSets,
      plotData: this.generatePlotData(),
      fiscalYearReport
    });

    this.dateData = generateData(5, false);
    this.dateDataWithRange = generateData(2, true);
    this.setColorScheme('cool');
    this.statusData = this.getStatusData();
    this.sparklineData = generateData(1, false, 30);
    this.timelineFilterBarData = timelineFilterBarData();
  }

  get dateDataWithOrWithoutRange() {
    if (this.range) {
      return this.dateDataWithRange;
    } else {
      return this.dateData;
    }
  }

  ngOnInit() {
    const state = this.location.path(true);
    this.selectChart(state.length ? state : 'libgauge');

    // setInterval(this.updateData.bind(this), 1000);

    if (!this.fitContainer) {
      this.applyDimensions();
    }
  }

  applyDimensions() {
    this.view = [this.width, this.height];
  }

  toggleFitContainer(event) {
    this.fitContainer = event;

    if (this.fitContainer) {
      this.view = undefined;
    } else {
      this.applyDimensions();
    }
  }

  selectChart(chartSelector) {
    this.chartType = chartSelector = chartSelector.replace('/', '');
    this.location.replaceState(this.chartType);

    for (const group of this.chartGroups) {
      this.chart = group.charts.find(x => x.selector === chartSelector);
      if (this.chart) break;
    }

    this.linearScale = false;
    this.yAxisLabel = 'GDP Per Capita';
    this.xAxisLabel = 'Country';

    this.width = 700;
    this.height = 300;

    Object.assign(this, this.chart.defaults);

    if (!this.fitContainer) {
      this.applyDimensions();
    }
  }

  select(data) {
    console.log('Item clicked', data);
  }

  getInterpolationType(curveType) {
    return this.curves[curveType] || this.curves['default'];
  }

  setColorScheme(name) {
    
    this.colorScheme = this.colorSets.find(s => s.name === name);
  }

  onLegendLabelClick(entry) {
    console.log('Legend clicked', entry);
  }

  pieTooltipText({ data }) {
    const label = formatLabel(data.name);
    const val = formatLabel(data.value);

    return `
      <span class="tooltip-label">${label}</span>
      <span class="tooltip-val">$${val}</span>
    `;
  }

  dollarValueFormat(c): string {
    return `\$${c.value.toLocaleString()}`;
  }

  getStatusData() {
    const sales = Math.round(1e4 * Math.random());
    const dur = 36e5 * Math.random();
    return this.calcStatusData(sales, dur);
  }

  calcStatusData(sales = this.statusData[0].value, dur = this.statusData[2].value) {
    const ret = sales * this.salePrice;
    const cost = ((sales * dur) / 60 / 60 / 1000) * this.personnelCost;
    const ROI = (ret - cost) / cost;
    return [
      {
        name: 'Sales',
        value: sales
      },
      {
        name: 'Gross',
        value: ret,
        extra: { format: 'currency' }
      },
      {
        name: 'Avg. Time',
        value: dur,
        extra: { format: 'time' }
      },
      {
        name: 'Cost',
        value: cost,
        extra: { format: 'currency' }
      },
      {
        name: 'ROI',
        value: ROI,
        extra: { format: 'percent' }
      }
    ];
  }

  statusValueFormat(c): string {
    switch (c.data.extra ? c.data.extra.format : '') {
      case 'currency':
        return `\$${Math.round(c.value).toLocaleString()}`;
      case 'time':
        return multiFormat(c.value);
      case 'percent':
        return `${Math.round(c.value * 100)}%`;
      default:
        return c.value.toLocaleString();
    }
  }

  valueFormatting(value: number): string {
    return `${Math.round(value).toLocaleString()} €`;
  }

  currencyFormatting(value: number) {
    return `\$${Math.round(value).toLocaleString()}`;
  }

  gdpLabelFormatting(c) {
    return `${c.label}<br/><small class="number-card-label">GDP Per Capita</small>`;
  }

  statusLabelFormat(c): string {
    return `${c.label}<br/><small class="number-card-label">This week</small>`;
  }

  generatePlotData() {
    if (!this.mathFunction) {
      return [];
    }
    const twoPi = 2 * Math.PI;
    const length = 25;
    const series = Array.apply(null, { length }).map((d, i) => {
      const x = i / (length - 1);
      const t = x * twoPi;
      return {
        name: ~~(x * 360),
        value: this.mathFunction(t)
      };
    });

    return [
      {
        name: this.mathText,
        series
      }
    ];
  }

  getFunction(text = this.mathText) {
    try {
      text = `with (Math) { return ${this.mathText} }`;
      const fn = new Function('x', text).bind(Math);
      return typeof fn(1) === 'number' ? fn : null;
    } catch (err) {
      return null;
    }
  }

  getFlag(country) {
    return this.countries.find(c => c.name === country).emoji;
  }

  onFilter(event) {
    console.log('timeline filter', event);
  }

  /*
  **
  Combo Chart
  **
  [yLeftAxisScaleFactor]="yLeftAxisScale" and [yRightAxisScaleFactor]="yRightAxisScale"
  exposes the left and right min and max axis values for custom scaling, it is probably best to
  scale one axis in relation to the other axis but for flexibility to scale either the left or
  right axis bowth were exposed.
  **
  */

  yLeftAxisScale(min, max) {
    return { min: `${min}`, max: `${max}` };
  }

  yRightAxisScale(min, max) {
    return { min: `${min}`, max: `${max}` };
  }

  yLeftTickFormat(data) {
    return `${data.toLocaleString()}`;
  }

  yRightTickFormat(data) {
    return `${data}%`;
  }
  /*
  **
  End of Combo Chart
  **
  */

  onSelect(event) {
    console.log(event);
  }

  dblclick(event) {
    console.log('Doube click', event);
  }

  positions = 'right top left bottom'.split(' ');
  onLegendChange(position) {
    
    switch(position) { 
      case "left": { 
         this.legend_left = true;
         this.legend_bottom = false;
         this.legend_right = false;
         this.legend_top = false;
         break; 
      } 
      case "top": { 
         this.legend_top = true;
         this.legend_bottom = false;
         this.legend_left = false;
         this.legend_right = false;
         break; 
      } 
      case "right": { 
        this.legend_right = true;
        this.legend_top = false;
        this.legend_bottom = false;
        this.legend_left = false;
        break; 
      } 
      case "bottom": { 
        this.legend_bottom = true;
        this.legend_right = false;
        this.legend_top = false;
        this.legend_left = false;
        break; 
      }
      default: { 
         break; 
      } 
    } 
  }
}

