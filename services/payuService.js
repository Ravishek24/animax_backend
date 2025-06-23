const PayU = require("payu-websdk");
const crypto = require('crypto');

class PayUService {
    constructor() {
        this.payuClient = new PayU({
            key: process.env.PAYU_MERCHANT_KEY,
            salt: process.env.PAYU_MERCHANT_SALT,
        }, process.env.PAYU_ENVIRONMENT); // 'TEST' or 'LIVE'
    }

    // Generate hash for mobile SDK
    async generateHash(hashString, hashName, postSalt = '') {
        try {
            const salt = process.env.PAYU_MERCHANT_SALT;
            const hash = crypto
                .createHash('sha512')
                .update(hashString + salt + (postSalt || ''))
                .digest('hex');
            
            return { [hashName]: hash };
        } catch (error) {
            throw new Error(`Hash generation failed: ${error.message}`);
        }
    }

    // Verify payment
    async verifyPayment(txnId) {
        try {
            return await this.payuClient.verifyPayment(txnId);
        } catch (error) {
            throw new Error(`Payment verification failed: ${error.message}`);
        }
    }

    // Get transaction details
    async getTransactionDetails(startDate, endDate) {
        try {
            return await this.payuClient.getTransactionDetails(startDate, endDate);
        } catch (error) {
            throw new Error(`Failed to get transaction details: ${error.message}`);
        }
    }

    // Get settlement details
    async getSettlementDetails(dateOrUTR) {
        try {
            return await this.payuClient.getSettlementDetails(dateOrUTR);
        } catch (error) {
            throw new Error(`Failed to get settlement details: ${error.message}`);
        }
    }

    // Validate VPA (UPI ID)
    async validateVPA(vpa) {
        try {
            return await this.payuClient.validateVPA(vpa);
        } catch (error) {
            throw new Error(`VPA validation failed: ${error.message}`);
        }
    }

    // Get EMI details
    async getEmiDetails(amount) {
        try {
            return await this.payuClient.getEmiAmountAccordingToInterest(amount);
        } catch (error) {
            throw new Error(`Failed to get EMI details: ${error.message}`);
        }
    }

    // Create invoice
    async createInvoice(invoiceData) {
        try {
            return await this.payuClient.createInvoice(invoiceData);
        } catch (error) {
            throw new Error(`Invoice creation failed: ${error.message}`);
        }
    }

    // Cancel or refund transaction
    async cancelRefundTransaction(mihpayid, tokenId, amount) {
        try {
            return await this.payuClient.cancelRefundTransaction(mihpayid, tokenId, amount);
        } catch (error) {
            throw new Error(`Transaction cancellation/refund failed: ${error.message}`);
        }
    }

    // Check action status (refund/cancel)
    async checkActionStatus(requestId) {
        try {
            return await this.payuClient.checkActionStatus(requestId);
        } catch (error) {
            throw new Error(`Failed to check action status: ${error.message}`);
        }
    }
}

module.exports = new PayUService(); 