/**
 * Security & Privacy helper utilities.
 * Includes real-time input masking and client-side prompt-injection checks.
 */

/**
 * Formats Aadhaar Card digits into a masked pattern: ****-****-1234
 * @param {string} val 
 */
export const maskAadhaar = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  
  if (digits.length === 0) return "";
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) {
    return `****-${digits.slice(4)}`;
  }
  return `****-****-${digits.slice(8)}`;
};

/**
 * Formats Mobile Number into a masked pattern: ******5678
 * @param {string} val 
 */
export const maskMobile = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 4) return digits;
  return `******${digits.slice(-4)}`;
};

/**
 * Sanitizes input text against typical prompt injection patterns (system prompts overrides)
 * and strips HTML script tags.
 * @param {string} text 
 * @returns {{cleanedText: string, flagged: boolean}}
 */
export const sanitizeInput = (text) => {
  if (!text) return { cleanedText: "", flagged: false };
  
  let flagged = false;
  let cleanedText = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, ''); // remove scripts
  cleanedText = cleanedText.replace(/<\/?[^>]+(>|$)/g, ""); // strip general HTML tags
  
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /system\s+(override|prompt|instructions)/gi,
    /forget\s+what\s+you\s+were\s+told/gi,
    /you\s+are\s+now\s+an\s+unrestricted/gi,
    /bypass\s+all\s+safeguards/gi,
    /Developer\s+Mode\s+v2/gi
  ];
  
  injectionPatterns.forEach(pattern => {
    if (pattern.test(cleanedText)) {
      flagged = true;
      cleanedText = cleanedText.replace(pattern, "[redacted: override instruction attempt]");
    }
  });
  
  return { cleanedText, flagged };
};
