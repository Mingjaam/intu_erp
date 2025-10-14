'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordValidatorProps {
  password: string;
}

interface ValidationRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    id: 'length',
    label: '8자 이상',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: '대문자 포함',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'special',
    label: '특수문자 포함',
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

export function PasswordValidator({ password }: PasswordValidatorProps) {
  return (
    <div className="mt-2 space-y-1">
      {validationRules.map((rule) => {
        const isValid = rule.test(password);
        return (
          <div
            key={rule.id}
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
              isValid ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {isValid ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-gray-400" />
            )}
            <span>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}
