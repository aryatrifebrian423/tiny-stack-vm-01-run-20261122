# Tiny Stack VM

Exact 32-bit stack VM for make.fun's tiny ISA (ISA.md in the kit).

## Design

One table-driven loop: an 84-char string maps each opcode byte to its
(immediate, pops, pushes); a 19-entry function table holds the binary ops.
Traps fire in the reference order: step limit, pc, unknown opcode, cut-off
immediate, stack under/overflow, then the instruction's own trap. 32-bit
wrapping uses Math.imul and `|0`; DIV/MOD keep the INT_MIN/-1 rules;
DIVU/MODU/LTU read operands unsigned; shifts mask the count with 31.

## Verification

- Kit practice set: grade-local 1,000,000 (40/40, all instances answered).
- 3 freshly drawn sets (kit generator, new seeds): 40,000/40,000 each.
- Differential tests vs the reference vm.mjs: 400 fuzz programs plus
  59 hand-built trap-boundary cases (stack/call limits, all ten traps,
  step and output limits, truncated immediates, unknown opcodes) — 0
  mismatches over 600 checked instances.

Run: `node main.ts` (reads /input/i001..i040, writes /output/...).
