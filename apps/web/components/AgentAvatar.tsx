import { cn } from '@/lib/cn';

type Status = 'idle' | 'running' | 'blocked' | 'waiting' | 'done';

export function AgentAvatar({
  src,
  alt,
  status = 'idle',
  size = 36,
  className,
}: Readonly<{
  src?: string | null;
  alt: string;
  status?: Status;
  size?: number;
  className?: string;
}>) {
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full status-ring surface', className)}
      data-status={status}
      style={{ width: size, height: size }}
      aria-label={alt}
      title={alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size * 0.65} height={size * 0.65} style={{ color: 'var(--text-primary)' }} />
      ) : (
        <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
          {alt.slice(0, 2)}
        </span>
      )}
    </span>
  );
}
