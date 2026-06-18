<!-- pattern from affaan-m/ecc rules/arkts/testing.md -->
---
origin: affaan-m/ecc
license: MIT
lang: arkts
concern: testing
---
# HarmonyOS / ArkTS Testing

Testing standard for HarmonyOS apps using the built-in framework (`@ohos/hypium`, `@ohos.UiTest`).

## Layout & Run
Test code lives in `src/ohosTest/ets/test/` (`*.test.ets`), with `TestAbility.ets` / `TestRunner.ets`.
```bash
hvigorw testHap -p product=default
hdc shell aa test -b com.example.app -m entry_test -s unittest /ets/TestRunner/OpenHarmonyTestRunner
```

## Unit Tests (`@ohos/hypium`)
```typescript
import { describe, it, expect } from '@ohos/hypium';
export default function UserViewModelTest() {
  describe('UserViewModel', () => {
    it('should_initialize_with_empty_state', 0, () => {
      const vm = new UserViewModel();
      expect(vm.userName).assertEqual('');
      expect(vm.isLoading).assertFalse();
    });
  });
}
```

## UI Tests (`@ohos.UiTest`)
```typescript
import { Driver, ON } from '@ohos.UiTest';
it('should_navigate_to_detail_on_click', 0, async () => {
  const driver = Driver.create();
  const button = await driver.findComponent(ON.id('detailButton'));
  await button.click();
  await driver.delayMs(500);
  expect((await driver.findComponent(ON.text('Detail'))) !== null).assertTrue();
});
```

## TDD Cycle (HarmonyOS-adapted)
1. RED — failing test in `ohosTest/ets/test/`
2. GREEN — minimal `main/ets/` code to pass
3. REFACTOR — clean up, tests green
4. BUILD — `hvigorw assembleHap` to verify compilation
5. VERIFY — run on device/emulator

## Coverage & Scope
- ≥80% for ViewModels, services, utilities.
- Unit: utility functions, ViewModel logic, data models. Integration: API/db/cross-module. E2E/UI: critical flows (login, navigation, submission). Cover edge cases (empty data, network errors, permission denials).

## Best Practices
- Independent tests, no shared mutable state. Mock network and system APIs in unit tests.
- Name `should_[behavior]_when_[condition]`. Test V2 reactivity (`@Trace` triggers UI updates) and `NavPathStack` push/pop/replace. Focus on business logic and user-visible behaviour, not framework internals.
