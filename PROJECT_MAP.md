# PROJECT MAP

Web: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5, Lucide React.
Android: Jetpack Compose (Material3), Kotlin 2.0, Target SDK 36.
Entry points: `app/page.tsx` (Web SplitBiller), `app/debt/page.tsx` (Web DebtBook), `AnhpanSplitter Mobile/.../MainActivity.kt` (Android App).

## 1. Modules
- `app/layout.tsx`: Root layout with Geist font and AppProvider wrapper.
- `app/page.tsx`: Modular main view for SplitBiller tab routing and modals.
- `app/debt/page.tsx`: Personal debt management view (borrow/lend/settle) linked to AppContext.
- `context/AppContext.tsx`: Unified global state for members, bills, debts, settings, and calculation algorithms.
- `components/ui/Button.tsx`: Reusable button component with design variants.
- `components/ui/Input.tsx`: Reusable text input component with validation and dark mode.
- `components/ui/Dialog.tsx`: Reusable modal dialog container.
- `components/bill/BillForm.tsx`: Bill creation and editing form with smart money shorthand and shares.
- `components/bill/BillList.tsx`: Pending bill item list with edit and delete actions.
- `components/bill/SummaryTab.tsx`: Aggregated debt settlement matrix and VietQR quick actions.
- `components/bill/HistoryTab.tsx`: Settled bill archives with detail viewer.
- `components/bill/HistoryDetailModal.tsx`: Modal displaying settled bill item breakdown and member snapshots.
- `components/bill/MembersTab.tsx`: Team member management with dependency-aware safe removal.
- `components/bill/SettingsTab.tsx`: Settings for rounding, debt simplification, banking, and theme.
- `components/bill/QrModal.tsx`: VietQR modal with dynamic link and copy actions.
- `components/HeaderSwitch.tsx`: Top header navigation switcher between SplitBiller and DebtBook.
- `lib/money.ts`: Currency shorthand parser (k, tr, m, dot notation), adjustments evaluator, and formatters.
- `constants/banks.ts`: Vietnamese banks catalog (BIN, code, name) for VietQR generation.
- `constants/translations.ts`: Bilingual dictionary (Vietnamese, English).
- `types/index.ts`: Data models (Member, Bill, ExtraSplit, Transfer, AppSettings, DebtRecord).
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/MainActivity.kt`: Android main activity orchestrating AppTopBar, AppBottomBar, and screen routing.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/model/Models.kt`: Kotlin data classes and enums for members, bills, transfers, debts, and app modes.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/util/MoneyUtil.kt`: Android shorthand money parser, rounding evaluator, and currency formatters.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/util/BillCalculator.kt`: Ported algorithmic engine for shares weighting and greedy debt simplification.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/viewmodel/MainViewModel.kt`: Centralized Android ViewModel managing reactive state for all features.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/components/Navigation.kt`: Brutalist AppTopBar mode switcher and 5-destination AppBottomBar with badges.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/screens/MembersScreen.kt`: Mobile member roster screen with safe deletion checks.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/screens/BillsScreen.kt`: Mobile bill creator with shorthand money chips, shares counter, and live estimate.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/screens/SummaryScreen.kt`: Aggregated mobile settlement summary with clipboard copy and system share sheet.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/screens/HistoryScreen.kt`: Settled bill archives with interactive bill detail dialog.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/screens/DebtScreen.kt`: Personal borrow and lend ledger with balance cards and subtabs.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/screens/SettingsScreen.kt`: Mobile preferences for rounding, debt simplification, default app, and v3.3 tag.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/theme/Color.kt`: Brand color tokens matching webapp palette.
- `AnhpanSplitter Mobile/app/src/main/java/com/example/anhpansplitter/ui/theme/Theme.kt`: Jetpack Compose Material3 theme with brutalist square shapes.

## 2. Core Data/State Flow
- Web: Unified persistence in browser LocalStorage (`aesthetic_members`, `aesthetic_bills`, `aesthetic_debts`, `aesthetic_settings`).
- Android: Centralized reactive state in MainViewModel with compose mutable state tracking.
- Bill splitting flow: Add members -> Input bills (Equal, Shares weighting, or Advanced by item) -> Calculate net transfers via calculateTransfers with zero-member & ghost-member fallbacks -> Optimize payments via greedy matching -> Display payment summary and VietQR/Share intents.
- Personal debt flow: Add borrow/lend ledger entries linked to members -> Auto-create member if missing -> Toggle active/settled status.
