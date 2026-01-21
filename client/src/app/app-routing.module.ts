import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioGeneratorComponent } from './components/portfolio-generator/portfolio-generator.component';
import { ResumeCreatorComponent } from './components/resume-creator/resume-creator.component';
import { AtsCheckerComponent } from './components/ats-checker/ats-checker.component';

const routes: Routes = [
  { path: 'portfolio', component: PortfolioGeneratorComponent },
  { path: 'resume', component: ResumeCreatorComponent },
  { path: 'ats', component: AtsCheckerComponent },
  { path: '', redirectTo: '/portfolio', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
