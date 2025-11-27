import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { UserListItem } from './state/users.models';

export type EditUserPayload = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  jobTitle?: string | null;
  bio?: string | null;
  isActive?: boolean;
};

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    DialogModule,
    InputTextModule,
    SelectModule,
    ToggleButtonModule,
    TextareaModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      header="Edit User"
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '540px' }"
      appendTo="body"
      data-testid="edit-user-dialog"
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
              data-testid="edit-user-firstName"
            />
          </div>
          <div class="field">
            <label for="lastName">Last name</label>
            <input
              pInputText
              id="lastName"
              formControlName="lastName"
              autocomplete="off"
              data-testid="edit-user-lastName"
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
            data-testid="edit-user-email"
          />
        </div>

        <div class="grid">
          <div class="field">
            <label for="role">Role</label>
            <p-select
              inputId="role"
              [options]="roleOptions"
              optionLabel="label"
              optionValue="value"
              formControlName="role"
              data-testid="edit-user-role"
            ></p-select>
          </div>
          <div class="field">
            <label for="isActive">Active</label>
            <p-toggleButton
              inputId="isActive"
              onLabel="Active"
              offLabel="Inactive"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              formControlName="isActive"
              data-testid="edit-user-isActive"
            ></p-toggleButton>
          </div>
        </div>

        <div class="field">
          <label for="jobTitle">Job title</label>
          <input
            pInputText
            id="jobTitle"
            formControlName="jobTitle"
            autocomplete="off"
            data-testid="edit-user-jobTitle"
          />
        </div>

        <div class="field">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            formControlName="bio"
            rows="3"
            data-testid="edit-user-bio"
          ></textarea>
        </div>

        @if (error) {
        <p class="error" data-testid="edit-user-error">{{ error }}</p>
        }

        <div class="actions">
          <button
            pButton
            type="button"
            label="Cancel"
            class="p-button-secondary"
            (click)="handleCancel()"
            data-testid="edit-user-cancel"
          ></button>
          <button
            pButton
            type="submit"
            label="Save"
            icon="pi pi-check"
            [disabled]="loading || form.invalid || !user"
            [loading]="loading"
            data-testid="edit-user-submit"
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
export class EditUserDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() user: UserListItem | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submitUser = new EventEmitter<EditUserPayload>();

  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: this.fb.control<'admin' | 'user'>('user', { nonNullable: true }),
    jobTitle: [''],
    bio: [''],
    isActive: this.fb.nonNullable.control(true),
  });

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    const userChanged = changes['user'];
    const visibilityChanged = changes['visible'];

    if ((userChanged || visibilityChanged) && this.user && this.visible) {
      this.patchForm(this.user);
    }
  }

  handleSubmit() {
    if (this.form.invalid || !this.user) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      firstName,
      lastName,
      email,
      role,
      jobTitle,
      bio,
      isActive,
    } = this.form.getRawValue();

    this.submitUser.emit({
      id: this.user.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role,
      jobTitle: jobTitle?.trim() || null,
      bio: bio?.trim() || null,
      isActive,
    });
  }

  handleCancel() {
    this.visibleChange.emit(false);
  }

  private patchForm(user: UserListItem) {
    this.form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle ?? '',
      bio: user.bio ?? '',
      isActive: user.isActive,
    });
  }
}
