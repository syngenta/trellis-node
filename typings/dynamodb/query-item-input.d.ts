import {DtaKey} from './dta-key';

export declare type QueryItemInput = {
    ExpressionAttributeValues: DtaKey;
    ExpressionAttributeNames?: Record<string, string>;
    KeyConditionExpression: string;
    IndexName?: string;
    Limit?: number;
};
