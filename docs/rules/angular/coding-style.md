<!-- pattern from affaan-m/ecc rules/angular/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: angular
concern: coding-style
---
# Angular Coding Style

Reference standard for writing Angular code in projects MultiAgentOS operates on. Modern (v17+) signal-first defaults.

## Version Awareness
- Check the project's Angular version first (`ng version` / `package.json`); APIs differ sharply across majors.
- After generating or modifying code, run `ng build` to catch template/type errors before finishing.
- Do not pin a version on a new project unless the user specifies one.

## File Naming
One artifact per file, Angular CLI conventions:
- `user-profile.component.ts` + `.html` + `.spec.ts`; `user.service.ts`, `auth.guard.ts`, `date-format.pipe.ts`.
- Feature folders: `features/users/`, `features/auth/`. Generate via CLI: `ng generate component features/users/user-card`.

## Components
Prefer standalone components (v17+ default). Use `OnPush` change detection on all new components.

```typescript
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  user = input.required<User>();
  select = output<string>();
}
```

## Dependency Injection
Use `inject()` over constructor injection — terser and more tree-shakeable. Keep constructors empty or remove them. Use `InjectionToken` for non-class dependencies.

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
}

const API_URL = new InjectionToken<string>('API_URL');
// provide: { provide: API_URL, useValue: 'https://api.example.com' }
// consume: private apiUrl = inject(API_URL);
```

## Signals
- `signal` / `computed` for state and derived state. Never store a derived value in a separate signal — use `computed`.
- `linkedSignal` for writable derived state that resets when its source changes.
- `resource()` for reactive async fetching (no manual subscriptions): exposes `.value()`, `.isLoading()`, `.error()`.
- `effect()` only for true side effects (logging, third-party DOM). Never use an effect to sync signals. For post-render DOM work use `afterRenderEffect`.

```typescript
count = signal(0);
doubled = computed(() => this.count() * 2);
increment() { this.count.update(n => n + 1); }
```

## Templates
Use v17+ block syntax. Always supply `track` in `@for`. No logic beyond simple conditionals — move it to methods or pipes.

```html
@for (item of items(); track item.id) { <app-item [item]="item" /> }
@if (isLoading()) { <app-spinner /> } @else if (error()) { <app-error [message]="error()" /> } @else { <app-content [data]="data()" /> }
```

## Forms
Match the project's existing strategy: Signal Forms (v21+, preferred for new v21+ apps) · Reactive Forms (`FormBuilder`/`FormGroup`, best for complex/dynamic validation) · Template-Driven (`ngModel`, simple forms only).

```typescript
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
});
```

## Component Styles
Default `ViewEncapsulation.Emulated`. Avoid `None` unless intentionally building a bleeding design system. Scope styles to the component; use `:host` for host styling; prefer CSS custom properties for themeable values.

## Change Detection
- Default `OnPush` on all new components.
- Signals and the `async` pipe handle detection — avoid `markForCheck()` / `detectChanges()`.
- Never mutate `@Input()` objects in place under OnPush.
