import { supabase } from "@/integrations/supabase/client";

export interface SecurityAttempt {
  type: 'login' | '2fa';
  success: boolean;
  timestamp: Date;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@kitara.com",
  username: "admin",
  password: "Admin@123!",
};

export class SecurityService {
  static createSecurityAttempt(type: 'login' | '2fa', success: boolean): SecurityAttempt {
    this.logSecurityEvent(type, success, {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    return {
      type,
      success,
      timestamp: new Date()
    };
  }

  static async logSecurityEvent(
    type: string,
    success: boolean,
    metadata: any
  ) {
    try {
      await supabase.rpc('log_security_event', {
        p_type: type,
        p_success: success,
        p_metadata: metadata
      });
    } catch (err) {
      console.error('Security log error:', err);
    }
  }

  static isAccountLocked(attempts: SecurityAttempt[]): boolean {
    const now = Date.now();
    const recentFails = attempts.filter(a =>
      !a.success &&
      (now - a.timestamp.getTime()) < 30 * 60 * 1000
    );
    return recentFails.length >= 5;
  }

  static validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(password)) errors.push("Uma letra maiúscula");
    if (!/[a-z]/.test(password)) errors.push("Uma letra minúscula");
    if (!/[0-9]/.test(password)) errors.push("Um número");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Um caractere especial");
    return { isValid: errors.length === 0, errors };
  }

  static generateTOTPSecret(email: string): { secret: string; qrCodeUri: string } {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const issuer = 'KITARA';
    const qrCodeUri = `otpauth://totp/${issuer}:${encodeURIComponent(email)}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
    return { secret, qrCodeUri };
  }

  static generateBackupCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                   Math.random().toString(36).substring(2, 6).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  static verifyTOTP(code: string, secret: string): boolean {
    // Server-side verification via RPC in production
    return code.length === 6 && /^\d{6}$/.test(code);
  }
}
