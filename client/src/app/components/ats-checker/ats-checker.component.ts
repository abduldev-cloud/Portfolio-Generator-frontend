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
  parsing = false;
  activeTab = 'overview';
  selectedFile: File | null = null;

  constructor(private apiService: ApiService) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Basic validation
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
        alert('Invalid file type. Please upload a PDF or Word document.');
        event.target.value = ''; // Reset
        return;
      }

      this.selectedFile = file;
      this.uploadResume();
      
      // Reset input so user can pick same file again if needed
      event.target.value = '';
    }
  }

  uploadResume() {
    if (!this.selectedFile) return;

    this.parsing = true;
    this.apiService.parseResume(this.selectedFile).subscribe({
      next: (res) => {
        this.resumeText = res.text;
        this.parsing = false;
        console.log('[Astra Agent] Resume parsed successfully');
      },
      error: (err) => {
        console.error('[Astra Agent] Parsing failed:', err);
        alert('Failed to parse file. Please ensure it is a valid PDF or DOCX.');
        this.parsing = false;
      }
    });
  }

  checkScore() {
    if (!this.resumeText || !this.jobDescription) {
      alert('Please provide both resume text and job description.');
      return;
    }

    this.loading = true;
    this.apiService.checkAtsScore(this.resumeText, this.jobDescription).subscribe({
      next: (res) => {
        this.analysis = res;
        this.loading = false;
        this.activeTab = 'overview';
        console.log('[Astra Agent] Analysis received:', res);
      },
      error: (err) => {
        console.error('[Astra Agent] Error:', err);
        alert('Agent execution failed. Check your API key and server connection.');
        this.loading = false;
      }
    });
  }

  reset() {
    this.analysis = null;
    this.activeTab = 'overview';
  }

  // Helper: get a specific tool result from steps_executed
  getToolResult(toolName: string): any {
    if (!this.analysis?.steps_executed) return null;
    const step = this.analysis.steps_executed.find((s: any) => s.tool === toolName);
    return step?.result || null;
  }

  get resumeData(): any {
    return this.getToolResult('resume_parser') || {};
  }

  get jobData(): any {
    return this.getToolResult('job_analyzer') || {};
  }

  get matchData(): any {
    return this.getToolResult('skill_matcher') || {};
  }

  get overallScore(): number {
    return this.analysis?.final_analysis?.overall_score || this.matchData?.overall_score || 0;
  }

  get hiringBand(): string {
    return this.analysis?.final_analysis?.hiring_probability_band || this.matchData?.hiring_probability_band || 'Unknown';
  }

  get hiringBandClass(): string {
    return this.hiringBand.toLowerCase().replace(/\s+/g, '-');
  }

  copyToClipboard(text: any) {
    if (!text) return;
    const str = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(str).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  }
}
