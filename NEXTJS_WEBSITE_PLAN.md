# Raptor Connect Next.js Website Plan

## Purpose

This repo is currently the mobile app. The website should become the public-facing layer for:

- college landing pages
- product marketing
- campus and club discovery
- event browsing
- web sign-in and onboarding
- future admin or officer workflows that make more sense on desktop

The mobile app remains the student-first experience. The website should not be a random duplicate of the app. It should focus on web-native use cases.

## Recommended Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase for shared data
- Cloudflare R2 for media
- optional thin backend/BFF later for auth brokering, caching, and privileged actions

## Initial Website Scope

### Public

- Home
- About / product page
- College landing page
- Campus map page
- Clubs directory
- Club detail page
- Events directory
- Event detail page

### Authenticated

- Sign in
- Student dashboard
- Saved events
- Joined clubs
- Profile page

### Later

- Officer desktop tools
- Admin workspace
- Multi-college tenant landing pages
- College-specific branding and onboarding

## Recommended Folder Direction

When you are ready to build it, create a separate app folder instead of mixing it into the Expo `app/` router:

```text
officer-app/
  app/                 # Expo app
  components/          # shared or mobile-focused components
  lib/
  web/                 # future Next.js app
```

Inside `web/`:

```text
web/
  app/
  components/
  lib/
  public/
  styles/
```

## Shared Data Strategy

The website should reuse the same core entities already in Supabase:

- `profiles`
- `clubs`
- `events`
- `officers`
- `club_members`
- `forum_posts` where relevant

Do not fork the data model unless there is a strong reason.

## Website-Specific Guidance

- Build for desktop first, then ensure mobile responsiveness.
- Favor server-rendered or cached reads for public pages.
- Keep privileged officer/admin actions behind server-side checks.
- Do not rely on client-only Supabase calls for sensitive web workflows.
- Reuse the campus-map concept, but make it more content-driven on web.

## Suggested V1 Website Pages

1. Marketing homepage
2. Clubs directory
3. Events directory
4. Event detail page
5. Club detail page
6. Campus map page
7. Sign in page

## Design Direction

- clean but premium college-tech feel
- stronger typography than the mobile app starter styling
- bold hero sections
- campus imagery and event-led storytelling
- avoid generic SaaS visuals

## Next Build Step

When you want to start the actual website build, the clean next move is:

1. scaffold `web/` as a separate Next.js app
2. set up Tailwind and shared env handling
3. build the marketing homepage first
4. connect the clubs and events directory to Supabase
5. then add auth and user-specific pages
