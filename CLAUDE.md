# Project instructions

## Code style

- Prefer modular design: split implementations across focused, smaller files rather than accumulating unrelated code in monolithic files. At scale, organise by vertical domain slice (e.g. `subsystems/sims/`) rather than horizontal layer (e.g. separate `schemas/` and `sim_state/`).
- Be strict about typing: annotate accurately, narrow types properly, and fix type errors at the source—do not paper over them with `Any`, blanket ignores, or loose catch-all shapes. Avoid shortcuts (casts without proof, suppressing checks) when the correct types or refactors are what the code actually needs.
- Prefer `object` over `Any` for parameters that guard with `isinstance`: `Any` disables type checking in the function body; `object` enforces that you narrow before using.
- For known dict shapes, use `TypedDict` instead of `dict[str, Any]`. Build TypedDict instances explicitly rather than using `asdict()` + mutation, which bypasses the type checker.
- When interfacing with opaque runtime types (e.g. game engine objects), extend stub files with the attributes you actually access rather than annotating call sites with `Any`. Once an attribute is typed in the stub, use direct attribute access instead of `getattr` with a literal key.
