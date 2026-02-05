import { useState, useEffect } from 'react';
import { SecurityService, SecurityAttempt } from '@/lib/security';

interface SecurityState {
  has2FA: boolean;
  secret2FA?: string;
  backupCodes: string[];
  loginAttempts: SecurityAttempt[];
  isLocked: boolean;
  lockUntil?: Date;
}

export const useSecurity = (userId?: string) => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    has2FA: false,
    backupCodes: [],
    loginAttempts: [],
    isLocked: false
  });
  const [loading, setLoading] = useState(true);

  // 🔥 LIMPA ESTADO QUANDO TROCA DE USUÁRIO (CRÍTICO)
  useEffect(() => {
    setSecurityState({
      has2FA: false,
      backupCodes: [],
      loginAttempts: [],
      isLocked: false
    });

    if (userId) {
      loadSecurityState(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadSecurityState = async (userId: string) => {
    try {
      setLoading(true);

      const stored = localStorage.getItem(`security_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);

        const parsedState: SecurityState = {
          ...data,
          loginAttempts: data.loginAttempts.map(
            (attempt: SecurityAttempt & { timestamp: string }) => ({
              ...attempt,
              timestamp: new Date(attempt.timestamp)
            })
          ),
          lockUntil: data.lockUntil ? new Date(data.lockUntil) : undefined
        };

        setSecurityState(parsedState);
      }

      // 🔥 SEMPRE CHECA LOCK APÓS CARREGAR
      checkLockStatus();
    } catch (error) {
      console.error('Erro ao carregar estado de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSecurityState = (newState: SecurityState) => {
    if (!userId) return;

    try {
      localStorage.setItem(`security_${userId}`, JSON.stringify(newState));
      setSecurityState(newState);
    } catch (error) {
      console.error('Erro ao salvar estado de segurança:', error);
    }
  };

  const checkLockStatus = () => {
    setSecurityState(prev => {
      if (prev.lockUntil && new Date() >= prev.lockUntil) {
        return {
          ...prev,
          isLocked: false,
          lockUntil: undefined,
          loginAttempts: []
        };
      }

      const isCurrentlyLocked = SecurityService.isAccountLocked(prev.loginAttempts);
      return {
        ...prev,
        isLocked: isCurrentlyLocked
      };
    });
  };

  const enable2FA = (secret: string, backupCodes: string[]) => {
    const newState: SecurityState = {
      ...securityState,
      has2FA: true,
      secret2FA: secret,
      backupCodes
    };

    saveSecurityState(newState);
  };

  const disable2FA = () => {
    const newState: SecurityState = {
      ...securityState,
      has2FA: false,
      secret2FA: undefined,
      backupCodes: []
    };

    saveSecurityState(newState);
  };

  const addLoginAttempt = (success: boolean, type: 'login' | '2fa' = 'login') => {
    const attempt = SecurityService.createSecurityAttempt(type, success);

    const newAttempts = [...securityState.loginAttempts, attempt];
    const recentAttempts = newAttempts.slice(-20);

    const locked = !success && SecurityService.isAccountLocked(recentAttempts);

    const newState: SecurityState = {
      ...securityState,
      loginAttempts: recentAttempts,
      isLocked: locked,
      lockUntil: locked
        ? new Date(Date.now() + 30 * 60 * 1000)
        : undefined
    };

    saveSecurityState(newState);

    return newState;
  };

  const verify2FA = (code: string, isBackupCode: boolean = false): boolean => {
    if (!securityState.has2FA || !securityState.secret2FA) {
      return false;
    }

    let isValid = false;

    if (isBackupCode) {
      isValid = securityState.backupCodes.includes(code);

      if (isValid) {
        const newBackupCodes = securityState.backupCodes.filter(c => c !== code);
        const newState: SecurityState = {
          ...securityState,
          backupCodes: newBackupCodes
        };
        saveSecurityState(newState);
      }
    } else {
      isValid = SecurityService.verifyTOTP(code, securityState.secret2FA);
    }

    addLoginAttempt(isValid, '2fa');

    return isValid;
  };

  const getFailedAttempts = (): number => {
    const now = Date.now();
    return securityState.loginAttempts.filter(attempt =>
      !attempt.success &&
      (now - attempt.timestamp.getTime()) < 30 * 60 * 1000
    ).length;
  };

  const getRemainingLockTime = (): number => {
    if (!securityState.isLocked || !securityState.lockUntil) {
      return 0;
    }

    const remaining = securityState.lockUntil.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  const resetLock = () => {
    const newState: SecurityState = {
      ...securityState,
      isLocked: false,
      lockUntil: undefined,
      loginAttempts: []
    };

    saveSecurityState(newState);
  };

  return {
    securityState,
    loading,
    enable2FA,
    disable2FA,
    verify2FA,
    addLoginAttempt,
    getFailedAttempts,
    getRemainingLockTime,
    resetLock,
    checkLockStatus
  };
};
