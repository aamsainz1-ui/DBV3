const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log('=== Daily Income Summary Edge Function ===');
    console.log('🕒 เริ่มต้นระบบ:', new Date().toISOString());
    
    // ตรวจสอบ environment variables
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is not set');
    }
    if (!supabaseKey) {
      throw new Error('SUPABASE_ANON_KEY environment variable is not set');
    }

    console.log('✅ ตรวจสอบการตั้งค่า environment สำเร็จ');
    console.log('🔗 Supabase URL:', supabaseUrl);
    console.log('🔑 Supabase Key (masked):', supabaseKey.substring(0, 10) + '...');

    // สร้างช่วงวันที่ 7 วันล่าสุด (26 ต.ค. - 1 พ.ย. 2025)
    const dates = [
      '2025-10-26',
      '2025-10-27',
      '2025-10-28',
      '2025-10-29',
      '2025-10-30',
      '2025-10-31',
      '2025-11-01'
    ];

    console.log('วันที่ที่ต้องดึงข้อมูล:', dates);
    console.log('วันแรก:', dates[0], '| วันสุดท้าย:', dates[dates.length - 1]);

    // ดึงข้อมูลธุรกรรมทั้งหมดในช่วง 7 วัน จาก transaction_history table (เพิ่ม limit เป็น 1000 เพื่อให้ครบถ้วน)
    const query = `select=transaction_date,amount,source_type&transaction_date=gte.${dates[0]}&transaction_date=lte.${dates[dates.length - 1]}&source_type=eq.recent_transactions&order=transaction_date.asc&limit=1000`;

    const response = await fetch(`${supabaseUrl}/rest/v1/transaction_history?${query}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorCode = `API_ERROR_${response.status}`;
      console.error(`❌ เกิดข้อผิดพลาด API: ${response.status} - ${response.statusText}`);
      
      const errorResponse = {
        success: false,
        statusCode: response.status,
        errorCode: errorCode,
        message: `การเชื่อมต่อฐานข้อมูลล้มเหลว`,
        details: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(errorResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      });
    }

    const transactions = await response.json();

    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');
    console.log('📊 จำนวนธุรกรรมที่ดึงได้:', transactions?.length || 0);
    
    // สร้างข้อมูลสรุปรายวัน
    const dailySummary = dates.map(dateStr => {
      // หาธุรกรรมทั้งหมดในวันนั้นจาก transaction_history
      const dayTransactions = transactions?.filter(t => t.transaction_date === dateStr) || [];
      
      // คำนวณยอดรวมและจำนวนรายการ
      const totalIncome = dayTransactions.reduce((sum, t) => {
        const amount = parseFloat(t.amount) || 0;
        return sum + amount;
      }, 0);
      
      const transactionCount = dayTransactions.length;
      
      // สร้าง label วันที่ภาษาไทย
      const dateObj = new Date(dateStr + 'T00:00:00+07:00');
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const monthName = month === 10 ? 'ต.ค.' : 'พ.ย.';
      const dateLabel = `${day} ${monthName}`;
      
      console.log(`📅 ${dateStr} (${dateLabel}): ฿${totalIncome.toFixed(2)}, ${transactionCount} รายการ`);
      
      return {
        date: dateStr,
        dateLabel: dateLabel,
        dailyIncome: totalIncome,
        transactionCount: transactionCount
      };
    });

    console.log('\n=== สรุปข้อมูล 7 วัน ===');
    console.log('📋 จำนวนวันทั้งหมด:', dailySummary.length);
    dailySummary.forEach((d, idx) => {
      console.log(`✅ [${idx + 1}] ${d.dateLabel}: ฿${d.dailyIncome.toFixed(2)} (${d.transactionCount} รายการ)`);
    });

    const result = {
      success: true,
      statusCode: 200,
      errorCode: null,
      message: `ดึงข้อมูลรายรับรายวันสำเร็จ`,
      data: dailySummary,
      summary: {
        totalDays: dailySummary.length,
        totalIncome: dailySummary.reduce((sum, d) => sum + d.dailyIncome, 0),
        totalTransactions: dailySummary.reduce((sum, d) => sum + d.transactionCount, 0)
      },
      timestamp: new Date().toISOString()
    };

    console.log('\n🎉 ส่งข้อมูลสำเร็จ - Status: 200');
    console.log(`💰 ยอดรวม 7 วัน: ฿${result.summary.totalIncome.toFixed(2)}`);
    console.log(`📝 จำนวนธุรกรรมทั้งหมด: ${result.summary.totalTransactions} รายการ\n`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาดในระบบ:', error);
    
    // จำแนกประเภทของ error
    let errorCode = 'INTERNAL_ERROR';
    let statusCode = 500;
    let errorMessage = 'เกิดข้อผิดพลาดภายในระบบ';
    
    if (error.message?.includes('SUPABASE_URL')) {
      errorCode = 'CONFIG_MISSING_URL';
      errorMessage = 'ไม่พบการตั้งค่า SUPABASE_URL';
    } else if (error.message?.includes('SUPABASE_ANON_KEY')) {
      errorCode = 'CONFIG_MISSING_KEY';
      errorMessage = 'ไม่พบการตั้งค่า SUPABASE_ANON_KEY';
    } else if (error.message?.includes('fetch')) {
      errorCode = 'NETWORK_ERROR';
      statusCode = 503;
      errorMessage = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้';
    } else if (error.message?.includes('JSON')) {
      errorCode = 'PARSE_ERROR';
      errorMessage = 'ข้อมูลที่ได้รับไม่สามารถประมวลผลได้';
    }
    
    const errorResponse = {
      success: false,
      statusCode: statusCode,
      errorCode: errorCode,
      message: errorMessage,
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      debugInfo: {
        functionName: 'daily-income-summary',
        environment: Deno.env.get('DENO_DEPLOYMENT_ID') ? 'production' : 'development'
      }
    };

    console.error(`🚨 Error Details: Code=${errorCode}, Status=${statusCode}`);
    console.error(`📝 Error Message: ${errorMessage}\n`);

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    });
  }
});