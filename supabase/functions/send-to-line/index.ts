// Edge Function สำหรับส่งแจ้งเตือนพร้อมลิงก์ไฟล์ CSV ไปยัง LINE Notify
// ใช้ LINE Notify API เพื่อส่งข้อความแจ้งเตือนพร้อมลิงก์ไฟล์

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
            lineNotifyToken, 
            fileUrl, 
            fileName,
            exportDate,
            recordCount,
            message 
        } = requestData;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!lineNotifyToken || !fileUrl) {
            return new Response(JSON.stringify({
                error: {
                    code: 'MISSING_PARAMETERS',
                    message: 'ข้อมูลที่จำเป็น: lineNotifyToken, fileUrl'
                }
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // สร้างข้อความแจ้งเตือน
        const defaultMessage = `
📊 รายงานประจำวัน True Wallet Dashboard

📅 วันที่: ${exportDate || 'ไม่ระบุ'}
📋 จำนวนรายการ: ${recordCount ? `${recordCount} รายการ` : 'ไม่ระบุ'}
📄 ไฟล์: ${fileName || 'daily-transaction.csv'}

🔗 ดาวน์โหลดไฟล์ CSV: ${fileUrl}

⏰ เวลาส่ง: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
        `.trim();

        const notifyMessage = message || defaultMessage;

        console.log('📤 กำลังส่งข้อความไปยัง LINE Notify...');
        console.log(`   - Token: ${lineNotifyToken.substring(0, 8)}...`);
        console.log(`   - Message length: ${notifyMessage.length} characters`);

        // เรียกใช้ LINE Notify API
        const formData = new URLSearchParams();
        formData.append('message', notifyMessage);

        const lineNotifyResponse = await fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${lineNotifyToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const lineResult = await lineNotifyResponse.json();

        if (lineResult.status !== 200) {
            console.error('❌ LINE Notify API Error:', lineResult);
            throw new Error(`LINE Notify API Error: ${lineResult.message || 'Unknown error'}`);
        }

        console.log('✅ ส่งข้อความสำเร็จ!');
        console.log(`   - Status: ${lineResult.status}`);
        console.log(`   - Message: ${lineResult.message}`);

        // บันทึกผลการส่งลง database (ถ้าต้องการ)
        // TODO: เพิ่มการบันทึกลงในตารางสำหรับ track ประวัติการส่ง

        // ส่งผลลัพธ์กลับ
        return new Response(JSON.stringify({
            success: true,
            message: 'ส่งข้อความไปยัง LINE Notify สำเร็จ',
            data: {
                lineStatus: lineResult.status,
                lineMessage: lineResult.message,
                exportDate: exportDate,
                fileName: fileName || 'daily-transaction.csv',
                fileUrl: fileUrl,
                recordCount: recordCount,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Edge Function Error:', error);

        const errorResponse = {
            error: {
                code: 'LINE_SEND_FAILED',
                message: error.message || 'ไม่สามารถส่งข้อความไปยัง LINE Notify ได้',
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});