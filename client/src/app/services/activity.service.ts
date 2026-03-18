import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Activity {
  id: string;
  type: 'resume' | 'portfolio' | 'ats';
  title: string;
  timestamp: Date;
  details?: string;
  template?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  activities$ = this.activitiesSubject.asObservable();

  constructor() {
    this.loadActivities();
  }

  private loadActivities() {
    const saved = localStorage.getItem('astra_recent_activity');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert ISO strings back to Date objects
        const formatted = parsed.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
        this.activitiesSubject.next(formatted);
      } catch (e) {
        console.error('Failed to parse activities', e);
      }
    }
  }

  logActivity(type: 'resume' | 'portfolio' | 'ats', title: string, details?: string, template?: string) {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      timestamp: new Date(),
      details,
      template
    };

    const current = this.activitiesSubject.value;
    const updated = [newActivity, ...current].slice(0, 50); // Keep last 50
    
    this.activitiesSubject.next(updated);
    localStorage.setItem('astra_recent_activity', JSON.stringify(updated));
  }

  getActivities() {
    return this.activitiesSubject.value;
  }

  clearActivities() {
    this.activitiesSubject.next([]);
    localStorage.removeItem('astra_recent_activity');
  }
}
