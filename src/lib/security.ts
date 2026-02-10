import { supabase } from "@/integrations/supabase/client";
import * as OTPAuth from "otpauth";

export interface SecurityAttempt {
  type: 'login' | '2fa';
  success: boolean;
  timestamp: Date;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

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
    const totp = new OTPAuth.TOTP({
      issuer: 'KITARA',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: new OTPAuth.Secret({ size: 20 }),
    });

    return {
      secret: totp.secret.base32,
      qrCodeUri: totp.toString(),
    };
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
    try {
      if (code.length !== 6 || !/^\d{6}$/.test(code)) return false;

      const totp = new OTPAuth.TOTP({
        issuer: 'KITARA',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      // Returns delta (number) if valid, null if invalid. Window=1 allows ±1 time step.
      const delta = totp.validate({ token: code, window: 1 });
      return delta !== null;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }
}
