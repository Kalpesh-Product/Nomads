import NomadUser from "../models/NomadUser.js";
import { sendMail } from "../config/mailer.js";
import { renderNotificationEmail } from "./emailTemplates.js";
import { CONTRIBUTOR_ROLE_OPTIONS } from "./contributorRoles.js";

const escapeHtml = (value) => String(value || "there")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const buildContributorActivationEmail = (user) => ({
  to: user.email,
  subject: "Your WONO Contributions Access Is Activated!",
  text: `Hello ${user.fullName || "there"},\n\nYour Contributions access has been activated! You can now find Contributions in your account sidebar and start contributing in the categories approved for you.\n\nOpen Contributions: https://www.wono.co/contributions`,
  html: renderNotificationEmail({
    heroTitle: "Contributions Activated!",
    heroSubtitle: "Your contributor access is now active.",
    greetingHtml: `
      <p style="margin:0 0 4px;">Hello ${escapeHtml(user.fullName)},</p>
      <p class="email-text" style="margin:0;">Your Contributions access has been activated!</p>
      <p class="email-text" style="margin:12px 0 0;">You can now find <b>Contributions</b> in your account sidebar and start contributing in the categories approved for you.</p>
      <p class="email-text" style="margin:12px 0 0;">Thank you for helping build the WONO Nomad community.</p>
    `,
    ctaButton: { label: "Open Contributions &#8594;", href: "https://www.wono.co/contributions" },
  }),
});

export const notifyFirstContributorActivation = async (user, deliver = sendMail) => {
  if (!user?.email) return false;
  const claimedAt = new Date();
  // Atomically reserve the first email across tabs, duplicate leads and requests.
  // A null match also includes older accounts where this field does not exist.
  const claimed = await NomadUser.findOneAndUpdate({
    _id: user._id,
    contributionsActivationEmailSentAt: null,
    $or: Object.keys(CONTRIBUTOR_ROLE_OPTIONS).map((role) => ({ [role]: true })),
  }, { $set: { contributionsActivationEmailSentAt: claimedAt } }, { new: true })
    .select("fullName email").lean();
  if (!claimed) return false;

  try {
    await deliver(buildContributorActivationEmail(claimed));
    return true;
  } catch (error) {
    // Preserve approval but allow a later activation request to retry failed mail.
    await NomadUser.updateOne({ _id: user._id, contributionsActivationEmailSentAt: claimedAt },
      { $set: { contributionsActivationEmailSentAt: null } });
    throw error;
  }
};
