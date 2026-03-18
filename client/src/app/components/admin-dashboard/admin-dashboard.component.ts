import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Auth
  isAuthenticated = false;
  username = '';
  password = '';
  loginError = '';
  loginLoading = false;

  // Dashboard
  stats: any = null;
  users: any[] = [];
  activity: any[] = [];
  currentUser: any = null;
  loading = true;
  activeView = 'overview';

  features = [
    { id: 'portfolio', name: 'Portfolio Generator', icon: '📁', status: 'active', desc: 'ZIP-based portfolio generator with templates' },
    { id: 'resume', name: 'Resume Studio', icon: '📝', status: 'active', desc: '6 templates, 8 sections, GitHub sync' },
    { id: 'ats', name: 'ATS Intelligence Engine', icon: '⚡', status: 'active', desc: 'Gemini-powered 6-stage resume analysis' },
    { id: 'interview', name: 'Interview Simulator', icon: '🎤', status: 'active', desc: 'AI-generated questions with STAR coaching' },
    { id: 'github', name: 'GitHub Sync', icon: '🔗', status: 'active', desc: 'Auto-fill resume from GitHub profile' }
  ];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Check if already logged in as admin
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      this.isAuthenticated = true;
      this.currentUser = this.authService.getCurrentUser();
      this.loadDashboard();
    }
  }

  adminLogin() {
    this.loginError = '';
    this.loginLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.user.role === 'admin') {
          this.isAuthenticated = true;
          this.currentUser = res.user;
          this.loginLoading = false;
          this.loadDashboard();
        } else {
          this.loginError = 'Access denied. Admin credentials required.';
          this.authService.logout();
          this.loginLoading = false;
        }
      },
      error: (err) => {
        this.loginError = err.error?.error || 'Invalid credentials.';
        this.loginLoading = false;
      }
    });
  }

  loadDashboard() {
    this.loading = true;
    this.authService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.activity = data.recentActivity || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.authService.getAllUsers().subscribe({
      next: (data) => { this.users = data; }
    });
  }

  toggleFeature(feature: any) {
    const newStatus = feature.status === 'active' ? 'disabled' : 'active';
    this.authService.toggleFeature(feature.id, newStatus).subscribe({
      next: () => { feature.status = newStatus; }
    });
  }

  getUptime(): string {
    if (!this.stats?.serverUptime) return '0s';
    const s = Math.floor(this.stats.serverUptime);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  getMemory(): string {
    if (!this.stats?.memoryUsage?.heapUsed) return '0 MB';
    return (this.stats.memoryUsage.heapUsed / 1024 / 1024).toFixed(1) + ' MB';
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.username = '';
    this.password = '';
  }

  formatTime(isoString: string): string {
    const d = new Date(isoString);
    return d.toLocaleString();
  }
}
