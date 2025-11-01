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
        const requestData = await req.json();
        const { 
            phoneNumber, 
            amount, 
            transactionId, 
            transactionTime, 
            description = '',
            sourceType = 'transfer_search' 
        } = requestData;

        // Validate required fields
        if (!phoneNumber || !amount || !transactionId) {
            throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        // Get Supabase configuration from environment
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing');
        }

        // Check if transaction_id already exists to avoid duplicate entries
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/transaction_history?transaction_id=eq.${transactionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            throw new Error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลเดิม');
        }

        const existingTransactions = await checkResponse.json();
        
        if (existingTransactions && existingTransactions.length > 0) {
            console.log('Transaction already exists:', transactionId);
            return new Response(JSON.stringify({ 
                success: true,
                message: 'ข้อมูลรายการนี้มีอยู่ในระบบแล้ว',
                data: {
                    transactionId,
                    phoneNumber,
                    amount,
                    alreadyExists: true
                },
                timestamp: new Date().toISOString()
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Parse transaction time
        const transactionDateTime = new Date(transactionTime || new Date().toISOString());
        const transactionDate = transactionDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const transactionTimeStr = transactionDateTime.toTimeString().split(' ')[0]; // HH:MM:SS

        // Validate and process amount (received in Baht from TrueWalletService after conversion)
        const amountInBaht = parseFloat(amount);
        if (isNaN(amountInBaht) || amountInBaht < 0) {
            throw new Error('จำนวนเงินไม่ถูกต้อง');
        }
        
        // Store in Baht format (amount is already converted from satang to baht)
        const insertData = {
            transaction_date: transactionDate,
            transaction_time: transactionTimeStr,
            phone_number: phoneNumber,
            amount: amountInBaht.toFixed(2), // Store as Baht with 2 decimal places (40.00, 30.00)
            transaction_id: transactionId,
            status: 'completed',
            description: description,
            source_type: sourceType
        };

        // Insert into transaction_history table
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/transaction_history`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(insertData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('Database insert error:', errorText);
            throw new Error(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${insertResponse.status}`);
        }

        console.log('Transaction saved successfully:', {
            phoneNumber,
            amount,
            transactionId,
            transactionDate,
            transactionTime: transactionTimeStr
        });

        return new Response(JSON.stringify({ 
            success: true,
            message: 'บันทึกประวัติรายการรับเงินเรียบร้อยแล้ว',
            data: {
                transactionId,
                phoneNumber,
                amount,
                transactionDate,
                transactionTime: transactionTimeStr
            },
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Save transaction history error:', error);

        const errorResponse = {
            error: {
                code: 'SAVE_TRANSACTION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});