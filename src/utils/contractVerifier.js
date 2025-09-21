import Web3 from 'web3';

export const verifyContracts = async () => {
    const BETTING_ADDRESS = import.meta.env.VITE_BETTING_CONTRACT_ADDRESS;
    const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS;
    const RPC_URL = import.meta.env.VITE_RPC_URL;

    console.log('🔍 Verifying contract deployment...');
    console.log('Betting Contract:', BETTING_ADDRESS);
    console.log('Token Contract:', TOKEN_ADDRESS);
    console.log('RPC URL:', RPC_URL);

    try {
        // Create Web3 instance with RPC
        const web3 = new Web3(RPC_URL);

        // Check if contracts have code
        const bettingCode = await web3.eth.getCode(BETTING_ADDRESS);
        const tokenCode = await web3.eth.getCode(TOKEN_ADDRESS);

        console.log('Betting contract code length:', bettingCode.length);
        console.log('Token contract code length:', tokenCode.length);

        if (bettingCode === '0x') {
            console.error('❌ Betting contract not found at address:', BETTING_ADDRESS);
            return false;
        }

        if (tokenCode === '0x') {
            console.error('❌ Token contract not found at address:', TOKEN_ADDRESS);
            return false;
        }

        console.log('✅ Both contracts found on blockchain');
        return true;
    } catch (error) {
        console.error('❌ Contract verification failed:', error);
        return false;
    }
};
