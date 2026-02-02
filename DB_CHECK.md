# Database Mein Data Kaise Dekhein

## 1. Prisma Studio (Sabse Aasan)

```bash
npm run studio
```

Phir browser mein **http://localhost:5555** kholo.

- Left side se **`users`** table par click karo
- Yahan sab users dikhenge: `id`, `name`, `email`, `password` (hash), `image`
- Signup ke baad naya user yahan dikhega

---

## 2. pgAdmin / SQL Query

```sql
-- Sab users dekhne ke liye
SELECT id, name, email FROM users ORDER BY id DESC;

-- Sirf credential users (jo email/password se signup kiye)
SELECT id, name, email FROM users WHERE password IS NOT NULL;
```

---

## 3. Sign Up Test Karne Ka Flow

1. `/signup` par jao
2. First Name: kiran, Last Name: chauhan, Email: kiran@xzectlabs.com, Password: 6+ chars
3. Sign Up click karo
4. Success par → `/` (home) par redirect hoga
5. DB check: `npm run studio` → `users` table → naya row dikhega
