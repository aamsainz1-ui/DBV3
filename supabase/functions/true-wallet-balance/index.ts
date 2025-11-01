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
        // Get the authorization token from request body (allows switching between tokens)
        const { token } = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
        
        // Use provided token or default to the first one
        const authToken = token || '92b49f8641e333105ea508905fa0a031';

        // Call True Wallet Balance API
        const balanceResponse = await fetch('https://apis.truemoneyservices.com/account/v1/balance', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!balanceResponse.ok) {
            const errorText = await balanceResponse.text();
            throw new Error(`True Wallet API error: ${balanceResponse.status} - ${errorText}`);
        }

        const balanceData = await balanceResponse.json();

        // Return success response
        return new Response(JSON.stringify({ 
            data: balanceData,
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('True Wallet Balance error:', error);

        const errorResponse = {
            error: {
                code: 'BALANCE_FETCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
