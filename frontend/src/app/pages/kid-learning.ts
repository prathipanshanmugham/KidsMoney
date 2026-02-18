import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KidLayoutComponent } from '../layouts/kid-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { STORIES, KID_THEMES } from '../constants/app-data';

@Component({
  selector: 'app-kid-learning',
  standalone: true,
  imports: [CommonModule, KidLayoutComponent],
  template: `
    <app-kid-layout>
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="kid-learning-heading">Stories</h1>
        <p class="text-sm mb-6" style="color: var(--fg-muted)">Learn about money through fun stories!</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (story of stories; track story.id) {
            <div class="card p-6 cursor-pointer transition-all hover:scale-[1.02]" (click)="openStory(story)" [attr.data-testid]="'kid-story-' + story.id">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold font-heading text-sm">{{ story.title }}</h3>
                @if (isCompleted(story.id)) {
                  <span class="badge text-[10px]" style="background-color: #34D39920; color: #34D399">Done</span>
                } @else {
                  <span class="badge text-[10px]" [style.background-color]="theme().primary + '15'" [style.color]="theme().primary">+{{ story.reward_xp }} XP</span>
                }
              </div>
              <p class="text-xs" style="color: var(--fg-muted)">{{ story.description }}</p>
            </div>
          }
        </div>

        @if (selectedStory(); as story) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="selectedStory.set(null)">
            <div class="absolute inset-0 bg-black/50"></div>
            <div class="card p-8 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto animate-fade-in" (click)="$event.stopPropagation()">
              <h2 class="text-lg font-bold font-heading mb-4">{{ story.title }}</h2>
              <p class="text-sm leading-relaxed mb-6" style="color: var(--fg-muted)">{{ story.content }}</p>

              @if (!quizMode()) {
                <button (click)="quizMode.set(true)" class="btn-primary w-full py-3" [style.background-color]="theme().primary">Take Quiz!</button>
              } @else {
                <div class="space-y-4">
                  @for (q of story.questions; track $index; let i = $index) {
                    <div class="p-4 rounded-xl" style="background-color: var(--muted)">
                      <p class="text-sm font-medium mb-2">{{ i + 1 }}. {{ q.question }}</p>
                      <div class="grid grid-cols-2 gap-2">
                        @for (opt of q.options; track $index; let j = $index) {
                          <button (click)="answers[i] = j"
                                  class="text-xs p-2 rounded-xl border transition-all"
                                  [style.background-color]="answers[i] === j ? theme().primary : ''"
                                  [style.color]="answers[i] === j ? 'white' : ''"
                                  [style.border-color]="answers[i] === j ? theme().primary : 'var(--border)'">{{ opt }}</button>
                        }
                      </div>
                    </div>
                  }
                  <button (click)="submitQuiz(story)" class="btn-primary w-full py-3" [style.background-color]="theme().primary" [disabled]="submitting()">Submit</button>
                  @if (quizResult() !== null) {
                    <div class="p-4 rounded-xl text-center" style="background-color: var(--muted)">
                      <p class="text-sm font-bold">Score: {{ quizResult() }}/{{ story.questions.length }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </app-kid-layout>
  `
})
export class KidLearningPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  stories = STORIES;
  completedIds = signal<string[]>([]);
  selectedStory = signal<any>(null);
  quizMode = signal(false);
  submitting = signal(false);
  quizResult = signal<number | null>(null);
  answers: Record<number, number> = {};
  theme = computed(() => KID_THEMES[this.auth.kidSession()?.kid?.ui_theme || 'neutral'] || KID_THEMES['neutral']);

  async ngOnInit() {
    const kid = this.auth.kidSession()?.kid;
    if (kid) {
      const progress = await this.fs.getLearningProgress(kid.id);
      this.completedIds.set(progress.map(p => p.story_id));
    }
  }

  isCompleted(id: string) { return this.completedIds().includes(id); }

  openStory(story: any) {
    this.selectedStory.set(story);
    this.quizMode.set(false);
    this.quizResult.set(null);
    this.answers = {};
  }

  async submitQuiz(story: any) {
    const kid = this.auth.kidSession()?.kid;
    if (!kid) return;
    this.submitting.set(true);
    try {
      let score = 0;
      story.questions.forEach((q: any, i: number) => { if (this.answers[i] === q.correct) score++; });
      await this.fs.completeLesson(kid.id, story.id, score, story.reward_xp);
      this.quizResult.set(score);
      this.completedIds.update(ids => [...ids, story.id]);
    } finally { this.submitting.set(false); }
  }
}
