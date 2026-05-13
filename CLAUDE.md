# Project instructions

## Code style

- Prefer modular design: split implementations across focused, smaller files rather than accumulating unrelated code in monolithic files.
- Be strict about typing: annotate accurately, narrow types properly, and fix type errors at the source—do not paper over them with `Any`, blanket ignores, or loose catch-all shapes. Avoid shortcuts (casts without proof, suppressing checks) when the correct types or refactors are what the code actually needs.
