import React from 'react';

export default function KPIStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trendText,
  onClick
}) {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-[#E2E8F0]',
      iconBg: 'bg-[#F4F7FB]',
      iconColor: 'text-[#142B4A]',
      valColor: 'text-[#142B4A]'
    },
    success: {
      bg: 'bg-white',
      border: 'border-[#E2E8F0] hover:border-emerald-300',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-[#16845B]',
      valColor: 'text-[#142B4A]'
    },
    warning: {
      bg: 'bg-white',
      border: 'border-[#E2E8F0] hover:border-amber-300',
      iconBg: 'bg-amber-50',
      iconColor: 'text-[#D99119]',
      valColor: 'text-[#142B4A]'
    },
    danger: {
      bg: 'bg-white',
      border: 'border-[#E2E8F0] hover:border-rose-300',
      iconBg: 'bg-rose-50',
      iconColor: 'text-[#C84444]',
      valColor: 'text-[#142B4A]'
    },
    blue: {
      bg: 'bg-white',
      border: 'border-[#E2E8F0] hover:border-blue-300',
      iconBg: 'bg-blue-50',
      iconColor: 'text-[#244B75]',
      valColor: 'text-[#142B4A]'
    },
    purple: {
      bg: 'bg-white',
      border: 'border-[#E2E8F0] hover:border-purple-300',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valColor: 'text-[#142B4A]'
    }
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 shadow-sm transition-all duration-150 ${style.bg} ${style.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7A90]">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${style.valColor}`}>
              {value}
            </span>
            {trendText && (
              <span className="text-xs font-medium text-[#6B7A90]">
                {trendText}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg ${style.iconBg} ${style.iconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#6B7A90]">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
