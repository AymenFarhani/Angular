import {afterNextRender, Component, DestroyRef, inject, OnInit, viewChild} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {debounceTime, of} from "rxjs";


function mustContainQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }
  return {doesNotContainQuestionMark: true};
}

function emailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@example.com') {
    return of(null);
  }
  return of({notUnique: true});
}


let initialEmailValue = '';
const savedForm = localStorage.getItem('saved-login-form');
if (savedForm) {
  const loadedForm = JSON.parse(savedForm);
  initialEmailValue = loadedForm.email
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [
    ReactiveFormsModule
  ]
})
export class LoginComponent implements OnInit {
  // Template Driven Form
  /*private form = viewChild.required<NgForm>('form');
  private destroyRef = inject(DestroyRef);


  constructor() {
    afterNextRender(() => {
      const savedForm = localStorage.getItem('saved-login-form');
      if(savedForm) {
        const loadedFormDate = JSON.parse(savedForm);
        const savedEmail = loadedFormDate.email;
        setTimeout(() => {
          this.form().controls['email'].setValue(savedEmail);
        }, 1)
      }
      const subscription = this.form().valueChanges?.pipe(debounceTime(500))
        .subscribe({
          next: (value) => localStorage.setItem('saved-login-form', JSON.stringify({email: value.email}))
        });
      this.destroyRef.onDestroy(() => subscription?.unsubscribe())
    });
  }

  onSubmit(formData: NgForm) {
    if (formData.form.invalid) {
      return;
    }
    const enteredEmail = formData.form.value.email;
    const enteredPassword = formData.form.value.password;
    console.log(formData.form)
    console.log('Email is ', enteredEmail)
    console.log('Password is ', enteredPassword)

    formData.form.reset()
  }*/

  // Reactive Form
  private destroyRef = inject(DestroyRef);
  form = new FormGroup({
    email: new FormControl(initialEmailValue, {
      validators: [Validators.required],
      asyncValidators: [emailIsUnique]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6), mustContainQuestionMark],

    })
  });

  get emailIsInvalid() {
    return (this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid)
  }

  get passwordIsInvalid() {
    return (this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid)
  }

  onSubmit() {
    console.log(this.form);
    const enteredEmail = this.form.value.email;
    const enteredPassword = this.form.value.password;
    console.log(enteredEmail, enteredPassword)
  }

  ngOnInit(): void {
    const savedForm = localStorage.getItem('saved-login-form');
    if (savedForm) {
      const loadedForm = JSON.parse(savedForm);
      this.form.patchValue({
        email: loadedForm.email
      });
    }
    const subscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe({
      next: value => {
        localStorage.setItem('saved-login-form', JSON.stringify({email: value.email}))
      }
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe)
  }
}
