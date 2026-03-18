import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-resume-creator',
  templateUrl: './resume-creator.component.html',
  styleUrls: ['./resume-creator.component.css']
})
export class ResumeCreatorComponent implements OnInit {
  userId = 1;
  currentStep = 'templates'; // 'templates' | 'editor'
  selectedTemplate = 'classic';
  activeSection = 'personal';

  // State
  isExporting = false;
  zoomLevel = 100;

  // GitHub Sync
  githubUsername = '';
  githubLoading = false;
  githubSynced = false;
  githubStats: any = null;

  templates = [
    { id: 'classic', name: 'Classic Professional', desc: 'Clean, traditional layout. Best for corporate & finance roles.', color: '#3b82f6', icon: '📋' },
    { id: 'modern', name: 'Modern Creative', desc: 'Bold sidebar design. Great for startups & tech roles.', color: '#8b5cf6', icon: '🎨' },
    { id: 'minimal', name: 'Minimal Clean', desc: 'Whitespace-focused elegance. Ideal for senior executives.', color: '#06b6d4', icon: '✨' },
    { id: 'developer', name: 'Developer Pro', desc: 'Code-inspired layout. Built for software engineers.', color: '#10b981', icon: '💻' },
    { id: 'executive', name: 'Executive Elite', desc: 'Premium two-column design. Made for leadership roles.', color: '#f59e0b', icon: '👔' },
    { id: 'creative', name: 'Bold & Creative', desc: 'Vibrant colors and unique structure. Perfect for designers.', color: '#ef4444', icon: '🚀' }
  ];

  resume: any = {
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      summary: ''
    },
    experience: [
      { company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [''] }
    ],
    education: [
      { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', achievements: [''] }
    ],
    skills: {
      technical: [] as string[],
      frameworks: [] as string[],
      tools: [] as string[],
      soft: [] as string[]
    },
    projects: [
      { name: '', description: '', techStack: '', liveUrl: '', repoUrl: '', startDate: '', endDate: '' }
    ],
    certifications: [
      { name: '', issuer: '', date: '', credentialUrl: '' }
    ],
    languages: [
      { language: '', proficiency: 'Professional' }
    ],
    awards: [
      { title: '', issuer: '', date: '', description: '' }
    ]
  };

  // Skill input strings
  technicalSkillString = '';
  frameworkSkillString = '';
  toolSkillString = '';
  softSkillString = '';

  sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤', required: true },
    { id: 'experience', label: 'Experience', icon: '💼', required: true },
    { id: 'education', label: 'Education', icon: '🎓', required: true },
    { id: 'skills', label: 'Skills', icon: '⚡', required: true },
    { id: 'projects', label: 'Projects', icon: '🛠️', required: false },
    { id: 'certifications', label: 'Certifications', icon: '📜', required: false },
    { id: 'languages', label: 'Languages', icon: '🌍', required: false },
    { id: 'awards', label: 'Awards', icon: '🏆', required: false }
  ];

  constructor(private apiService: ApiService) { }

  ngOnInit() { }

  selectTemplate(templateId: string) {
    this.selectedTemplate = templateId;
    this.currentStep = 'editor';
    this.activeSection = 'personal';
  }

  goBackToTemplates() {
    this.currentStep = 'templates';
  }

  // GitHub Sync
  syncGithub() {
    if (!this.githubUsername) return;
    this.githubLoading = true;

    this.apiService.getGithubProfile(this.githubUsername).subscribe({
      next: (data) => {
        // Auto-fill personal info
        if (data.personalInfo) {
          if (data.personalInfo.fullName) this.resume.personalInfo.fullName = data.personalInfo.fullName;
          if (data.personalInfo.jobTitle) this.resume.personalInfo.jobTitle = data.personalInfo.jobTitle;
          if (data.personalInfo.email) this.resume.personalInfo.email = data.personalInfo.email;
          if (data.personalInfo.location) this.resume.personalInfo.location = data.personalInfo.location;
          if (data.personalInfo.github) this.resume.personalInfo.github = data.personalInfo.github;
          if (data.personalInfo.portfolio) this.resume.personalInfo.portfolio = data.personalInfo.portfolio;
        }

        // Auto-fill technical skills
        if (data.technicalSkills?.length) {
          this.resume.skills.technical = data.technicalSkills;
          this.technicalSkillString = data.technicalSkills.join(', ');
        }

        // Auto-fill projects
        if (data.projects?.length) {
          this.resume.projects = data.projects.map((p: any) => ({
            name: p.name,
            description: p.description || '',
            techStack: p.techStack || '',
            liveUrl: p.liveUrl || '',
            repoUrl: p.repoUrl || ''
          }));
        }

        this.githubStats = data.stats;
        this.githubSynced = true;
        this.githubLoading = false;
      },
      error: (err) => {
        alert('GitHub user not found. Check the username.');
        this.githubLoading = false;
      }
    });
  }

  // Experience
  addExperience() {
    this.resume.experience.push({ company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [''] });
  }

  removeExperience(index: number) {
    this.resume.experience.splice(index, 1);
  }

  addAchievement(exp: any) {
    exp.achievements.push('');
  }

  removeAchievement(exp: any, index: number) {
    exp.achievements.splice(index, 1);
  }

  // Education
  addEducation() {
    this.resume.education.push({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', achievements: [''] });
  }

  removeEducation(index: number) {
    this.resume.education.splice(index, 1);
  }

  addEduAchievement(edu: any) {
    edu.achievements.push('');
  }

  removeEduAchievement(edu: any, index: number) {
    edu.achievements.splice(index, 1);
  }

  // Projects
  addProject() {
    this.resume.projects.push({ name: '', description: '', techStack: '', liveUrl: '', repoUrl: '', startDate: '', endDate: '' });
  }

  removeProject(index: number) {
    this.resume.projects.splice(index, 1);
  }

  // Certifications
  addCertification() {
    this.resume.certifications.push({ name: '', issuer: '', date: '', credentialUrl: '' });
  }

  removeCertification(index: number) {
    this.resume.certifications.splice(index, 1);
  }

  // Languages
  addLanguage() {
    this.resume.languages.push({ language: '', proficiency: 'Professional' });
  }

  removeLanguage(index: number) {
    this.resume.languages.splice(index, 1);
  }

  // Awards
  addAward() {
    this.resume.awards.push({ title: '', issuer: '', date: '', description: '' });
  }

  removeAward(index: number) {
    this.resume.awards.splice(index, 1);
  }

  // Skills
  updateSkills() {
    this.resume.skills.technical = this.technicalSkillString.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
    this.resume.skills.frameworks = this.frameworkSkillString.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
    this.resume.skills.tools = this.toolSkillString.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
    this.resume.skills.soft = this.softSkillString.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
  }

  // Navigation
  goToSection(sectionId: string) {
    this.activeSection = sectionId;
  }

  nextSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.activeSection);
    if (currentIndex < this.sections.length - 1) {
      this.activeSection = this.sections[currentIndex + 1].id;
    }
  }

  prevSection() {
    const currentIndex = this.sections.findIndex(s => s.id === this.activeSection);
    if (currentIndex > 0) {
      this.activeSection = this.sections[currentIndex - 1].id;
    }
  }

  getSectionProgress(): number {
    const currentIndex = this.sections.findIndex(s => s.id === this.activeSection);
    return Math.round(((currentIndex + 1) / this.sections.length) * 100);
  }

  fillSampleData() {
    this.resume = {
      personalInfo: {
        fullName: 'Abdul Hameed S M',
        jobTitle: 'Full Stack Developer',
        email: 'ah303130@gmail.com',
        phone: '+91 9994377199',
        location: 'Chennai, Tamil Nadu',
        linkedin: 'linkedin.com/in/abdulhameed06',
        github: 'github.com/abduldev-cloud',
        portfolio: 'abdulhameedm.vercel.app',
        summary: 'Impact-driven Full Stack Developer with 2+ years of hands-on experience in building scalable web applications. Proficient in React, Node.js, and Cloud architectures with a passion for clean code and efficient problem solving.'
      },
      experience: [
        { 
          company: 'Astra AI Solutions', 
          role: 'Senior Developer', 
          location: 'Remote', 
          startDate: '2023-01', 
          endDate: '', 
          current: true, 
          description: 'Leading the development of an automated career optimization platform using Gemini AI.',
          achievements: ['Increased system performance by 40%', 'Architected scalable backend microservices'] 
        }
      ],
      education: [
        { 
          institution: 'Anna University', 
          degree: 'B.E.', 
          field: 'Computer Science', 
          startDate: '2019-06', 
          endDate: '2023-05', 
          gpa: '8.8 / 10', 
          achievements: ['University Gold Medalist', 'Hackathon Winner 2022'] 
        }
      ],
      skills: {
        technical: ['JavaScript', 'TypeScript', 'PHP', 'Python', 'MySQL'],
        frameworks: ['React', 'Angular', 'Node.js', 'Express', 'Tailwind CSS'],
        tools: ['Git', 'Docker', 'AWS', 'VS Code', 'Jira'],
        soft: ['Leadership', 'Problem Solving', 'Agile Methodology']
      },
      projects: [
        { 
          name: 'Portfolio-Generator', 
          description: 'A comprehensive tool to create resumes and portfolios dynamically.', 
          techStack: 'Angular, Node.js, Express, MySQL',
          liveUrl: 'https://portfolio-gen.app',
          repoUrl: 'https://github.com/abduldev-cloud/portfolio-gen',
          startDate: '2024-01',
          endDate: '2024-03'
        }
      ],
      certifications: [
        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023-10', credentialUrl: 'https://aws.amazon.com/verify' }
      ],
      languages: [
        { language: 'English', proficiency: 'Professional' },
        { language: 'Tamil', proficiency: 'Native' }
      ],
      awards: [
        { title: 'Best Innovation Award', issuer: 'TechX Expo 2023', date: '2023-11', description: 'Awarded for developing an AI-driven accessibility tool.' }
      ]
    };

    // Update strings for skill inputs
    this.technicalSkillString = this.resume.skills.technical.join(', ');
    this.frameworkSkillString = this.resume.skills.frameworks.join(', ');
    this.toolSkillString = this.resume.skills.tools.join(', ');
    this.softSkillString = this.resume.skills.soft.join(', ');
  }

  // Save & Export
  save() {
    this.updateSkills();
    this.apiService.saveResume(this.userId, this.resume).subscribe({
      next: () => alert('Resume saved successfully!'),
      error: (err) => alert('Error saving: ' + (err.error?.error || err.message))
    });
  }

  downloadPdf() {
    this.updateSkills();
    // Target the actual sheet element directly
    const data = document.querySelector('.resume-a4') as HTMLElement;
    if (!data) return;

    this.isExporting = true;

    // High resolution capture
    html2canvas(data, {
      scale: 3, // High DPI capture for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      // CRITICAL: Reset the CSS transform in the cloned document so html2canvas 
      // captures the sheet at its natural 210mm x 297mm size.
      onclone: (clonedDoc) => {
        const resumeElement = clonedDoc.querySelector('.resume-a4') as HTMLElement;
        if (resumeElement) {
          resumeElement.style.transform = 'none';
        }
      }
    }).then(canvas => {
      const imgWidth = 210; // A4 mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);

      // Sanitize filename
      const safeName = (this.resume.personalInfo.fullName || 'Astra').replace(/[^a-z0-9]/gi, '_');
      pdf.save(`${safeName}-Resume.pdf`);
      
      this.isExporting = false;
    }).catch(err => {
      console.error('PDF Export Error:', err);
      alert('Error generating PDF. Please ensure all images are accessible.');
      this.isExporting = false;
    });
  }

  downloadWord() {
    alert('Word export (DOCX) is coming soon in the next Astra Pro update!');
  }
  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
