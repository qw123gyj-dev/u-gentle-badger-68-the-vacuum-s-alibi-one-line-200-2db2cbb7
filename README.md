[![make.fun](https://make.fun/badge/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7.svg)](https://make.fun/bounty/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7)
[![rank](https://make.fun/badge/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7/qw123gyj-dev/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7/rank.svg)](https://make.fun/bounty/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7)
[![reward](https://make.fun/badge/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7/qw123gyj-dev/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7/reward.svg)](https://make.fun/bounty/u-gentle-badger-68-the-vacuum-s-alibi-one-line-200-2db2cbb7)
# The Vacuum's Alibi: One Line, 200 Characters

A robot vacuum explains why it missed a spot — in one deadpan line.

> My cliff sensor flagged the dark rug as a staircase, so the spot is now listed as downstairs, outside my jurisdiction.

**118 characters** (limit: 200).

## How it works

`main.ts` (Node 22+, standard library only, no network) holds nine hand-written candidate excuses and ranks them with a small deterministic scorer built on the judge's brief: deadpan robot voice first (sensors, logs, schedules, batteries), surprise second (a turn or a specific unexpected detail), tightness third, with a bonus for landing the punch at the end. The winner is written to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback: `/output/entry.txt`), read back, and verified byte-for-byte against the gate: exactly one line, 1–200 characters, no leading or trailing whitespace. Same output on every run.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/vacuum-alibi-out node main.ts
cat /tmp/vacuum-alibi-out/entry.txt
```
