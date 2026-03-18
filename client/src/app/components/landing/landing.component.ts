import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  features = [
    {
      icon: '📁',
      title: 'Portfolio Generator',
      desc: 'Build a stunning portfolio website in seconds. Choose a template, fill your details, and download a ready-to-deploy ZIP file.',
      route: '/portfolio',
      color: '#3b82f6',
      tag: 'Build'
    },
    {
      icon: '📝',
      title: 'Resume Studio',
      desc: '6 premium templates, 8 sections, and GitHub auto-fill. Create ATS-optimized resumes that get interviews.',
      route: '/resume',
      color: '#8b5cf6',
      tag: 'Create'
    },
    {
      icon: '⚡',
      title: 'ATS Intelligence Engine',
      desc: 'AI-powered 6-stage resume analysis. Get your ATS score, skill gap report, and an optimized rewrite instantly.',
      route: '/ats',
      color: '#06b6d4',
      tag: 'Analyze'
    },
    {
      icon: '🎤',
      title: 'Interview Simulator',
      desc: 'AI generates predicted interview questions with STAR method coaching, difficulty ratings, and salary negotiation tips.',
      route: '/interview',
      color: '#10b981',
      tag: 'Prepare'
    }
  ];

  stats = [
    { value: '6', label: 'Resume Templates' },
    { value: '8', label: 'Resume Sections' },
    { value: '5', label: 'AI Tools' },
    { value: '∞', label: 'Possibilities' }
  ];
}
