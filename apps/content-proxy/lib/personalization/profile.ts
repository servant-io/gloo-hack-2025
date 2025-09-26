import { db } from '@/db/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type UpsertProfileParams = typeof profiles.$inferInsert;
type DbProfile = typeof profiles.$inferSelect;
type Profile = { id: DbProfile['id'] };

export async function upsertProfile(
  params: UpsertProfileParams
): Promise<Profile> {
  const { id } = params;
  const profileExists = id ? await checkProfileExists(id) : false;
  if (profileExists) {
    return await updateProfile(params as UpdateProfileParams);
  }
  return await createProfile(params as CreateProfileParams);
}

async function checkProfileExists(id: string) {
  const profile = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, id));
  return !!profile;
}

type UpdateProfileParams = typeof profiles.$inferSelect;

async function updateProfile(params: UpdateProfileParams) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, ...rest } = params;

  // If there are no fields to update, just return the existing profile
  if (Object.keys(rest).length === 0) {
    return { id };
  }

  const [profile] = await db
    .update(profiles)
    .set(rest)
    .where(eq(profiles.id, id))
    .returning({ id: profiles.id });
  return profile;
}

type CreateProfileParams = typeof profiles.$inferInsert;

async function createProfile(params: CreateProfileParams) {
  const [profile] = await db
    .insert(profiles)
    .values(params)
    .returning({ id: profiles.id });
  return profile;
}
