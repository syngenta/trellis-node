export declare type BaseAdapterParams<TEngine extends string>  = {
    engine: TEngine;
    table: string;
    snsTopicArn?: string;
    authorIdentifier?: string;
    snsAttributes?: string;
    snsRegion?: string;
    snsEndpoint?: string;
    region?: string;
    endpoint?: string;
    status?: string;
    modelSchema: string;
    modelSchemaFile: string;
    modelVersionKey: string;
    modelIdentifier: string;
};
