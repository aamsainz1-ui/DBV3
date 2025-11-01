Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get the authorization token from request body for POST method
        if (req.method === 'POST') {
            await req.json().catch(() => ({}));
        }
        const authToken = 'c0e72d2d88c924af14abe988a2a9d0aa';

        const transactionsResponse = await fetch('https://apis.truemoneyservices.com/account/v1/my-last-receive', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!transactionsResponse.ok) {
            const errorText = await transactionsResponse.text();
            throw new Error(`True Wallet API error: ${transactionsResponse.status} - ${errorText}`);
        }

        const transactionsData = await transactionsResponse.json();

        return new Response(JSON.stringify({ 
            data: transactionsData,
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('True Wallet Transactions error:', error);

        const errorResponse = {
            error: {
                code: 'TRANSACTIONS_FETCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
