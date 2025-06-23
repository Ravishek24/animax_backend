const axios = require('axios');
const plivoConfig = require('../config/plivo');

class PlivoService {
    constructor() {
        this.baseUrl = 'https://api.plivo.com/v1';
        this.auth = {
            username: plivoConfig.authId,
            password: plivoConfig.authToken
        };
    }

    // Create a new verification session
    async createSession(phoneNumber, options = {}) {
        try {
            const payload = {
                app_uuid: options.appUuid || plivoConfig.appUuid,
                recipient: phoneNumber,
                channel: options.channel || plivoConfig.defaultChannel,
                brand_name: options.brandName || plivoConfig.brandName,
                code_length: options.codeLength || plivoConfig.codeLength,
                url: options.callbackUrl || plivoConfig.callbackUrl,
                method: options.method || 'POST',
                locale: options.locale || 'en',
                app_hash: options.appHash
            };

            const response = await axios.post(
                `${this.baseUrl}/Account/${plivoConfig.authId}/Verify/Session/`,
                payload,
                {
                    auth: this.auth,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Plivo API Error: ${error.response.data.message || error.message}`);
            }
            throw new Error(`Failed to create verification session: ${error.message}`);
        }
    }

    // Validate an OTP
    async validateSession(sessionUuid, otp) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/Account/${plivoConfig.authId}/Verify/Session/${sessionUuid}/`,
                { otp },
                {
                    auth: this.auth,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Plivo API Error: ${error.response.data.message || error.message}`);
            }
            throw new Error(`Failed to validate OTP: ${error.message}`);
        }
    }

    // Get session details
    async getSession(sessionUuid) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/Account/${plivoConfig.authId}/Verify/Session/${sessionUuid}/`,
                {
                    auth: this.auth
                }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Plivo API Error: ${error.response.data.message || error.message}`);
            }
            throw new Error(`Failed to get session details: ${error.message}`);
        }
    }

    // List sessions with filters
    async listSessions(filters = {}) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/Account/${plivoConfig.authId}/Verify/Session/`,
                {
                    auth: this.auth,
                    params: {
                        app_uuid: filters.appUuid,
                        status: filters.status,
                        recipient: filters.recipient,
                        subaccount: filters.subaccount,
                        limit: filters.limit || 20,
                        offset: filters.offset || 0,
                        session_time: filters.sessionTime,
                        session_time__gt: filters.sessionTimeGt,
                        session_time__gte: filters.sessionTimeGte,
                        session_time__lt: filters.sessionTimeLt,
                        session_time__lte: filters.sessionTimeLte,
                        brand_name: filters.brandName,
                        app_hash: filters.appHash
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Plivo API Error: ${error.response.data.message || error.message}`);
            }
            throw new Error(`Failed to list sessions: ${error.message}`);
        }
    }
}

module.exports = new PlivoService(); 