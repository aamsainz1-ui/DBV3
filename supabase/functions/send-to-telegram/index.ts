// Edge Function สำหรับส่งไฟล์ CSV ไปยัง Telegram Bot
// ใช้ Bot API ของ Telegram เพื่อส่งไฟล์แนบ

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // แยกข้อมูลจาก request body
        const requestData = await req.json();
        const { 
            telegramBotToken, 
            telegramChatId, 
            fileUrl, 
            fileName,
            message = 'ไฟล์ CSV รายงานประจำวันจาก True Wallet Dashboard'
        } = requestData;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!telegramBotToken || !telegramChatId || !fileUrl) {
            return new Response(JSON.stringify({
                error: {
                    code: 'MISSING_PARAMETERS',
                    message: 'ข้อมูลที่จำเป็น: telegramBotToken, telegramChatId, fileUrl'
                }
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log('📤 กำลังส่งไฟล์ไปยัง Telegram...');
        console.log(`   - Bot Token: ${telegramBotToken.substring(0, 8)}...`);
        console.log(`   - Chat ID: ${telegramChatId}`);
        console.log(`   - File URL: ${fileUrl}`);

        // ดาวน์โหลดไฟล์จาก Supabase Storage ก่อน
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error(`ไม่สามารถดาวน์โหลดไฟล์ได้: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        const fileBlob = await fileResponse.blob();
        const fileBuffer = await fileBlob.arrayBuffer();
        
        // สร้าง FormData สำหรับส่งไปยัง Telegram Bot API
        const formData = new FormData();
        formData.append('chat_id', telegramChatId);
        formData.append('caption', message);
        formData.append('document', new Blob([fileBuffer], { type: 'text/csv' }), fileName || 'daily-report.csv');

        // เรียกใช้ Telegram Bot API
        const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendDocument`;
        
        const telegramResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            body: formData
        });

        const telegramResult = await telegramResponse.json();

        if (!telegramResponse.ok || !telegramResult.ok) {
            console.error('❌ Telegram API Error:', telegramResult);
            throw new Error(`Telegram API Error: ${telegramResult.description || 'Unknown error'}`);
        }

        console.log('✅ ส่งไฟล์สำเร็จ!');
        console.log(`   - Message ID: ${telegramResult.result.message_id}`);
        console.log(`   - File: ${fileName || 'daily-report.csv'}`);

        // บันทึกผลการส่งลง database (ถ้าต้องการ)
        // TODO: เพิ่มการบันทึกลงในตารางสำหรับ track ประวัติการส่ง

        // ส่งผลลัพธ์กลับ
        return new Response(JSON.stringify({
            success: true,
            message: 'ส่งไฟล์ไปยัง Telegram สำเร็จ',
            data: {
                messageId: telegramResult.result.message_id,
                fileName: fileName || 'daily-report.csv',
                chatId: telegramChatId,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Edge Function Error:', error);

        const errorResponse = {
            error: {
                code: 'TELEGRAM_SEND_FAILED',
                message: error.message || 'ไม่สามารถส่งไฟล์ไปยัง Telegram ได้',
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});