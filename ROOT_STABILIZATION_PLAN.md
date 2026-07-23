# ROOT STABILIZATION PLAN - StudyLunch

## 1. Current Issues Found
- **White Screen of Death (WSOD):** Caused by missing exports in `authService.js` and `userService.js`. React Contexts failed to mount.
- **Broken Imports:** Previous iterations used `../config/firebase` instead of the correct `../firebase/firebase`.
- **Disconnected Core Flow:** Accepting a topic did not reliably create a strictly structured Session document.
- **Self-Mentoring Bug:** Creators could accept their own topics.
- **File Duplication:** `Workspace.jsx` (untracked) conflicting with `SessionWorkspace.jsx`.

## 2. Broken Imports/Exports Fixed
- `authService.js`: Added aliases for `login`, `signup`, `logout`, `observeAuthState`, and restored `googleLogin` and `resetPassword`.
- `userService.js`: Added alias `getUser` to map to `getUserProfile`.

## 3. Service Issues & Firebase Path
- Standardized ALL Firebase imports to: `import { db, auth } from '../firebase/firebase';`
- Enforced strict Data Schema on Session creation (embedded `checkIn`, `confirmation`, `endRequest` objects).

## 4. Status Machine Enforced
- **Topic:** `open` -> `matched` -> `completed`
- **Session:** `scheduled` -> `ready` -> `in_progress` -> `waiting_end_confirmation` -> `completed`

## 5. Exact Fix Plan
1. Overwrite Services (`auth`, `user`, `topic`, `session`) with bulletproof exported aliases.
2. Update `TopicDetails.jsx` to atomically chain `acceptTopic` and `createSession`.
3. Instruct deletion of the untracked duplicate `Workspace.jsx`.