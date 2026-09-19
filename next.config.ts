import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * ADMIN_ACCESS_CODE est volontairement **absent** de `env` :
   * il ne doit jamais être injecté dans le bundle client.
   * Sa vérification se fait côté serveur dans `src/app/api/admin/auth/route.ts`.
   */
};

export default nextConfig;
