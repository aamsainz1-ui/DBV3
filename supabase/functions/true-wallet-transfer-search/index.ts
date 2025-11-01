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
        let phoneNumber = '';
        let amount: number | undefined;
        
        // Handle both POST (request body) and GET (query parameters) methods
        if (req.method === 'POST') {
            const body = await req.json();
            phoneNumber = body.phoneNumber || '';
            amount = body.amount;
        } else if (req.method === 'GET') {
            const url = new URL(req.url);
            phoneNumber = url.searchParams.get('phoneNumber') || '';
            const amountParam = url.searchParams.get('amount');
            amount = amountParam ? parseFloat(amountParam) : undefined;
        }

        // รับ token จาก Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Missing or invalid Authorization header');
        }
        const authToken = authHeader.replace('Bearer ', '');

        // Build request body with correct parameters
        const requestBody: any = {
            type: "P2P",
            quantity: 10
        };

        if (phoneNumber && phoneNumber.trim()) {
            requestBody.sender_mobile = phoneNumber.trim();
        }
        if (amount !== undefined && amount > 0) {
            // ถ้ามี amount ให้ค้นหาด้วย amount (แปลงจากบาทเป็นสตางค์)
            requestBody.amount = Math.round(amount * 100);
        }

        // ถ้าไม่มี sender_mobile ให้ใช้ parameter อื่น
        if (!requestBody.sender_mobile) {
            throw new Error('กรุณาใส่เบอร์โทรศัพท์หรือเบอร์มือถือที่จะค้นหา');
        }

        // Call API with POST method and request body
        const searchResponse = await fetch('https://apis.truemoneyservices.com/account/v1/my-receive', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            throw new Error(`True Wallet API error: ${searchResponse.status} - ${errorText}`);
        }

        const searchData = await searchResponse.json();

        return new Response(JSON.stringify({ 
            data: searchData,
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('True Wallet Transfer Search error:', error);

        const errorResponse = {
            error: {
                code: 'TRANSFER_SEARCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
