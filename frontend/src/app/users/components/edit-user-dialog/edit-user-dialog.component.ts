import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { UserListItem } from '../../state/users.models';

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
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss'],
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
