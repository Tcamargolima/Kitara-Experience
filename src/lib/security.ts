import bcrypt from 'bcryptjs';
import { TOTP } from 'otpauth';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface SecurityAttempt {
  type: 'login' | '2fa';
  success: boolean;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export class SecurityService {
  /**
   * Valida se a senha atende aos critérios de segurança
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Senha deve ter no mínimo 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um símbolo especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Hash da senha com bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se a senha corresponde ao hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gera chave secreta para TOTP
   */
  static generateTOTPSecret(userEmail: string): { secret: string; qrCodeUri: string } {
    const totp = new TOTP({
      issuer: 'KITARA',
      label: userEmail,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    return {
      secret: totp.secret.base32,
      qrCodeUri: totp.toString()
    };
  }

  /**
   * Verifica código TOTP
   */
  static verifyTOTP(token: string, secret: string): boolean {
    const totp = new TOTP({
      secret: secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Verifica token atual e permite janela de ±1 período (90 segundos total)
    const window = 1;
    const currentTime = Date.now();
    
    for (let i = -window; i <= window; i++) {
      const time = Math.floor(currentTime / 1000) + (i * 30);
      if (totp.generate({ timestamp: time * 1000 }) === token) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Gera códigos de backup
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      // Formato: XXXX-XXXX
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    
    return codes;
  }

  /**
   * Verifica se a conta está bloqueada
   */
  static isAccountLocked(attempts: SecurityAttempt[], maxAttempts: number = 5, lockDurationMs: number = 30 * 60 * 1000): boolean {
    const now = Date.now();
    const recentFailedAttempts = attempts.filter(attempt => 
      !attempt.success && 
      (now - attempt.timestamp.getTime()) < lockDurationMs
    );
    
    return recentFailedAttempts.length >= maxAttempts;
  }

  /**
   * Registra tentativa de login/2FA
   */
  static createSecurityAttempt(type: 'login' | '2fa', success: boolean): SecurityAttempt {
    return {
      type,
      success,
      timestamp: new Date(),
      ip: 'unknown', // Em produção, capturar IP real
      userAgent: navigator.userAgent
    };
  }
}

// Credenciais padrão do admin
export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Circense@0101',
  email: 'admin@moskino.circo'
};