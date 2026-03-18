import { Component, OnInit } from '@angular/core';
import { ActivityService, Activity } from '../../services/activity.service';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.css']
})
export class RecentActivityComponent implements OnInit {
  activities: Activity[] = [];

  constructor(private activityService: ActivityService) { }

  ngOnInit(): void {
    this.activityService.activities$.subscribe(data => {
      this.activities = data;
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'resume': return '📄';
      case 'portfolio': return '🌑';
      case 'ats': return '🎯';
      default: return '📍';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString();
  }

  clearAll() {
    if (confirm('Clear all recent activity?')) {
      this.activityService.clearActivities();
    }
  }
}
