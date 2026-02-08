import { useState, useEffect } from 'react';
import { SecurityService, SecurityAttempt } from '@/lib/security';

interface SecurityState {
  has2FA: boolean;
  secret2FA?: string;
  backupCodes: string[];
  loginAttempts: SecurityAttempt[];
  isLocked: boolean;
  lockUntil?: Date;
  users?: Array<{ user: string; has2FA: boolean; lastLogin: Date; attempts: number; status: string }>;
  logs?: Array<{ id: string; user: string; event: string; timestamp: Date; ip: string; device: string; status: string }>;
}

export const useSecurity = (userId?: string) => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    has2FA: false,
    backupCodes: [],
    loginAttempts: [],
    isLocked: false,
    users: [
      { user: 'admin@moskino.circo', has2FA: true, lastLogin: new Date(), attempts: 0, status: 'active' },
      { user: 'cliente1@email.com', has2FA: false, lastLogin: new Date(Date.now() - 60 * 60 * 1000), attempts: 3, status: 'warning' },
      { user: 'cliente2@email.com', has2FA: false, lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), attempts: 5, status: 'locked' }
    ],
    logs: [
      {
        id: '1',
        user: 'admin@moskino.circo',
        event: 'Login successful',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        ip: '192.168.1.100',
        device: 'Chrome/Linux',
        status: 'success'
      },
      {
        id: '2',
        user: 'cliente1@email.com',
        event: '2FA verification failed',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        ip: '10.0.0.50',
        device: 'Safari/iOS',
        status: 'failed'
      },
      {
        id: '3',
        user: 'cliente2@email.com',
        event: 'Account locked',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        ip: '203.45.67.89',
        device: 'Firefox/Windows',
        status: 'blocked'
      },
      {
        id: '4',
        user: 'admin@moskino.circo',
        event: '2FA enabled',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ip: '192.168.1.100',
        device: 'Chrome/Linux',
        status: 'config'
      }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSecurityState(userId);
    }
  }, [userId]);

  const loadSecurityState = async (userId: string) => {
    try {
      setLoading(true);
      
      const stored = localStorage.getItem(`security_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        setSecurityState({
          ...data,
          loginAttempts: data.loginAttempts.map((attempt: SecurityAttempt & { timestamp: string }) => ({
            ...attempt,
            timestamp: new Date(attempt.timestamp)
          })),
          lockUntil: data.lockUntil ? new Date(data.lockUntil) : undefined
        });
      }
      
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
    
    const newState: SecurityState = {
      ...securityState,
      loginAttempts: recentAttempts,
      isLocked: !success && SecurityService.isAccountLocked(recentAttempts),
      lockUntil: !success && SecurityService.isAccountLocked(recentAttempts) 
        ? new Date(Date.now() + 30 * 60 * 1000)
        : securityState.lockUntil
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
    const recentFailed = securityState.loginAttempts.filter(attempt => 
      !attempt.success && 
      (now - attempt.timestamp.getTime()) < 30 * 60 * 1000
    );
    
    return recentFailed.length;
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
