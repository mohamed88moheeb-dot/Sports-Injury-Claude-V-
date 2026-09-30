# ROYO v2

Criteria-based sports injury rehab for self-managed athletes. See `../docs/rebuild/BLUEPRINT.md`.

```
npm install
npm run dev                # app on :3000
npm test                   # engine unit tests
npm run validate:content   # protocols vs facts vs 3D structures
npm run simulate -- sprint # play a simulated course (sprint|stretch|tendon|flare)
```

- `src/engine/`: schema, validator and engine. Pure TypeScript with no condition-specific code.
- `content/facts/`: the tiered evidence base. `content/protocols/`: one content pack per injury (edit `build-*.mjs`, then run it).
- `supabase/migrations/`: database schema (RLS on every table).
- `src/components/anatomy3d/`: the 3D viewer. Models are in `public/anatomy3d` (BodyParts3D, CC BY 4.0).

Rule: the AI layer never chooses exercises, doses or stage changes. The engine does, from reviewed content.
