import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-interview-simulator',
  templateUrl: './interview-simulator.component.html',
  styleUrls: ['./interview-simulator.component.css']
})
export class InterviewSimulatorComponent {
  resumeText = '';
  jobDescription = '';
  data: any = null;
  loading = false;
  activeTab = 'technical';
  expandedQuestion: number | null = null;

  constructor(private apiService: ApiService) { }

  generate() {
    if (!this.resumeText || !this.jobDescription) {
      alert('Please provide both resume text and job description.');
      return;
    }

    this.loading = true;
    this.apiService.generateInterview(this.resumeText, this.jobDescription).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.activeTab = 'technical';
      },
      error: (err) => {
        console.error('Interview generation failed:', err);
        alert('Failed to generate interview prep. Check API key.');
        this.loading = false;
      }
    });
  }

  reset() {
    this.data = null;
    this.expandedQuestion = null;
  }

  toggleQuestion(index: number) {
    this.expandedQuestion = this.expandedQuestion === index ? null : index;
  }

  getDifficultyClass(difficulty: string): string {
    return (difficulty || 'medium').toLowerCase();
  }
}
