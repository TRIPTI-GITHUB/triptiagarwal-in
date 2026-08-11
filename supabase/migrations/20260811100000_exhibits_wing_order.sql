-- museum-v2 (parallel route, /museum-v2) - nullable wing numbering for
-- the new lobby's per-wing Entry/Exit arches. Falls back to creation
-- order (created_at) when unset - see lib/museum-v2/layout.ts. Purely
-- additive; the existing /museum route never reads this column.
alter table public.exhibits add column if not exists wing_order integer;
