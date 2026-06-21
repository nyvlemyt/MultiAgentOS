<!-- pattern from affaan-m/ecc rules/angular/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: angular
concern: testing
---
# Angular Testing

Testing standard for Angular apps. Use the project's configured runner (check `angular.json`/`package.json` — Vitest, Jest, or Jasmine+Karma).

```bash
ng test            # watch
ng test --no-watch # CI
```

## TestBed Setup
For standalone components, import the component directly; call `compileComponents()` for external templates.

```typescript
await TestBed.configureTestingModule({ imports: [UserCardComponent] }).compileComponents();
const fixture = TestBed.createComponent(UserCardComponent);
```

## Signal Inputs
Set signal inputs via `fixture.componentRef.setInput('user', mockUser)` then `fixture.detectChanges()`.

## Component Harnesses
Prefer Angular CDK harnesses over direct DOM queries — resilient to markup changes.

```typescript
const button = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
await button.click();
expect(saveSpy).toHaveBeenCalled();
```

## Router Testing
Use `RouterTestingHarness`:

```typescript
const harness = await RouterTestingHarness.create();
const component = await harness.navigateByUrl('/users/1', UserDetailComponent);
expect(component.userId()).toBe('1');
```

## Async Testing
`fakeAsync` + `tick` for controlled async; `waitForAsync` + `fixture.whenStable()` for real async.

```typescript
it('loads user after delay', fakeAsync(() => {
  vi.spyOn(service, 'getUser').mockReturnValue(of(mockUser));
  fixture.detectChanges(); tick(); fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.name').textContent).toBe(mockUser.name);
}));
```

## HTTP Testing
`provideHttpClient()` + `provideHttpClientTesting()`; drive expectations via `HttpTestingController`; `afterEach(() => httpMock.verify())`.

## Service Testing
Inject services directly (no fixture) via `TestBed.inject(UserService)`.

## What to Test
- **Services**: all public methods, error paths, HTTP interactions.
- **Components**: input/output bindings, rendered output for key states, user interaction via harnesses.
- **Pipes**: pure transformation — plain unit tests, no TestBed.
- **Guards/Resolvers**: allowed and denied return values via `RouterTestingHarness`.

## E2E
Use the project's configured framework (Cypress/Playwright) for critical flows. Add `data-cy` attributes for stable selectors; never select on CSS classes or text.

## Coverage
Target ≥80% for services and pipes. For components, test behaviour, not implementation details.
