import bcrypt from 'bcryptjs';

const raw="pastrabeez@gmail.com";
const hashed="$2b$10$TO3ZxY45jKY9CxExUXyEHOi4KCzo5Ygp3wXw4oeKfJFBgLd/PSnZS";

bcrypt.compare(raw, hashed).then(res=>console.log("Compare result:", res));
// const salt = await bcrypt.genSalt(10);
// const direct = await bcrypt.hash(raw, salt);
// console.log("Direct enctyption: ", direct);
// const directCheck = await bcrypt.compare(raw, direct);
// console.log("Direct check:", directCheck);