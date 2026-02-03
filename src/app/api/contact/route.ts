import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // 验证必填字段
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // 获取环境变量中的接收邮箱
    const recipientEmail = process.env.CONTACT_EMAIL || 'jackyzeng1234@gmail.com';

    // 使用 Resend 发送邮件
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      // 如果没有配置 API key，返回成功但记录日志（用于开发环境）
      console.log('Contact form submission:', { name, email, subject, message });
      return NextResponse.json({
        success: true,
        message: 'Message received (development mode)'
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ReflexX Contact <onboarding@resend.dev>',
        to: [recipientEmail],
        reply_to: email,
        subject: `[ReflexX Contact] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  <a href="mailto:${email}">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Subject:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Message:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${message.replace(/\n/g, '<br>')}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>Reply to this email to respond to the user.</strong></p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error details:', errorText);
      console.error('Response status:', response.status, response.statusText);
      throw new Error(`Resend API error: ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
