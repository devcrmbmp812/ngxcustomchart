import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { GaugeComponent } from './lib/gauge/gauge.component';

import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  providers: [],
  declarations: [
    AppComponent,
    GaugeComponent,
  ],
  imports: [
    BrowserModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
