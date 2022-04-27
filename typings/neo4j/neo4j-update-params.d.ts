import {DataParams} from '../common/data-params';
import {QueryParams} from '../common/query-params';

export declare type Neo4JUpdateParams<TData> = QueryParams<string> & DataParams<TData> & {
    search: boolean;
    originalVersionKey: string;
    debug?: boolean;
    overwriteArray?: boolean;
};
