import {EntryDbType} from './entry';

export type UserProfileDbType = {
  uid: string;
  name: string;
  susId: string;
  phone: string;
  isAdm: boolean;
  fcmToken: string;
  lastGlicoseEntry?: EntryDbType;
};
