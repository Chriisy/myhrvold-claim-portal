
export class ValidationService {
  static validateInput(input: any, rules: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (rules.required && (!input || input === '')) {
      errors.push('Dette feltet er påkrevd');
    }
    
    if (rules.minLength && input && input.length < rules.minLength) {
      errors.push(`Minimum ${rules.minLength} tegn påkrevd`);
    }
    
    if (rules.maxLength && input && input.length > rules.maxLength) {
      errors.push(`Maksimum ${rules.maxLength} tegn tillatt`);
    }
    
    if (rules.pattern && input && !rules.pattern.test(input)) {
      errors.push('Ugyldig format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static createSecureContext(component: string, action: string) {
    return {
      component,
      action,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('session_id') || 'unknown',
      userAgent: navigator.userAgent.substring(0, 100), // Limit length
      url: window.location.pathname
    };
  }
}
