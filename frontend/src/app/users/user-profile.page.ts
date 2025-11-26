import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-user-profile-page',
  template: `
    <section>
      <h1>User Profile</h1>
      <p class="muted">User ID: {{ userId }}</p>
      <p class="muted">Edit UI for admins will go here.</p>
    </section>
  `,
  styles: [
    `
      .muted {
        color: #6b7280;
      }
    `,
  ],
  imports: [AsyncPipe],
})
export class UserProfilePage {
  private readonly route = inject(ActivatedRoute);
  userId = this.route.snapshot.paramMap.get('id');
}
