import { loginAction } from "@/lib/auth-actions";

export const metadata = { title: "Connexion — Pulse" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const needsSetup = params.setup === "1";
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2 font-mono text-sm text-text-secondary">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span>pulse — dashboard marketing</span>
        </div>

        <div className="rounded-lg border border-border bg-surface-1 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
          <div className="border-b border-border px-5 py-3 font-mono text-xs text-text-muted">
            ~/pulse $ login
          </div>

          <div className="px-5 py-5">
            {needsSetup ? (
              <div className="mb-4 rounded-md border border-status-warning/30 bg-status-warning/10 px-3 py-2.5 font-mono text-xs leading-relaxed text-text-primary">
                Aucun mot de passe n&apos;est configuré. Définis{" "}
                <code className="text-accent">DASHBOARD_PASSWORD</code> dans tes variables
                d&apos;environnement (voir <code className="text-accent">.env.example</code>) puis
                relance l&apos;app.
              </div>
            ) : (
              <>
                <h1 className="mb-1 text-lg font-semibold text-text-primary">Accès protégé</h1>
                <p className="mb-5 text-sm text-text-secondary">
                  Entre le mot de passe partagé pour accéder au dashboard.
                </p>

                <form action={loginAction} className="flex flex-col gap-3">
                  <input type="hidden" name="next" value={next} />
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs uppercase tracking-wide text-text-muted">
                      Mot de passe
                    </span>
                    <input
                      type="password"
                      name="password"
                      autoFocus
                      required
                      className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary outline-none transition-colors focus:border-accent"
                      placeholder="••••••••"
                    />
                  </label>

                  {hasError ? (
                    <p className="font-mono text-xs text-status-critical">Mot de passe incorrect.</p>
                  ) : null}

                  <button
                    type="submit"
                    className="mt-1 w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
                  >
                    Se connecter
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
