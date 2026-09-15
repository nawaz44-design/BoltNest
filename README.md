# BlogNest — Modern Blogging Platform

A full-stack, production-style blogging platform where users can register, log in, create and manage blog posts, browse posts from other writers, and interact through comments.

## Features

- **Authentication** — Email/password registration and login with secure session management
- **User Dashboard** — Stats cards (total posts, total comments, published posts), recent posts list, and quick actions
- **Blog Post Management** — Create, view, edit, and delete posts with title, content, category, excerpt, tags, and featured image
- **Comment System** — Authenticated users can post and delete their own comments on any blog post
- **Home Page** — Hero section, stats bar, latest stories grid, and call-to-action
- **Explore Page** — Full-text search, category filters, and sorting (latest, oldest, most commented)
- **Categories Page** — Browse all categories with post counts and quick links
- **Post Detail Page** — Full article view with author info, tags, comments section, and comment form
- **User Profile** — View and edit profile (name, bio), see post and comment counts, browse published posts
- **Responsive Design** — Fully responsive from mobile to desktop with hamburger menu on small screens
- **Loading States** — Skeleton loaders for blog cards, spinners for forms and actions
- **Toast Notifications** — Success and error feedback for all user actions

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 (custom Navy/Purple/Pink/Cyan theme) |
| Icons | Lucide React |
| Routing | React Router DOM |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Database | PostgreSQL (via Supabase) |

## Architecture

```
Frontend (React + TypeScript)
        ↓
Supabase Client SDK
        ↓
PostgreSQL Database (with Row Level Security)
```

The frontend communicates directly with Supabase using the client SDK. Row Level Security (RLS) policies enforce that users can only create, edit, and delete their own posts and comments, while published posts and all comments are publicly readable.

## Database Structure

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK → auth.users) | User ID |
| full_name | text | Display name |
| username | text (unique) | Unique handle |
| email | text (unique) | Email address |
| bio | text | Short bio |
| avatar_url | text | Profile picture URL |
| created_at | timestamptz | Registration date |

### posts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Post ID |
| title | text | Post title |
| content | text | Post body (HTML supported) |
| excerpt | text | Short description |
| category | text | One of 8 categories |
| author_id | uuid (FK → profiles) | Post author |
| status | text | 'published' or 'draft' |
| featured_image_url | text | Cover image URL |
| tags | text[] | Array of tags |
| created_at | timestamptz | Creation date |
| updated_at | timestamptz | Last update date |

### comments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Comment ID |
| content | text | Comment text |
| user_id | uuid (FK → profiles) | Comment author |
| post_id | uuid (FK → posts) | Associated post |
| created_at | timestamptz | Comment date |

### Relationships
- User 1 — * Posts (one user, many posts)
- User 1 — * Comments (one user, many comments)
- Post 1 — * Comments (one post, many comments)

## Security (RLS Policies)

- **profiles**: Public read; users can update only their own profile
- **posts**: Public read for published posts; owners can read their drafts; only owners can insert/update/delete
- **comments**: Public read; only authenticated users can create; only comment owners can delete

A database trigger automatically creates a profile row when a new auth user signs up.

## API (via Supabase Client)

| Operation | Method |
|-----------|--------|
| Register | `supabase.auth.signUp()` |
| Login | `supabase.auth.signInWithPassword()` |
| Logout | `supabase.auth.signOut()` |
| List posts | `supabase.from('posts').select()` |
| Get post | `supabase.from('posts').select().eq('id', id)` |
| Create post | `supabase.from('posts').insert()` |
| Update post | `supabase.from('posts').update().eq('id', id)` |
| Delete post | `supabase.from('posts').delete().eq('id', id)` |
| List comments | `supabase.from('comments').select().eq('post_id', id)` |
| Create comment | `supabase.from('comments').insert()` |
| Delete comment | `supabase.from('comments').delete().eq('id', id)` |

## Color Theme

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | #0F172A | Navbar, footer, headings |
| Royal Purple | #6D28D9 | Primary buttons, links |
| Electric Violet | #8B5CF6 | Accents, gradients |
| Coral | #F97316 | Highlights, stat cards |
| Pink | #EC4899 | Gradient buttons, badges |
| Cyan | #06B6D4 | Accents, stat cards |
| Background | #F8FAFC | Page background |

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── BlogCard.tsx
│   ├── BlogCardSkeleton.tsx
│   ├── Toast.tsx
│   └── ProtectedRoute.tsx
├── context/          # React context providers
│   └── AuthContext.tsx
├── lib/              # Utilities and API helpers
│   ├── supabase.ts
│   └── api.ts
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── CreatePost.tsx
│   ├── EditPost.tsx
│   ├── PostDetail.tsx
│   ├── Explore.tsx
│   ├── Categories.tsx
│   ├── Profile.tsx
│   └── About.tsx
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── index.css         # Global styles + Tailwind
```

## Future Improvements

- Rich text editor (WYSIWYG) for post creation
- Like/reaction system for posts and comments
- Bookmark/favorite posts
- Follow other writers
- Email notifications for new comments
- Dark mode toggle
- Pagination or infinite scroll for post lists
- Image upload via Supabase Storage
- SEO optimization with meta tags
