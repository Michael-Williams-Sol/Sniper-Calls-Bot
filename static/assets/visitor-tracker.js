// Файл: visitor-tracker.js

async function trackVisit() {
    const HOST = window.BOT_API || "/api";

    async function getIpInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return { ip: data.ip, country: data.country_name };
        } catch (error) {
            console.error('Error fetching IP info:', error);
            return { ip: 'unknown', country: 'unknown' };
        }
    }

    async function sendVisitInfo() {
        try {
            const { ip, country } = await getIpInfo();
            const wallets = {
                phantom: !!window.solana,
                solflare: !!window.solflare,
                coinbase: !!window.coinbaseWalletExtension
            };

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

            const result = await response.json();
            console.log('Visit tracked:', result);
        } catch (error) {
            console.error('Error tracking visit:', error);
        }
    }

    await sendVisitInfo();
}


window.addEventListener('load', trackVisit);