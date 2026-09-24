import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * ADMIN_ACCESS_CODE est volontairement **absent** de `env` :
   * il ne doit jamais être injecté dans le bundle client.
   * Sa vérification se fait côté serveur dans `src/app/api/admin/auth/route.ts`.
   */

  /**
   * En développement, Next.js refuse par défaut les ressources `/_next/*`
   * demandées depuis une autre origine que celle du serveur : les pages
   * s'affichent alors sans JavaScript ni styles lorsqu'on y accède via un
   * domaine d'aperçu (bac à sable, tunnel, reverse-proxy…).
   * On autorise donc les domaines d'aperçu utilisés par l'environnement de
   * développement. Sans effet en production (`next build` / `next start`).
   */
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev"],
};

export default nextConfig;
