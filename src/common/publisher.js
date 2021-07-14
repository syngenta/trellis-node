const AWS = require('aws-sdk');

class SNSPublisher {
    constructor(params) {
        AWS.config.update({region: params.snsRegion});
        this.sns = new AWS.SNS({apiVersion: '2010-03-31', endpoint: params.snsEndpoint});
        this.topicArn = params.topicArn;
        this.authorIdentifier = params.authorIdentifier;
        this.modelIdentifier = params.modelIdentifier;
        this.modelSchema = params.modelSchema;
        this.snsAttributes = params.snsAttributes;
    }
    async publish(params) {
        if (params.data) {
            try {
                const default_attributes = this._getDefaultAttributes(params.operation);
                const custom_attributes = this._formatCustomAttributes();
                const publish = {
                    TopicArn: this.topicArn,
                    Message: JSON.stringify(params.data),
                    MessageAttributes: {...default_attributes, ...custom_attributes}
                };
                await this.sns.publish(publish).promise();
            } catch (error) {
                if (!process.env.unittest) {
                    console.error(error);
                }
            }
        }
    }
    _getDefaultAttributes(operation) {
        const attributes = {
            model_schema: {
                DataType: 'String',
                StringValue: this.modelSchema
            },
            model_identifier: {
                DataType: 'String',
                StringValue: this.modelIdentifier
            },
            operation: {
                DataType: 'String',
                StringValue: operation
            }
        };
        if (this.authorIdentifier) {
            attributes.author_identifier = {
                DataType: 'String',
                StringValue: this.authorIdentifier
            };
        }
        return attributes;
    }
    _formatCustomAttributes() {
        const formatted = {};
        if (this.snsAttributes) {
            for (const [key, value] of Object.entries(this.snsAttributes)) {
                formatted[key] = {
                    DataType: 'String',
                    StringValue: value
                };
            }
        }
        return formatted;
    }
}

module.exports = SNSPublisher;
