# Phi-Baseball

A small party game built in **React + TypeScript** on **Firebase Hosting** and **Realtime Database (RTDB)**. One person hosts a room (5-digit code). Players join on their devices, enter their name and a set of facts (by difficulty) about themselves. When the host starts, they draw random facts by level for which the player's will have to guess who is described by the fact. Used facts are removed so that they don't repeat.

## Features
- Host creates a game room with a **unique 5‑digit code**.
- Players join with **Anonymous Auth** (no login UI) and submit their facts.
- Facts are stored per‑player and grouped by **difficulty levels**.
- Host can **start the game**; after starting, facts can’t be submitted.
- Host UI shows **buttons per level** with remaining counts; clicking draws a random fact and **persists it as used**.
- **Host session restore**: the current room code is saved in `localStorage` and validated on load.

> Admin dashboard (email/password) is planned but not required for normal play.

## Tech Stack

- **React + TypeScript + Vite**
- **Firebase**: Hosting, Realtime Database, Authentication (Anonymous)
- **Firebase Emulators** for local dev
- Path alias: `@` -> `src`

## Project Structure (Key Files)
```
src/
auth/
AuthProvider.tsx # signs in anonymously before rendering app
components/
HostComponents/
Lobby.tsx # shows room code, ready counts, start button
NewGameForm.tsx # create room
JoinComponents/
JoinGameForm.tsx # enter room code
FactsForm.tsx # dynamic facts form (by factQuantity)
hooks/
useSubmittersCount.ts # counts players who submitted facts
lib/
storage.ts # localStorage helpers (TTL)
models/
room.ts # Room type (+ serverTimestamp typing)
game-stage.ts # GAMESTAGES enum/consts
keys.ts # path key constants (e.g., rooms, factsByPlayer)
services/
firebase.ts # init, emulator connections, ensureAnon()
room-service.ts # host actions (create, start/end)
player-service.ts # player actions (join, submit facts)
host-room-pointer-service.ts # remember/forget room in storage
room-lookup-service.ts # validate room from storage
game-service.ts # fetch facts once, group by level, mark used
pages/
HostPage.tsx # host flow
JoinPage.tsx # player flow
```

## Getting Started

### 1) Prerequisites
- Node 18+
- Firebase CLI: `npm i -g firebase-tools`
- A Firebase project (or the emulators for local only)

### 2) Install
```bash
npm install
```

### 3) Environment
Create `.env.local` (Vite uses `VITE_` prefix):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4) Vite alias (`@` -> `src`)
**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';


export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    }
});
```

**tsconfig.json**
```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": { "@/*": ["src/*"] }
    }
}
```

### 5) Firebase emulators (dev)
**firebase.json** (snippet)
```json
{
    "emulators": {
        "auth": { "host": "127.0.0.1", "port": 9099 },
        "database": { "host": "127.0.0.1", "port": 9000 },
        "hosting": { "host": "127.0.0.1", "port": 5000 },
        "ui": { "enabled": true, "host": "127.0.0.1", "port": 4000 }
    }
}
```

Run:
```bash
firebase emulators:start --only auth,database,hosting
```

### 6) App boot (Auth + DB)
**src/firebase.ts** (essentials)
```typescript
import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';


const app = initializeApp({ /* from env */ });
export const db = getDatabase(app);
export const auth = getAuth(app);


if (import.meta.env.DEV) {
    connectDatabaseEmulator(db, '127.0.0.1', 9000);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}


let anonOnce: Promise<void> | null = null;
export async function ensureAnon() {
    if (auth.currentUser) return;
    if (!anonOnce) anonOnce = signInAnonymously(auth).then(() => {}).catch(e => { anonOnce = null; throw e; });
    return anonOnce;
}
```

Wrap the app so we have a UID before any DB access:
```typescript
// src/auth/AuthProvider.tsx
useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setReady(!!u));
    ensureAnon().catch(console.error);
    return unsub;
}, []);
```

### 7) Run the UI
```bash
npm run dev
```

## Realtime Database Rules (current)
**database.rules.json** (core parts used today):
```json
{
    "rules": {
        "rooms": {
            "$code": {
                "hostUid": {
                    ".read": "auth != null",
                    ".write": "auth != null && (!data.exists() || newData.val() === auth.uid)",
                    ".validate": "newData.isString() && newData.val() === auth.uid"
                },
                "state": {
                    ".read": "auth != null",
                    ".write": "auth.uid === root.child('rooms/'+$code+'/hostUid').val()",
                    ".validate": "newData.isString() && (newData.val() === 'pregame' || newData.val() === 'lobby' || newData.val() === 'active' || newData.val() === 'ended')"
                },
                "factQuantity": {
                    ".read": "auth != null",
                    ".write": "auth.uid === root.child('rooms/'+$code+'/hostUid').val()",
                    ".validate": "newData.isNumber() && newData.val() >= 2 && newData.val() <= 6"
                },
                "createdAt": {
                    ".read": "auth != null",
                    ".write": "auth.uid === root.child('rooms/'+$code+'/hostUid').val()",
                    ".validate": "newData.val() == now || newData.isNumber()"
                },


                "players": {
                    ".read": "auth != null && (root.child('rooms/'+$code+'/players/'+auth.uid).exists() || auth.uid === root.child('rooms/'+$code+'/hostUid').val())",
                    "$uid": {
                        ".write": "auth.uid === $uid",
                        "name": { ".validate": "newData.isString() && newData.val().length > 0" }
                    }
                },


                "factsByPlayer": {
                    ".read": "auth.uid === root.child('rooms/'+$code+'/hostUid').val()",
                    "$uid": {
                        "$level": {
                            "$factId": {
                                ".write": "auth.uid === $uid && root.child('rooms/'+$code+'/players/'+auth.uid).exists() && root.child('rooms/'+$code+'/state').val() === 'lobby'",
                                ".validate": "newData.hasChildren(['text']) && newData.child('text').isString() && newData.child('text').val().length > 0"
                            }
                        }
                    }
                },


                "usedFacts": {
                    ".read": "auth.uid === root.child('rooms/'+$code+'/hostUid').val()",
                    "$uid": { "$level": { "$factId": {
                        ".write": "auth.uid === root.child('rooms/'+$code+'/hostUid').val()",
                        ".validate": "newData.val() === true"
                    }}}}
            }
        }
    }
}
```

Deploy (prod) or restart (dev) after changes:
```bash
firebase deploy --only database
# or
^C and restart: firebase emulators:start --only auth,database,hosting
```

## Data model (RTDB)
```
rooms/{code} = {
    hostUid: string,
    state: 'pregame'|'lobby'|'active'|'ended',
    factQuantity: number, // e.g. 2..6
    createdAt: number, // server timestamp
    players: {
        {uid}: { name: string }
    },
    factsByPlayer: {
        {uid}: {
        {level}: { {factId}: { text: string } }
        }
    },
    usedFacts: { {uid}: { {level}: { {factId}: true } } }
}
```

## How things work
- **Create room** (host): claim `rooms/{code}/hostUid` via transaction; then write `state='lobby'`, `factQuantity`, `createdAt`.
- **Join + submit** (player): write `players/{uid}` then push facts under `factsByPlayer/{uid}/{level}/{factId}`. After start, rules block further fact writes.
- **Start Game** (host): set `state='active'`; fetch all facts once; group by level; on each draw, pick randomly, remove from local bucket, and `set rooms/{code}/usedFacts/{uid}/{level}/{factId}=true` to persist usage.
- **Restore Session** (host): save `roomCode` in `localStorage` with TTL; on load, validate `{ hostUid === auth.uid }` and `state !== 'ended'`.

## Dev tips & pitfalls
- `connectAuthEmulator(auth, 'http://127.0.0.1:9099')` must include **http://** (no trailing slash).
- `serverTimestamp()` is a sentinel; rules must allow `newData.val() == now || newData.isNumber()`.
- Transactions require `.read` and `.write` on the path—use `rooms/{code}/hostUid` (not the parent) for the claim step.
- When building multi‑path updates, use `push(ref(...)).key` (a string). Don’t interpolate `ref.toString()`—it includes a URL and breaks keys.

## Scripts
Typical Vite scripts (check your `package.json`):
```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    }
}
```

## Roadmap / TODO
- Scoring, teams, and turn rotation
- Fact reveal UI + correctness buttons (update scoreboard)
- Admin dashboard (email/password) + `admins/{uid}` gating
- Styling pass (buttons, transitions, mobile polish)

## License

Distributed under the _MIT_ license. See [LICENSE](LICENSE) for more information.

## Contact

Gab 'Sp0k' Savard - [contact@gabsavard.com](mailto:contact@gabsavard.com)
