<!-- pattern from affaan-m/ecc rules/angular/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: angular
concern: patterns
---
# Angular Patterns

Architectural patterns for Angular apps. Signal-first, service-owned data access.

## Smart / Dumb Component Split
Smart (container) components own data fetching and state. Dumb (presentational) components take inputs and emit outputs only — no service injection.

```typescript
@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })
export class UserPageComponent {
  private userService = inject(UserService);
  user = toSignal(this.userService.getUser(this.userId));
}
```
```html
<app-user-card [user]="user()" (select)="onSelect($event)" />
```

## Service Layer
Services own all data access and business logic. No `HttpClient` in components — components delegate.

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  getUsers(): Observable<User[]> { return this.http.get<User[]>('/api/users'); }
}
```

## Async Data
Prefer `resource()` over manual RxJS for simple reactive loading. Access `.value()`, `.isLoading()`, `.error()`, `.reload()`.

```typescript
userResource = resource({
  request: () => ({ id: this.userId() }),
  loader: ({ request }) => firstValueFrom(inject(UserService).getUser(request.id)),
});
```

## Signal State
```typescript
count = signal(0);                                   // local mutable
doubled = computed(() => this.count() * 2);          // derived — never duplicated
selectedItem = linkedSignal(() => this.items()[0]);  // writable derived, resets with source
users = toSignal(this.userService.getUsers(), { initialValue: [] }); // bridge Observable→signal
```
Never store derived values in separate signals (use `computed`); never sync signals via `effect` (use `computed`/`linkedSignal`).

## Subscription Cleanup
Use `takeUntilDestroyed(this.destroyRef)` for all manual subscriptions. Do not write manual `ngOnDestroy` + `Subject` + `takeUntil` on new code.

## Routing
- `canMatch` over `canActivate` when an unauthorized user should never load the chunk.
- Lazy-load all feature modules with `loadChildren`.
- Pre-fetch with `resolve` to avoid in-component loading states.
- Functional guards/resolvers via `inject()`.
- Enable smooth transitions with `provideRouter(routes, withViewTransitions())`.

```typescript
{ path: 'admin', canMatch: [authGuard], loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) }

export const authGuard: CanActivateFn = () =>
  inject(AuthService).isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
```

## Dependency Injection Patterns
- Scoped providers (`providers: [Service]` on a component) when a service should not be a singleton.
- `InjectionToken` (`useValue` / `useFactory`) for config and non-class deps.
- `viewProviders` exposes only to the component's own view; `providers` also reaches projected content children.

## HTTP Interceptors
Functional interceptors (v15+) for auth, error handling, retries. Register via `provideHttpClient(withInterceptors([...]))`.

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return token ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })) : next(req);
};
```

## RxJS Operators
`switchMap` (search/navigation, cancels previous) · `mergeMap` (independent parallel) · `exhaustMap` (form submits, ignores until complete). Always `catchError` — never let a stream die silently.

```typescript
search$ = this.query$.pipe(
  debounceTime(300), distinctUntilChanged(),
  switchMap(q => this.service.search(q).pipe(catchError(() => of([])))),
);
```

## Rendering Strategies
CSR (default SPA) · SSR + Hydration (`ng add @angular/ssr`, better FCP/SEO) · SSG/prerendering for content-heavy routes. Under SSR avoid `window`/`document`/`localStorage` directly — gate with `isPlatformBrowser` or the `DOCUMENT` token.

## Accessibility
Use Angular CDK for headless accessible primitives (Listbox, Combobox, Menu, Tabs, Tree, Grid). Style ARIA attributes rather than hand-managing them: `[aria-selected="true"] { background: var(--color-selected); }`.
