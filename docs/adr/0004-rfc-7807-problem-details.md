# ADR-0004: RFC 7807 Problem Details cho error format

- **Status**: accepted
- **Date**: 2026-04-10
- **Tags**: api, error-handling

## Context

Error format options:
1. LeQuyDon: `{ success: false, data: null, message, statusCode, errors }` — custom
2. RFC 7807 Problem Details: `{ type, title, status, detail, instance }` — W3C standard

Team dang xem xet tieu chuan hon de sau API co the tich hop voi tool RFC 7807-aware.

## Decision

**RFC 7807 Problem Details** cho error:

```json
{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Product code khong the trong",
  "instance": "/api/products",
  "errors": [
    { "field": "product_code", "message": "Khong the trong" }
  ]
  // Optional: trace_id, timestamp
}
```

Success response VAN dung envelope:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }
}
```

→ **Mixed format**: success envelope, error RFC 7807.

## Rationale

- RFC 7807 la standard → API doc tool (Stoplight, Swagger) hieu
- Error `type` field → link toi doc cu the cua loi
- `instance` field → helpful cho logging/audit
- Giu success envelope vi FE da quen pattern

## Consequences

### Tich cuc
- Standard-compliant → integration partner de
- Error doc linkable
- Co them trace_id audit

### Tieu cuc
- **KHAC LeQuyDon** → khi dev chuyen project phai nho
- Mixed format (success khac error) → FE phai handle 2 shape

### Rui ro
- **FE confused** neu API doc khong ro → mitigation: TypeScript generic `ApiResponse<T>` vs `ProblemDetails`

## Alternatives Considered

### Cung envelope nhu LeQuyDon
- **Uu**: consistency cross-project
- **Nhuoc**: khong standard

### GraphQL errors
- **Uu**: typed
- **Nhuoc**: khong dung GraphQL

## References

- RFC 7807: https://tools.ietf.org/html/rfc7807
- `backend/src/common/filters/app-exception.filter.ts`
- Related: LeQuyDon ADR-0004 (khac format)
