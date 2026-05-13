# Domain Map

Use this file to give agents the shortest reliable path from a user request to the business rule behind it.

## Product Context

- App: `<APP_NAME>`
- Main users: `<USER_TYPES>`
- Main business goal: `<BUSINESS_GOAL>`

## Core Concepts

| Concept | Meaning | Source of truth |
|---|---|---|
| `<CONCEPT>` | `<WHAT_IT_MEANS>` | `<FILE_TABLE_ENDPOINT_DOC>` |

## Critical Rules

| Rule | Expected behavior | Where implemented | How to test |
|---|---|---|---|
| `<RULE_NAME>` | `<EXPECTED_BEHAVIOR>` | `<FILES_OR_MODULES>` | `<TEST_OR_SCENARIO>` |

## Main Entities

| Entity | Description | Storage |
|---|---|---|
| `<ENTITY>` | `<DESCRIPTION>` | `<TABLE_COLLECTION_MODEL>` |

## Important Flows

### `<FLOW_NAME>`

1. User/system action: `<ACTION>`.
2. Entry point: `<ROUTE_ENDPOINT_JOB>`.
3. Main modules: `<FILES_OR_SERVICES>`.
4. Output: `<RESULT>`.
5. Evidence: `<SCREENSHOT_VIDEO_TRACE_OR_LOG>`.

## Edge Cases

- `<EDGE_CASE>`: `<EXPECTED_HANDLING>`.

## Open Questions

- `<QUESTION>`: `<OWNER_OR_DECISION_NEEDED>`.
