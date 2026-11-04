# Animation plans

Written from a motion audit at commit `d9d3755`. Each plan is self-contained; run them in the order below. A plan whose code no longer matches its excerpts must stop and report rather than improvise.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Even packet steps](001-even-packet-steps.md) | HIGH | DONE |
| 002 | [Stage follows scroll](002-stage-follows-scroll.md) | HIGH | DONE |
| 003 | [Cheaper stage paint](003-cheaper-stage-paint.md) | HIGH | DONE |
| 004 | [Scroll snap decision](004-scroll-snap-decision.md) | MEDIUM | DONE (removed) |
| 005 | [Caption decodes with morph](005-caption-decodes-with-morph.md) | MEDIUM | DONE |
| 006 | [One cell size](006-one-cell-size.md) | MEDIUM | DONE |
| 007 | [Motion tokens](007-motion-tokens.md) | LOW | DONE |
| 008 | [Quiet contact source](008-quiet-contact-source.md) | LOW | DONE |
| 009 | [Contact hover burst](009-contact-hover-burst.md) | LOW (additive) | DONE |
| 010 | [Stage follows pointer](010-stage-follows-pointer.md) | LOW (additive) | DONE |
| 011 | [Diagram speeds on hover](011-diagram-speeds-on-hover.md) | LOW (additive) | DONE |
| 012 | [Timeline packet](012-timeline-packet.md) | LOW (additive) | DONE |

## Recommended order

1. **001**: every flow depends on its constant (`FLOW_RATE`).
2. **002**, then **003**: both touch the expertise stage; 003 sets the frame-rate budget that 010 relies on.
3. **006**: after 003, because 003 may add a phone cell size that 006 folds into the tokens.
4. **005**.
5. **008**, then **009**: 009 assumes one wire per contact row.
6. **010**, **011**, **012**: independent of each other, after their dependencies.
7. **007** last: it renames durations and frame rates that earlier plans touch.
8. **004** any time; it needs a real trackpad and a phone, not just a browser.

## Dependencies

- 003 before 006 and 010.
- 001 before 009 and 011.
- 008 before 009.
- 007 after all others.
