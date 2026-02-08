# Campus Social — Expo UI scaffold

How to run:

1. npm install
2. npx expo start
3. Scan QR with Expo Go or run on an emulator.

Folder layout:

- src/components : reusable UI components (PostCard, Avatar, ComposeModal)
- src/screens : screens (Home, Chat, Profile)
- src/navigation : nav setup
- src/styles : theme & global tokens

Brand color:

- src/styles/theme.js -> change COLORS.primary to live-brand hex

Assigning:

- CSS Pro: style PostCard, Avatar, ComposeModal in theme-driven manner
- Mobile dev: implement Expo flows and wire supabase client later
