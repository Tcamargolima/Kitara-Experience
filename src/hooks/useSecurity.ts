import { useState, useEffect } from 'react';
import { SecurityService, SecurityAttempt } from '@/lib/security';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    if (userId) {
      loadSecurityState(userId);
    }
  }, [userId]);

  const loadSecurityState = async (userId: string) => {
    try {
      setLoading(true);
      
      // Em produção, buscar dados da base de dados
      // Por enquanto, usando localStorage para demonstração
      const stored = localStorage.getItem(`security_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        setSecurityState({
          ...data,
          loginAttempts: data.loginAttempts.map((attempt: any) => ({
            ...attempt,
            timestamp: new Date(attempt.timestamp)
          })),
          lockUntil: data.lockUntil ? new Date(data.lockUntil) : undefined
        });
      }
      
      // Verificar se ainda está bloqueado
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
          loginAttempts: [] // Limpar tentativas após desbloqueio
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
    
    // Em produção, salvar na base de dados
    if (userId) {
      supabase
        .from('profiles')
        .update({
          device_info: {
            ...((securityState as any).device_info || {}),
            has_2fa: true,
            totp_secret: secret,
            backup_codes: backupCodes
          }
        })
        .eq('user_id', userId)
        .then(() => {
          console.log('2FA salvo na base de dados');
        });
    }
  };

  const disable2FA = () => {
    const newState: SecurityState = {
      ...securityState,
      has2FA: false,
      secret2FA: undefined,
      backupCodes: []
    };
    
    saveSecurityState(newState);
    
    // Em produção, atualizar na base de dados
    if (userId) {
      supabase
        .from('profiles')
        .update({
          device_info: {
            ...((securityState as any).device_info || {}),
            has_2fa: false,
            totp_secret: null,
            backup_codes: []
          }
        })
        .eq('user_id', userId)
        .then(() => {
          console.log('2FA removido da base de dados');
        });
    }
  };

  const addLoginAttempt = (success: boolean, type: 'login' | '2fa' = 'login') => {
    const attempt = SecurityService.createSecurityAttempt(type, success);
    
    const newAttempts = [...securityState.loginAttempts, attempt];
    
    // Manter apenas últimas 20 tentativas
    const recentAttempts = newAttempts.slice(-20);
    
    const newState: SecurityState = {
      ...securityState,
      loginAttempts: recentAttempts,
      isLocked: !success && SecurityService.isAccountLocked(recentAttempts),
      lockUntil: !success && SecurityService.isAccountLocked(recentAttempts) 
        ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
        : securityState.lockUntil
    };
    
    saveSecurityState(newState);
    
    // Em produção, salvar tentativa na tabela secure_access_logs
    if (userId) {
      supabase
        .from('secure_access_logs')
        .insert({
          user_id: userId,
          event_type: `${type}_attempt`,
          timestamp: attempt.timestamp.toISOString(),
          device_fingerprint: attempt.userAgent,
          encrypted_data: JSON.stringify({
            success,
            type,
            ip: attempt.ip
          })
        })
        .then(() => {
          console.log('Tentativa de login registrada');
        });
    }
    
    return newState;
  };

  const verify2FA = (code: string, isBackupCode: boolean = false): boolean => {
    if (!securityState.has2FA || !securityState.secret2FA) {
      return false;
    }
    
    let isValid = false;
    
    if (isBackupCode) {
      // Verificar se é um código de backup válido
      isValid = securityState.backupCodes.includes(code);
      
      if (isValid) {
        // Remover código de backup usado
        const newBackupCodes = securityState.backupCodes.filter(c => c !== code);
        const newState: SecurityState = {
          ...securityState,
          backupCodes: newBackupCodes
        };
        saveSecurityState(newState);
      }
    } else {
      // Verificar TOTP
      isValid = SecurityService.verifyTOTP(code, securityState.secret2FA);
    }
    
    // Registrar tentativa
    addLoginAttempt(isValid, '2fa');
    
    return isValid;
  };

  const getFailedAttempts = (): number => {
    const now = Date.now();
    const recentFailed = securityState.loginAttempts.filter(attempt => 
      !attempt.success && 
      (now - attempt.timestamp.getTime()) < 30 * 60 * 1000 // Últimos 30 minutos
    );
    
    return recentFailed.length;
  };

  const getRemainingLockTime = (): number => {
    if (!securityState.isLocked || !securityState.lockUntil) {
      return 0;
    }
    
    const remaining = securityState.lockUntil.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // Segundos
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