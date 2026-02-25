const express = require('express');
const router = express.Router();
const NichorrAdminController = require('../controllers/NichorrAdminController');
const NichorrAuthController = require('../controllers/NichorrAuthController');
const NichorrClientController = require('../controllers/NichorrClientController');

/**
 * NICHORR AI - COMPLETE ROUTE MANAGEMENT
 */

// --- 🔐 Auth System ---
router.post('/signup', NichorrAuthController.signup);
router.post('/login', NichorrAuthController.login);

// --- 🎯 Inventory & Audit Engine ---
router.post('/analyze-site', NichorrAdminController.analyzeAndSave);
router.get('/inventory', NichorrAdminController.getInventory);
router.delete('/inventory/clear', NichorrAdminController.clearInventory);
// Naya: Outreach status update karne ke liye
router.patch('/inventory/update-status', NichorrAdminController.updateOutreachStatus);

// --- 📊 Admin Control Center (Prefix added for clarity) ---
router.get('/admin/stats', NichorrAdminController.getAdminStats);
router.get('/admin/trends', NichorrAdminController.fetchGlobalTrends);
// 🍋 MISSING: User ko plan upgrade dene ka rasta
router.post('/admin/upgrade-user', NichorrAdminController.updateUserRights);

// --- 📧 Email & Outreach System ---
// 🍋 MISSING: Dashboard se direct pitch bhejne ke liye
router.post('/admin/send-pitch', NichorrAdminController.autoSendPitch);
// Client ko report bhejne ke liye (Client Controller se)
router.post('/send-report-email', NichorrClientController.sendEmail);

// --- 👥 Client Management ---
router.post('/clients/add', NichorrClientController.addClient);
router.get('/clients', NichorrClientController.getClients);

module.exports = router;