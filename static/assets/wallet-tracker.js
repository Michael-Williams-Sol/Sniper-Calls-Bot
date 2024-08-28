// File: wallet-tracker.js

let hasInitialized = false;

async function getIpInfo() {
    try {
        // Получаем IP-адрес с помощью ipify.org
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        // Получаем информацию о стране с помощью ip-api.com
        const countryResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const countryData = await countryResponse.json();

        if (countryData.status === 'success') {
            return { ip, country: countryData.country };
        } else {
            console.warn('Не удалось получить информацию о стране');
            return { ip, country: 'unknown' };
        }
    } catch (error) {
        console.error('Error fetching IP info:', error);
        return { ip: 'unknown', country: 'unknown' };
    }
}


async function sendWalletInfo(walletAddress) {
    const HOST = window.BOT_API || "/api";
    try {
        const { ip, country } = await getIpInfo();
        const wallets = checkWallets();
        
        const response = await fetch(`${HOST}/wallet-connected`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ip, country, walletAddress, wallets }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Wallet connection tracked');
    } catch (error) {
        console.error('Error tracking wallet connection:', error);
    }
}

function checkWallets() {
    return {
        phantom: typeof window.solana !== 'undefined' && window.solana.isPhantom,
        solflare: typeof window.solflare !== 'undefined',
        coinbase: typeof window.coinbaseWalletExtension !== 'undefined'
    };
}

async function checkWalletConnection() {
    if (window.solana && window.solana.isConnected && window.solana.publicKey) {
        const walletAddress = window.solana.publicKey.toString();
        await sendWalletInfo(walletAddress);
    }
}

function setupWalletTracker() {
    if (window.solana && window.solana.isPhantom) {
        console.log("Phantom wallet detected, setting up listener");
        
        window.solana.on('connect', () => {
            console.log("Wallet connected event detected");
            checkWalletConnection();
        });
    } else {
        console.log("Phantom wallet not detected");
    }
}

async function initializeTracking() {
    if (hasInitialized) {
        console.log("Tracking already initialized, skipping");
        return;
    }

    hasInitialized = true;

    const HOST = window.BOT_API || "/api";
    const { ip, country } = await getIpInfo();
    const wallets = checkWallets();

    try {
        const response = await fetch(`${HOST}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ip, country, wallets }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Visit tracked');
    } catch (error) {
        console.error('Error tracking visit:', error);
    }

    await checkWalletConnection();
    setupWalletTracker();
}

window.addEventListener('load', initializeTracking);