import { action } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get Resend client
async function getResendClient() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    console.log("RESEND_API_KEY status:", apiKey ? "exists" : "missing");
    console.log("RESEND_API_KEY value:", apiKey?.substring(0, 10) + "...");
    
    if (!apiKey || apiKey === "your_resend_api_key_here") {
      console.log("Resend API key not configured - emails will be logged to console");
      return null;
    }
    
    // Dynamic import to avoid bundling issues
    const { Resend } = await import("resend");
    console.log("Resend imported successfully");
    const client = new Resend(apiKey);
    console.log("Resend client created successfully");
    return client;
  } catch (error) {
    console.log("Resend not available - emails will be logged to console", error);
    return null;
  }
}

// Send confirmation email
export const sendConfirmationEmail = action({
  args: {
    // Make optional so test flows can call this action without a DB id
    submissionId: v.optional(v.id("waitlistSubmissions")),
    email: v.string(),
    name: v.string(),
    position: v.number(),
    eta: v.string(),
  },
  handler: async (ctx, args) => {
    "use node";
    console.log("Starting confirmation email send...");
    console.log("Email args:", { email: args.email, name: args.name, position: args.position });
    
    try {
      const resend = await getResendClient();
      console.log("Resend client:", resend ? "available" : "not available");
      
      if (!resend) {
        console.log(`Confirmation email would be sent to ${args.email}: Welcome to AppGenerator Waitlist! Position #${args.position}, ETA ${args.eta}`);
        return { success: true, emailId: "mock-id" };
      }
      
      console.log("Attempting to send email...");
      const { data, error } = await resend.emails.send({
        from: "AppGenerator <onboarding@resend.dev>",
        to: [args.email],
        subject: "Welcome to AppGenerator Waitlist! 🚀",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to AppGenerator, ${args.name}!</h1>
            
            <p>Thank you for joining our waitlist. We're excited to help you bring your app idea to life!</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Your Waitlist Details</h3>
              <p><strong>Position:</strong> #${args.position}</p>
              <p><strong>Estimated delivery:</strong> ${args.eta}</p>
              <p><strong>Your app idea:</strong> We'll review your submission and get back to you soon!</p>
            </div>
            
            <p>We'll keep you updated on your progress and notify you when we're ready to start working on your app.</p>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              The AppGenerator Team
            </p>
          </div>
        `,
      });

      console.log("Email send result:", { data, error });

      if (error) {
        console.error("Email send error:", error);
        return { success: false, error: error.message };
      }

      console.log("Confirmation email sent successfully:", data);
      return { success: true, emailId: data.id };
    } catch (error: any) {
      console.error("Failed to send confirmation email:", error);
      return { success: false, error: error.message };
    }
  },
});

// Send completion email
export const sendCompletionEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
    appUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";
    try {
      const { email, name, appUrl } = args;
      const resend = await getResendClient();
      
      if (!resend) {
        console.log(
          appUrl
            ? `Completion email would be sent to ${email}: Your app is ready! Access at ${appUrl}`
            : `Completion email would be sent to ${email}: Your app is ready!`
        );
        return { success: true, emailId: "mock-id" };
      }
      
      const { data, error } = await resend.emails.send({
        from: "AppGenerator <onboarding@resend.dev>",
        to: [email],
        subject: "Your app is ready! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Congratulations ${name}! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #666;">
              Your app is ready!${appUrl ? " You can access it at:" : ""}
            </p>
            ${appUrl ? `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${appUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Access Your App
              </a>
            </div>
            ` : ""}
            <p style="font-size: 14px; color: #999;">
              Thank you for using AppGenerator! If you need any help, don't hesitate to contact our support team.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("Email send error:", error);
        return { success: false, error: error.message };
      }

      console.log("Completion email sent:", data);
      return { success: true, emailId: data.id };
    } catch (error: any) {
      console.error("Failed to send completion email:", error);
      return { success: false, error: error.message };
    }
  },
});

export const sendOwnerNotificationEmail = action({
  args: {
    name: v.string(),
    email: v.string(),
    appIdea: v.string(),
  },
  handler: async (ctx, args) => {
    "use node";
    try {
      const resend = await getResendClient();
      const to = "alislim007km@gmail.com";

      if (!resend) {
        console.log(
          `Owner notification would be sent to ${to}: ${args.name} <${args.email}> | App Idea: ${args.appIdea}`
        );
        return { success: true, emailId: "mock-id" };
      }

      const { data, error } = await resend.emails.send({
        from: "AppGenerator <onboarding@resend.dev>",
        to: [to],
        subject: `New waitlist submission: ${args.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
            <h2 style="color: #333;">New Waitlist Submission</h2>
            <p><strong>Name:</strong> ${args.name}</p>
            <p><strong>Email:</strong> ${args.email}</p>
            <div style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; margin-top: 12px;">
              <p style="margin: 0 0 6px; color: #555;"><strong>App Idea:</strong></p>
              <p style="white-space: pre-wrap; color: #111;">${args.appIdea}</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Owner email send error:", error);
        return { success: false, error: error.message };
      }

      console.log("Owner notification email sent:", data);
      return { success: true, emailId: data.id };
    } catch (error: any) {
      console.error("Failed to send owner notification email:", error);
      return { success: false, error: error.message };
    }
  },
});