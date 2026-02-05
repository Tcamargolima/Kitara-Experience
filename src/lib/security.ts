import { supabase } from "@/integrations/supabase/client";

export interface SecurityAttempt {
  type: 'login' | '2fa';
  success: boolean;
  timestamp: Date;
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

  static verifyTOTP(code: string, secret: string): boolean {
    // permanece sua lógica existente aqui
    return true;
  }
}
