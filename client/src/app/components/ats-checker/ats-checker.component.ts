import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-ats-checker',
  templateUrl: './ats-checker.component.html',
  styleUrls: ['./ats-checker.component.css']
})
export class AtsCheckerComponent {
  resumeText = '';
  jobDescription = '';
  results: any = null;

  constructor(private apiService: ApiService) { }

  checkScore() {
    if (!this.resumeText || !this.jobDescription) {
      alert('Please provide both resume text and job description');
      return;
    }

    this.apiService.checkAtsScore(this.resumeText, this.jobDescription).subscribe({
      next: (res) => {
        this.results = res;
      },
      error: (err) => console.error('Check failed', err)
    });
  }
}
