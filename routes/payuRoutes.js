const express = require('express');
const router = express.Router();
const payuService = require('../services/payuService');

// Generate hash for mobile SDK
router.post('/generate-hash', async (req, res) => {
    try {
        const { hashString, hashName, postSalt } = req.body;
        const hash = await payuService.generateHash(hashString, hashName, postSalt);
        res.json(hash);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { txnId } = req.body;
        const result = await payuService.verifyPayment(txnId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transaction details
router.get('/transaction-details', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await payuService.getTransactionDetails(startDate, endDate);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get settlement details
router.get('/settlement-details/:dateOrUTR', async (req, res) => {
    try {
        const { dateOrUTR } = req.params;
        const result = await payuService.getSettlementDetails(dateOrUTR);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Validate VPA
router.post('/validate-vpa', async (req, res) => {
    try {
        const { vpa } = req.body;
        const result = await payuService.validateVPA(vpa);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get EMI details
router.get('/emi-details/:amount', async (req, res) => {
    try {
        const { amount } = req.params;
        const result = await payuService.getEmiDetails(amount);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create invoice
router.post('/create-invoice', async (req, res) => {
    try {
        const invoiceData = req.body;
        const result = await payuService.createInvoice(invoiceData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel or refund transaction
router.post('/cancel-refund', async (req, res) => {
    try {
        const { mihpayid, tokenId, amount } = req.body;
        const result = await payuService.cancelRefundTransaction(mihpayid, tokenId, amount);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check action status
router.get('/action-status/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const result = await payuService.checkActionStatus(requestId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 