import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { PortfolioGeneratorComponent } from './components/portfolio-generator/portfolio-generator.component';
import { ResumeCreatorComponent } from './components/resume-creator/resume-creator.component';
import { AtsCheckerComponent } from './components/ats-checker/ats-checker.component';
import { InterviewSimulatorComponent } from './components/interview-simulator/interview-simulator.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'portfolio', component: PortfolioGeneratorComponent },
  { path: 'resume', component: ResumeCreatorComponent },
  { path: 'ats', component: AtsCheckerComponent },
  { path: 'interview', component: InterviewSimulatorComponent },
  { path: 'admin', component: AdminDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
