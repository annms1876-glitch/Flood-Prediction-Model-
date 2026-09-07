# Security Specification & Test Suite for Umeed AI

## 1. Data Invariants
- **User Ownership Invariant**: A user profile document `/users/{userId}` can only be created, read, or updated if `request.auth.uid == userId`.
- **Identity Integrity**: `incoming().id == request.auth.uid` and cannot be mutated on update.
- **Strict Keys**: Documents cannot contain unauthorized or shadow fields.
- **PII Protection**: Profile data containing personal info (email, age, gender, location) cannot be listed or read by third parties.
- **Default Deny**: All unmapped collections and wildcard paths default to `allow read, write: if false;`.

## 2. The Dirty Dozen Payloads (Designed to break rules)
1. **Unauthenticated Read**: Attempting to read `/users/user123` without authentication. (Expected: DENIED)
2. **Cross-User Read**: User `alice` reading `/users/bob`. (Expected: DENIED)
3. **Identity Spoofing Create**: User `alice` creating `/users/bob` with `{ id: "bob" }`. (Expected: DENIED)
4. **Id Mismatch Create**: User `alice` writing `{ id: "bob" }` to `/users/alice`. (Expected: DENIED)
5. **Shadow Field Injection**: User `alice` creating profile with unexpected `{ isAdmin: true }` field. (Expected: DENIED)
6. **Immutable Id Mutation**: User `alice` attempting to update `id` field from `"alice"` to `"admin"`. (Expected: DENIED)
7. **Invalid Type for Age**: User writing `{ age: "thirty" }` instead of an integer. (Expected: DENIED)
8. **Invalid Enum for Gender**: User writing `{ gender: "superhero" }`. (Expected: DENIED)
9. **Invalid Enum for Role**: User writing `{ role: "system_root" }`. (Expected: DENIED)
10. **Oversized String Payload**: User writing name with string length > 100 chars. (Expected: DENIED)
11. **Malicious Path ID Injection**: Querying user document with junk characters `users/$$$###malicious$$$`. (Expected: DENIED)
12. **Blanket Collection Listing**: Unauthenticated or cross-user calling `getDocs(collection(db, "users"))`. (Expected: DENIED)

## 3. Test Invariants Summary
All test vectors in the Dirty Dozen must strictly return `PERMISSION_DENIED`.
