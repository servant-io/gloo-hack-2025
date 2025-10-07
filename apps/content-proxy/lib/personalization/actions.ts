'use server';

import { upsertProfile as _upsertProfile } from '@/lib/personalization/profile';
import type { UpsertProfileParams } from '@/lib/personalization/profile';
import {
  emitViewedContentEvent as _emitViewedContentEvent,
  emitContentBytesTransferEvent as _emitContentBytesTransferEvent,
} from '@/lib/personalization/index';
import type {
  ContentBytesTransferParams,
  ViewedContentParams,
} from '@/lib/personalization/index';

export async function upsertProfile(params: UpsertProfileParams) {
  return await _upsertProfile(params);
}

export async function emitViewedContentEvent(
  profileId: string,
  params: ViewedContentParams
) {
  return await _emitViewedContentEvent(profileId, params);
}

export async function emitContentBytesTransferEvent(
  profileId: string,
  params: ContentBytesTransferParams
) {
  return await _emitContentBytesTransferEvent(profileId, params);
}
