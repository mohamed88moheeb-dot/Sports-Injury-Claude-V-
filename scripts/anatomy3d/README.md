# 3D anatomy assets

`public/anatomy3d/` holds the data behind the 3D view on `/anatomy`
(`components/anatomy3d/`).

**Source:** BodyParts3D 4.0, © The Database Center for Life Science (DBCLS),
licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) —
attribution is shown in the viewer and in `public/anatomy3d/LICENSE.txt`.
Taken from the npm data pack `@somakine/bodyparts3d-musculoskeletal@0.2.0`
(data only; its viewer code is not used).

**Regenerate**

```sh
npm pack @somakine/bodyparts3d-musculoskeletal@0.2.0 && tar xzf somakine-bodyparts3d-musculoskeletal-0.2.0.tgz
# compress meshes (meshopt + quantization, ~31 MB -> ~12 MB)
npm i --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
(cd package && node ../scripts/anatomy3d/compress-models.mjs ../public/anatomy3d/models)
node scripts/anatomy3d/build-manifest.mjs package/public

# modelled ligaments / tendons / menisci (see below)
BP3D_PACK=package/public node scripts/anatomy3d/build-ligaments.mjs /tmp/modelled-connective.glb
# then compress it like the other models into public/anatomy3d/models/modelled-connective.glb
```

## Modelled structures

BodyParts3D has no mesh for the cruciate and collateral ligaments, the
menisci, the patellar tendon, the rotator cuff tendons, the main ankle
ligaments, the plantar fascia or the elbow UCL. `build-ligaments.mjs` builds
them: it finds landmarks on the scanned bones (epicondyles, tibial plateau and
spines, intercondylar notch walls, tibial tuberosity, malleoli, greater and
lesser tuberosities…), applies published offsets and sizes (LaPrade 2007 for
the MCL, LaPrade 2003 for the LCL, Hwang 2012 / Sehmi 2022 for the ACL,
meniscal morphometry studies, Curtis 2006 / Mochizuki 2008 for the cuff), and
sweeps each structure along the bone surface. The left side is built and
mirrored to the right, because the source skeleton is mirror-symmetric.
The viewer labels these "Modelled · not part of the scan" and lists the
sources for each.

`compress-models.mjs` reads `package/public/assets/bodyparts3d` relative to the
working directory. `anatomyInfo.mjs` holds the origin/insertion/action text,
the mapping to assessment regions, and the quadriceps split (the source ships
the quadriceps as one structure; elements are split into rectus femoris and the
three vasti by BodyParts3D element id).
