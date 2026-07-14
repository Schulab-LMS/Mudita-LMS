-- Production diagnostics found that a sequential scan evaluates Aisha's
-- Enrollment.userId rows correctly while an indexed equality lookup returns
-- no rows. Rebuild every Enrollment index from the authoritative table data.
-- The table is small, so the brief non-concurrent write lock is preferable to
-- leaving a concurrent migration outside Prisma's normal transaction handling.
REINDEX TABLE "Enrollment";
