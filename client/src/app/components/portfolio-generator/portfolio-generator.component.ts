import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-portfolio-generator',
  templateUrl: './portfolio-generator.component.html',
  styleUrls: ['./portfolio-generator.component.css']
})
export class PortfolioGeneratorComponent implements OnInit {
  currentStep = 'templates'; // 'templates' | 'editor'
  selectedTemplate = 'modern';
  activeSection = 'personal';
  isGenerating = false;

  templates = [
    { id: 'modern', name: 'Modern Dark', desc: 'Sleek, dark theme with accent colors.', icon: '🌑', color: '#6366f1' },
    { id: 'minimal', name: 'Minimal White', desc: 'Clean, professional light theme.', icon: '📄', color: '#10b981' },
    { id: 'creative', name: 'Bold Creative', desc: 'Vibrant gradients and interactive elements.', icon: '🎨', color: '#f43f5e' },
    { id: 'dev', name: 'Developer Hub', desc: 'Terminal-inspired layout with dark mode.', icon: '💻', color: '#3b82f6' }
  ];

  portfolioData: any = {
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

  constructor(
    private apiService: ApiService,
    private activityService: ActivityService
  ) { }

  ngOnInit() { }

  selectTemplate(templateId: string) {
    this.selectedTemplate = templateId;
    this.currentStep = 'editor';
    this.activeSection = 'personal';
  }

  updateSkills() {
    this.portfolioData.skills.technical = this.technicalSkillString.split(',').map(s => s.trim()).filter(s => s);
    this.portfolioData.skills.frameworks = this.frameworkSkillString.split(',').map(s => s.trim()).filter(s => s);
    this.portfolioData.skills.tools = this.toolSkillString.split(',').map(s => s.trim()).filter(s => s);
    this.portfolioData.skills.soft = this.softSkillString.split(',').map(s => s.trim()).filter(s => s);
  }

  addExperience() { this.portfolioData.experience.push({ company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [''] }); }
  removeExperience(i: number) { this.portfolioData.experience.splice(i, 1); }
  addAchievement(exp: any) { exp.achievements.push(''); }
  removeAchievement(exp: any, j: number) { exp.achievements.splice(j, 1); }

  addEducation() { this.portfolioData.education.push({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', achievements: [''] }); }
  removeEducation(i: number) { this.portfolioData.education.splice(i, 1); }
  addEduAchievement(edu: any) { edu.achievements.push(''); }
  removeEduAchievement(edu: any, j: number) { edu.achievements.splice(j, 1); }

  addProject() { this.portfolioData.projects.push({ name: '', description: '', techStack: '', liveUrl: '', repoUrl: '', startDate: '', endDate: '' }); }
  removeProject(i: number) { this.portfolioData.projects.splice(i, 1); }

  addCertification() { this.portfolioData.certifications.push({ name: '', issuer: '', date: '', credentialUrl: '' }); }
  removeCertification(i: number) { this.portfolioData.certifications.splice(i, 1); }

  addLanguage() { this.portfolioData.languages.push({ language: '', proficiency: 'Professional' }); }
  removeLanguage(i: number) { this.portfolioData.languages.splice(i, 1); }

  addAward() { this.portfolioData.awards.push({ title: '', issuer: '', date: '', description: '' }); }
  removeAward(i: number) { this.portfolioData.awards.splice(i, 1); }

  fillSampleData() {
    this.portfolioData = {
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
    this.technicalSkillString = this.portfolioData.skills.technical.join(', ');
    this.frameworkSkillString = this.portfolioData.skills.frameworks.join(', ');
    this.toolSkillString = this.portfolioData.skills.tools.join(', ');
    this.softSkillString = this.portfolioData.skills.soft.join(', ');
  }

  generate() {
    this.updateSkills();
    this.isGenerating = true;
    this.apiService.generatePortfolio(this.portfolioData, this.selectedTemplate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.portfolioData.personalInfo.fullName.replace(/\s+/g, '_')}_Portfolio.zip`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isGenerating = false;
        
        this.activityService.logActivity(
          'portfolio', 
          `Portfolio: ${this.portfolioData.personalInfo.fullName || 'Untitled'}`,
          `Generated with ${this.selectedTemplate} template`,
          this.selectedTemplate
        );
      },
      error: (err) => {
        console.error('Generation failed', err);
        this.isGenerating = false;
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  getCompletedPercentage(): number {
    const currentIndex = this.sections.findIndex(s => s.id === this.activeSection);
    return Math.round(((currentIndex + 1) / this.sections.length) * 100);
  }
}
