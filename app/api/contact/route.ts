import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Rate limit by IP to prevent spam
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(`contact:${ip}`, { maxRequests: 3, windowMs: 60 * 60 * 1000 }); // 3 per hour
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Store message in database
    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      });

    if (dbError) {
      console.error("Failed to save contact message:", dbError);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    // Optional: Send email notification using Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Mi Arcade <noreply@miarcade.me>",
            to: "audio.innovative@gmail.com",
            subject: `[Mi Arcade Contact] ${subject}`,
            html: `
              <h2>New Contact Message</h2>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <hr />
              <p>${message.replace(/\n/g, "<br />")}</p>
            `,
          }),
        });
      } catch (emailError) {
        // Log but don't fail - message is saved in DB
        console.error("Failed to send email notification:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
