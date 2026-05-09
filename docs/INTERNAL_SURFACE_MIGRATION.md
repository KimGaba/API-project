# Internal Surface Migration

## Decision
Use `3014` as the single internal admin/backend/control surface going forward.

## New canonical local mapping
- `3010` = public frontend
- `3011` = API
- `3012` = customer dashboard
- `3014` = internal admin/backend/control surface

## Deprecated
- `3013` = deprecated internal admin app port / intermediate state

## Migration steps
1. Mark `3014` as the official internal surface in docs
2. Mark `3013` as deprecated everywhere user-facing
3. Update links and copy so internal navigation points to `3014`
4. Move/merge the admin role into the `3014` surface direction
5. Stop treating project board and admin as separate long-term internal destinations

## Notes
This reduces overlap and keeps the internal experience in one place.
