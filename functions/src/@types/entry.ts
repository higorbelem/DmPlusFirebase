import {EntryDbType} from './db/entry';

export type EntryType = EntryDbType & {
  id: string;
};
