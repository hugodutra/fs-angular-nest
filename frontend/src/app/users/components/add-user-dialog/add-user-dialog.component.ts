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
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss'],
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
