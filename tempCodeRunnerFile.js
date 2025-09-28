import bcrypt from 'bcryptjs';

const raw="terraria123";
const hashed="$2b$10$TO3ZxY45jKY9CxExUXyEHOi4KCzo5Ygp3wXw4oeKfJFBgLd/PSnZS";

bcrypt.compare(raw, hashed).then(res=>console.log("Compare result:", res));