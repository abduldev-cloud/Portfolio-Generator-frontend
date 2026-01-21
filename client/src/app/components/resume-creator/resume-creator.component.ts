import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-resume-creator',
  templateUrl: './resume-creator.component.html',
  styleUrls: ['./resume-creator.component.css']
})
export class ResumeCreatorComponent implements OnInit {
  userId = 1;
  templateSelected = false;
  selectedTemplate = 'classic';
  resume = {
    personalInfo: { name: '', email: '' },
    experience: [{ company: '', role: '', desc: '' }],
    skills: [] as string[]
  };
  skillString = '';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadResume();
  }

  selectTemplate(template: string) {
    this.selectedTemplate = template;
    this.templateSelected = true;
  }

  addExperience() {
    this.resume.experience.push({ company: '', role: '', desc: '' });
  }

  removeExperience(index: number) {
    this.resume.experience.splice(index, 1);
  }

  updateSkills() {
    this.resume.skills = this.skillString.split(',').map(s => s.trim()).filter(s => s !== '');
  }

  save() {
    this.updateSkills();
    this.apiService.saveResume(this.userId, this.resume).subscribe({
      next: () => alert('Resume saved successfully!'),
      error: (err) => alert('Error saving resume: ' + err.error?.error || err.message)
    });
  }

  loadResume() {
    this.apiService.getResume(this.userId).subscribe({
      next: (data) => {
        if (data) {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          this.resume = parsed || this.resume;
          this.skillString = this.resume.skills ? this.resume.skills.join(', ') : '';
        }
      },
      error: (err) => console.log('No existing data found')
    });
  }

  downloadPdf() {
    this.updateSkills();
    this.apiService.exportToPdf(this.resume, this.selectedTemplate).subscribe({
      next: (blob) => this.downloadFile(blob, 'resume.pdf'),
      error: (err) => alert('Export failed: ' + err.message)
    });
  }

  downloadWord() {
    this.updateSkills();
    this.apiService.exportToWord(this.resume).subscribe({
      next: (blob) => this.downloadFile(blob, 'resume.docx'),
      error: (err) => alert('Export failed: ' + err.message)
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
