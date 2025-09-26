'use server';

import { upsertProfile as _upsertProfile } from '@/lib/personalization/profile';
import type { UpsertProfileParams } from '@/lib/personalization/profile';
import { emitViewedContentEvent as _emitViewedContentEvent } from '@/lib/personalization/index';
import type { ViewedContentParams } from '@/lib/personalization/index';

export async function upsertProfile(params: UpsertProfileParams) {
  return await _upsertProfile(params);
}

export async function emitViewedContentEvent(
  profileId: string,
  params: ViewedContentParams
) {
  return await _emitViewedContentEvent(profileId, params);
}
