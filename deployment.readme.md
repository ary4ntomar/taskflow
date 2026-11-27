# TaskFlow’s first deployment

I deployed TaskFlow’s Next.js frontend to Vercel, its Express API to Render, and kept PostgreSQL on Neon. The app worked locally. The first deployment showed me how much my local setup was doing for me: GitHub was missing the frontend files, the hosted API couldn’t resolve packages I had on my laptop, and mobile browsers could receive a successful sign-in response and still have no usable session.

This is how I got from that first push to testing the deployed app.

## First, get the frontend into the commit

My push was initially rejected because GitHub’s `main` had newer commits. The rebase paused on a README conflict. Later, a push succeeded, but opening `apps/client/src` on GitHub returned a 404. At that point I could still see the frontend files on my laptop.

The clue was the wording in `git status`: `apps/client/src (new commits, modified content)`. The parent repository had recorded a pointer to a nested Git repo. Running `git add .` from the root staged that pointer, so even a successful push could leave the actual frontend files out of the commit.

These two checks would have saved me time:

```bash
git -C apps/client/src rev-parse --show-toplevel
git ls-files --stage -- apps/client/src
```

A single entry with mode `160000` identifies the pointer. I backed up the project, removed the nested Git metadata, and removed the pointer from the parent index. The first index removal refused because the pointer already had staged changes. After backing up, I used `git rm --cached -f apps/client/src`, staged the actual files, and pushed normally. The `--cached` flag is what kept the working files on disk.

I also cleaned generated Prisma files and build output out of the index. Git’s ignore rules apply to untracked files. Anything already tracked needs its own index cleanup.

## Get Express running on Render

I set Render’s root directory to `apps/server`. That’s where TaskFlow’s server manifest, Prisma setup, and `server.ts` live. I configured the database and JWT values in Render, set `NODE_ENV=production`, and used the platform’s `PORT` with `3001` as the local fallback.

The errors came in a useful order:

| What the log said | What I changed |
|---|---|
| The selected Prisma CLI rejected `generate`. | Used the Prisma 7 toolchain and installed the build-time dependencies. |
| Prisma couldn’t import `dotenv/config`. | Installed dependencies from the repository root as well as the server directory. |
| npm reported `Missing script: "build"`. | Started the TypeScript entry point with `tsx`. |
| Prisma Client generated, then Node couldn’t find `express`. | Made the backend packages available in the hosted install and checked the next log to confirm the command actually ran. |

The first successful Render deploy recorded this build command:

```bash
npm install --prefix ../.. \
  && npm install --include=dev \
  && npm install express @types/express zod dotenv @prisma/client@7.10.1 @prisma/adapter-neon@7.10.1 prisma@7.10.1 tsx \
  && npx prisma generate
```

The start command was `npx tsx server.ts`. The log showed Prisma Client `7.10.1` generated and Express listening on port `10000`.

That command records what got the first release running. For a repeatable deploy, I’d declare the dependencies in the appropriate manifests and commit the lockfile. I’d also check database migrations separately. Generating a Prisma client makes it available to the code. It doesn’t change the database schema.

## Point Vercel at the actual Next.js app

I initially selected `apps/client`. Vercel reported `NEXT_NO_VERSION` because TaskFlow’s Next.js `package.json` and config lived one level deeper, in `apps/client/src`. Selecting that directory fixed framework detection.

I first set the frontend’s public API URL to the Render address and configured Render’s `CLIENT_URL` with the production Vercel origin for credentialed requests. I used the public production alias to test. A preview URL had prompted for Vercel login, which was easy to mistake for a TaskFlow auth problem.

## Fix the gap between “signed in” and “has a session”

The turning point was seeing a **200 on sign-in followed by a failed protected request** on mobile. The browser was calling Render directly from a page on Vercel, so the session relied on cross-site cookies. I’d already worked through cookie settings for sign-in, refresh, and logout. A successful login response still couldn’t tell me whether the browser accepted and later sent those cookies.

I moved the browser-facing API onto the frontend origin. In `apps/client/src/next.config.ts`, I added this to the Next.js config:

```ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "https://YOUR-RENDER-SERVICE.onrender.com/:path*",
    },
  ]
},
```

On Vercel I set `NEXT_PUBLIC_API_URL=/api` and rebuilt. The existing Secret entry had to be recreated as public configuration. The browser now requests `/api/auth/signin` from the Vercel origin and Next.js forwards it to `/auth/signin` on Express. The real Render hostname and the destination’s `/:path*` both matter. I initially got the destination wrong and confirmed the corrected deployment against commit `7471128`.

If I see this again, I’ll open Network and follow two requests. On sign-in, check the request host and whether the browser accepted `Set-Cookie`. On the next protected request, check whether the cookie was sent. If the request only fails after the access token expires, follow refresh and the original request’s retry as a separate trace. The chat discussed a shared refresh interceptor, but didn’t confirm its rollout across every route.

## Make the board save what the screen shows

While testing the deployed app, I could drag cards and then reload to find them stacked in **Done**. The old `PUT /issues` advanced the issue one step on every request. The UI let me choose a destination, but the handler ignored it.

I updated the handler to read the requested destination and save it after the existing access check when the status was valid. The client sent the move like this:

```ts
await axios.put(`${apiUrl}/issues`, { status: apiStatus }, {
  params: { issueId },
  withCredentials: true,
})
```

The accepted values were `upnext`, `inprogress`, and `done`. The handler shown in the transcript retained the old advancement fallback for missing or invalid values.

Cards also jumped during rapid moves. A refetch triggered by an earlier successful move could overwrite a newer local move while it was still saving. I removed the success refetch and kept refetching on error. To verify persistence, I check the destination in the PUT payload, reload, and compare it with the status in a fresh GET.

## Put the Issues page’s URL reader inside Suspense

Safari sometimes showed “Select a valid board in the URL.” That message comes from my own board ID check. Before blaming the session, I check whether the link contains `?boardId=…`. A missing parameter returns `null`, and converting it with `Number(null)` gives `0`.

The deployment change was to move the existing page body and its `useSearchParams()` call into `IssuesContent` and wrap that child in Suspense:

```tsx
import { Suspense } from "react"

export default function Issues() {
  return (
    <Suspense fallback={null}>
      <IssuesContent />
    </Suspense>
  )
}
```

The transcript records the change but doesn’t isolate why Safari hit the invalid-ID state. Next time I’d compare opening the exact board URL directly with navigating to it from the app.

## Where I stopped testing

Desktop worked end to end. iPhone worked after retrying. Android had worked earlier in testing, but sign-in was failing again in the last report. A Render cold start was suspected for the slow first attempts. There were no request timings or matching logs to confirm it.

For the next release, I’ll open the production URL in a private window on desktop and both phones. I’ll sign in, open a board, move an issue, reload to check the saved state, and sign out. If it fails, I’ll capture the first failing request and match it to the deploy or server log before changing another setting. That was the most useful lesson from this deployment.
