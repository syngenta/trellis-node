const AWS = require('aws-sdk');

const _formatCustomAttributes = (snsAttributes) => {
    const formatted = {};
    if (snsAttributes) {
        for (const [key, value] of Object.entries(snsAttributes)) {
            formatted[key] = {
                DataType: 'String',
                StringValue: value
            };
        }
    }
    return formatted;
};

const _getDefaultAttributes = (params) => {
    const attributes = {
        model_schema: {
            DataType: 'String',
            StringValue: params.modelSchema
        },
        model_identifier: {
            DataType: 'String',
            StringValue: params.modelIdentifier
        },
        operation: {
            DataType: 'String',
            StringValue: params.operation
        }
    };
    if (params.authorIdentifier) {
        attributes.author_identifier = {
            DataType: 'String',
            StringValue: params.authorIdentifier
        };
    }
    return attributes;
};

exports.publish = async (params) => {
    if (params.snsTopicArn && params.data) {
        const sns = new AWS.SNS({apiVersion: '2010-03-31'});
        try {
            const attributes = _getDefaultAttributes(params);
            const formatted = _formatCustomAttributes(params.snsAttributes);
            const MessageAttributes = {...attributes, ...formatted};
            await sns
                .publish({
                    TopicArn: params.snsTopicArn,
                    Message: JSON.stringify(params.data),
                    MessageAttributes
                })
                .promise();
        } catch (error) {
            if (!process.env.unittest) {
                console.error(error);
            }
        }
    }
};
