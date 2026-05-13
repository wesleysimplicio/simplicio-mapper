# API Examples

Store small, sanitized request/response examples here.

Suggested layout:

```text
docs/api-examples/
  <feature>/
    request.json
    response.json
    error-response.json
```

## Template

Use this structure in a feature-specific markdown file:

```md
# <ENDPOINT_NAME>

- Method: <METHOD>
- Path: <PATH>
- Auth: <AUTH_REQUIRED>

## Request

~~~json
{}
~~~

## Response

~~~json
{}
~~~

## Notes

- <BUSINESS_RULE_OR_EDGE_CASE>
```
