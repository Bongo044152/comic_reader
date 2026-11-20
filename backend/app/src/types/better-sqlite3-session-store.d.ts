declare module 'better-sqlite3-session-store' {
  function createSqliteSessionStore(
    session: typeof import('express-session')
  ): new (options: {
    client: unknown;
    expired?: {
      clear?: boolean;
      intervalMs?: number;
    };
  }) => import('express-session').Store;

  export = createSqliteSessionStore;
}
