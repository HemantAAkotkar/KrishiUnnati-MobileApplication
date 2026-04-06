const config = {
    // ⚠️ Use your Laptop IP here instead of 127.0.0.1 so the Mobile App can connect
    BLOCKCHAIN_SERVICE_URL: 'http://mobile:5005', 
    baseBlockchainURL: 'https://-sagaciously.ngrok-free.dev',
    
    ENDPOINTS: {
        WALLET_CREATE: '/api/v1/pay-system-kup/wallet/create',
        WALLET_DEPOSIT: '/api/v1/pay-system-kup/wallet/deposit',
        ESCROW_LOCK: '/api/v1/pay-system-kup/escrow/lock',
        ESCROW_RELEASE: '/api/v1/pay-system-kup/escrow/release',
        PAYOUT_RECORD: '/api/v1/pay-system-kup/payout/create',
        WITHDRAW_REQUEST: '/api/v1/pay-system-kup/withdraw/request'
    }
};

// CRITICAL: You must export the properties individually for destructuring to work
module.exports = {
    BLOCKCHAIN_SERVICE_URL: config.BLOCKCHAIN_SERVICE_URL,
    baseBlockchainURL: config.baseBlockchainURL,
    ENDPOINTS: config.ENDPOINTS
};