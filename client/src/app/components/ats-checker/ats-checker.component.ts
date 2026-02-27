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
  analysis: any = null;
  loading = false;
  activeTab = 'roadmap';

  constructor(private apiService: ApiService) { }

  checkScore() {
    if (!this.resumeText || !this.jobDescription) {
      alert('Please provide both resume text and job description to initialize analysis.');
      return;
    }

    this.loading = true;
    this.apiService.checkAtsScore(this.resumeText, this.jobDescription).subscribe({
      next: (res) => {
        // Ensure some defaults if AI structure varies slightly
        if (res && res.ats_report) {
          this.analysis = res;
        } else {
          // Fallback if AI didn't return perfect JSON structure
          this.analysis = {
            executive_summary: "Analysis complete, but structural normalization failed. Please review raw output.",
            ats_report: { overall_score: 0, hiring_probability_band: "Unknown" },
            ...res
          };
        }
        this.loading = false;
        this.activeTab = 'roadmap';
      },
      error: (err) => {
        console.error('AI Strategy Interface Error:', err);
        alert('The Intelligence Engine encountered an error. Verify your Gemini API Key in the server .env file.');
        this.loading = false;
      }
    });
  }

  reset() {
    this.analysis = null;
    this.activeTab = 'roadmap';
  }

  copyToClipboard(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Optimized resume content copied to clipboard! You can now paste this into your template.');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }
}
