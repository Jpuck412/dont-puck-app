# Don't Puck App — Architecture

Status: Phase 1 (Foundation) in progress. This is the living decision
record — update it when a decision changes. `BUILD_STATUS.md` tracks
phase-by-phase progress.

## What this is

An AI application-development platform: describe an app in plain
English, get a real generated repository, edit/preview/repair it,
push to GitHub, deploy to Vercel. No demo mode, no fake integrations,
no credit system.

## Execution reality

The original spec is written for an autonomous CLI agent (Claude
Code) running long sessions with a terminal, Docker, and direct repo
access. This is being built through chat instead, and the workflow is
the GitHub web UI plus the Vercel/Railway dashboards — no local
terminal. Two consequences, handled below rather than raised as
questions:

1. This gets built in installments (copy-box files, phase by phase),
   not as one finished platform in a single message. `BUILD_STATUS.md`
   is the through-line across sessions.
2. Every piece of infrastructure is chosen so it deploys and
   configures entirely from a web dashboard connected to GitHub —
   nothing here requires `docker compose up`, `pnpm install` on a
   local machine, or a CLI login.

## System shape
