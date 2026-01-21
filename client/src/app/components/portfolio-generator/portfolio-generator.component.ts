import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-portfolio-generator',
  templateUrl: './portfolio-generator.component.html',
  styleUrls: ['./portfolio-generator.component.css']
})
export class PortfolioGeneratorComponent {
  userData = {
    name: '',
    title: '',
    bio: ''
  };
  selectedTemplate = 'default';

  constructor(private apiService: ApiService) { }

  generate() {
    this.apiService.generatePortfolio(this.userData, this.selectedTemplate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'portfolio.zip';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Generation failed', err)
    });
  }
}
