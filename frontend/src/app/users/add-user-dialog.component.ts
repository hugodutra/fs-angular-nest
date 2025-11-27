import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

export type AddUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  password: string;
  jobTitle?: string | null;
  bio?: string | null;
  isActive?: boolean;
};

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    DialogModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      header="Add User"
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '520px' }"
      appendTo="body"
      data-testid="add-user-dialog"
      (onHide)="handleCancel()"
    >
      <form class="form" [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="grid">
          <div class="field">
            <label for="firstName">First name</label>
            <input
              pInputText
              id="firstName"
              formControlName="firstName"
              autocomplete="off"
              data-testid="add-user-firstName"
            />
          </div>
          <div class="field">
            <label for="lastName">Last name</label>
            <input
              pInputText
              id="lastName"
              formControlName="lastName"
              autocomplete="off"
              data-testid="add-user-lastName"
            />
          </div>
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input
            pInputText
            id="email"
            formControlName="email"
            autocomplete="off"
            data-testid="add-user-email"
          />
        </div>

        <div class="grid">
          <div class="field">
            <label for="role">Role</label>
            <select
              id="role"
              class="p-inputtext"
              formControlName="role"
              data-testid="add-user-role"
            >
              @for (opt of roleOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label for="password">Password</label>
            <p-password
              inputId="password"
              formControlName="password"
              [feedback]="false"
              toggleMask="true"
              data-testid="add-user-password"
            ></p-password>
          </div>
        </div>

        <div class="field">
          <label for="jobTitle">Job title</label>
          <input
            pInputText
            id="jobTitle"
            formControlName="jobTitle"
            autocomplete="off"
            data-testid="add-user-jobTitle"
          />
        </div>

        <div class="field">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            formControlName="bio"
            rows="3"
            data-testid="add-user-bio"
          ></textarea>
        </div>

        <div class="field checkbox">
          <p-checkbox
            inputId="isActive"
            formControlName="isActive"
            binary="true"
            data-testid="add-user-isActive"
          ></p-checkbox>
          <label for="isActive">Active</label>
        </div>

        @if (error) {
        <p class="error" data-testid="add-user-error">{{ error }}</p>
        }

        <div class="actions">
          <button
            pButton
            type="button"
            label="Cancel"
            class="p-button-secondary"
            (click)="handleCancel()"
          ></button>
          <button
            pButton
            type="submit"
            label="Create"
            icon="pi pi-check"
            [disabled]="loading"
            [loading]="loading"
            data-testid="add-user-submit"
          ></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .checkbox {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .error {
        color: #dc2626;
      }
    `,
  ],
})
export class AddUserDialogComponent {
  @Input() set visible(value: boolean) {
    this._visible = value;
    if (value) {
      this.reset();
    }
  }
  get visible() {
    return this._visible;
  }
  private _visible = false;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submitUser = new EventEmitter<AddUserPayload>();

  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as 'admin' | 'user', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    jobTitle: [''],
    bio: [''],
    isActive: [true],
  });

  roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
  ];

  handleSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      email,
      firstName,
      lastName,
      role,
      password,
      jobTitle,
      bio,
      isActive,
    } = this.form.getRawValue();

    this.submitUser.emit({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      password,
      jobTitle: jobTitle?.trim() || null,
      bio: bio?.trim() || null,
      isActive,
    });
  }

  handleCancel() {
    this.visibleChange.emit(false);
  }

  reset() {
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      password: '',
      jobTitle: '',
      bio: '',
      isActive: true,
    });
  }
}
