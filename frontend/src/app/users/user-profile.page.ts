import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { map } from 'rxjs';
import { selectAuthUser } from '../auth/state/auth.selectors';
import { UserProfileService } from './user-profile.service';

@Component({
  standalone: true,
  selector: 'app-user-profile-page',
  template: `
    @if (userLoaded) {
    <section class="profile-page">
      <header class="profile-page__header">
        <div>
          <h1>{{ form.value.firstName }} {{ form.value.lastName }}</h1>
          <p class="muted">
            Role: {{ form.value.role }} · {{ form.value.email }}
          </p>
        </div>
        @if (isAdmin$ | async) {
        <p-button
          label="Save changes"
          icon="pi pi-save"
          (click)="onSave()"
          [disabled]="form.invalid || saving"
        ></p-button>
        }
      </header>

      @if (isAdmin$ | async) {
      <div class="profile-grid">
        <p-card header="Basic Info">
          <div class="field">
            <label>First name</label>
            <input
              pInputText
              type="text"
              [formControl]="form.controls.firstName"
            />
          </div>
          <div class="field">
            <label>Last name</label>
            <input
              pInputText
              type="text"
              [formControl]="form.controls.lastName"
            />
          </div>
          <div class="field">
            <label>Email</label>
            <input
              pInputText
              type="email"
              [formControl]="form.controls.email"
            />
          </div>
          <div class="field">
            <label>Role</label>
            <p-select
              [options]="roles"
              optionLabel="label"
              optionValue="value"
              [formControl]="form.controls.role"
            ></p-select>
          </div>
          <div class="field">
            <label>Active</label>
            <p-toggleButton
              onLabel="Active"
              offLabel="Inactive"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              [formControl]="form.controls.isActive"
            ></p-toggleButton>
          </div>
        </p-card>

        <p-card header="Job">
          <div class="field">
            <label>Job title</label>
            <input
              pInputText
              type="text"
              [formControl]="form.controls.jobTitle"
            />
          </div>
          <div class="field">
            <label>Bio</label>
            <textarea
              pInputTextarea
              rows="4"
              [formControl]="form.controls.bio"
            ></textarea>
          </div>
        </p-card>
      </div>
      } @else {
      <p-card header="Profile">
        <p>
          <strong>Name:</strong> {{ form.value.firstName }}
          {{ form.value.lastName }}
        </p>
        <p><strong>Email:</strong> {{ form.value.email }}</p>
        <p><strong>Role:</strong> {{ form.value.role }}</p>
        <p><strong>Job title:</strong> {{ form.value.jobTitle || '—' }}</p>
        <p>
          <strong>Status:</strong>
          {{ form.value.isActive ? 'Active' : 'Inactive' }}
        </p>
        <p><strong>Bio:</strong> {{ form.value.bio || '—' }}</p>
      </p-card>
      } @if (error) {
      <p class="error">{{ error }}</p>
      }
    </section>
    }
  `,
  styles: [
    `
      .profile-page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .profile-page__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .muted {
        color: #6b7280;
        margin: 0;
      }
      .profile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-bottom: 0.75rem;
      }
      label {
        font-weight: 600;
        color: #374151;
      }
      .muted {
        color: #6b7280;
      }
      .error {
        color: #dc2626;
      }
    `,
  ],
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToggleButtonModule,
    SelectModule,
  ],
})
export class UserProfilePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userProfileService = inject(UserProfileService);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  userId = this.route.snapshot.paramMap.get('id')!;
  isAdmin$ = this.store
    .select(selectAuthUser)
    .pipe(map((u) => u?.role === 'admin'));

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ];

  saving = false;
  error: string | null = null;
  userLoaded = false;

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: this.fb.control<'admin' | 'user'>('user', { nonNullable: true }),
    jobTitle: [''],
    bio: [''],
    isActive: this.fb.nonNullable.control(true),
  });

  ngOnInit(): void {
    this.userProfileService.getUser(this.userId).subscribe({
      next: (user) => {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role as 'admin' | 'user',
          jobTitle: user.jobTitle ?? '',
          bio: user.bio ?? '',
          isActive: user.isActive,
        });
        this.userLoaded = true;
      },
      error: (err) => {
        this.error =
          err?.error?.message ?? err?.message ?? 'Unable to load user profile.';
      },
    });
  }

  onSave() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.error = null;

    const payload = {
      ...this.form.value,
      jobTitle: this.form.value.jobTitle || null,
      bio: this.form.value.bio || null,
    };

    this.userProfileService.updateUser(this.userId, payload).subscribe({
      next: (updated) => {
        this.form.patchValue({
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          role: updated.role as 'admin' | 'user',
          jobTitle: updated.jobTitle ?? '',
          bio: updated.bio ?? '',
          isActive: updated.isActive,
        });
        this.saving = false;
      },
      error: (err) => {
        this.error =
          err?.error?.message ??
          err?.message ??
          'Unable to save changes. Check your permissions.';
        this.saving = false;
      },
    });
  }
}
