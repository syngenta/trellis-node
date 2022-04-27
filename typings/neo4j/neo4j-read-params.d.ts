import {QueryParams} from '../common/query-params';

export declare type Neo4JReadParams = QueryParams<string> & {
    serialize: boolean;
    search: boolean;
    debug?: boolean;
};
