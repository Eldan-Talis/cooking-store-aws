import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded shadow ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b px-4 py-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold">{children}</h2>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-t px-4 py-2 ${className}`}>{children}</div>;
}
