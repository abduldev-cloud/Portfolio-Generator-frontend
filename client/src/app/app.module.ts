import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PortfolioGeneratorComponent } from './components/portfolio-generator/portfolio-generator.component';
import { ResumeCreatorComponent } from './components/resume-creator/resume-creator.component';
import { AtsCheckerComponent } from './components/ats-checker/ats-checker.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    PortfolioGeneratorComponent,
    ResumeCreatorComponent,
    AtsCheckerComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
