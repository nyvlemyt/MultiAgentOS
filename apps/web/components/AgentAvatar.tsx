import { Map, Compass, Brain, Shield, Search, PenTool, Sparkles, Wrench, FlaskConical, Cpu } from 'lucide-react';
import { cn } from '@/lib/cn';
import { agentVisual, type GlyphKey } from '@/lib/agent-visual';

type Status = 'idle' | 'running' | 'blocked' | 'waiting' | 'done';

const GLYPHS: Record<GlyphKey, typeof Cpu> = {
  map: Map, compass: Compass, brain: Brain, shield: Shield, search: Search,
  pen: PenTool, sparkles: Sparkles, wrench: Wrench, flask: FlaskConical, cpu: Cpu,
};

export function AgentAvatar({
  src,
  alt,
  role,
  status = 'idle',
  size = 36,
  className,
}: Readonly<{
  src?: string | null;
  alt: string;
  role?: string;
  status?: Status;
  size?: number;
  className?: string;
}>) {
  const { hue, glyph } = agentVisual(alt, role);
  const Glyph = GLYPHS[glyph];
  return (
    <span
      className={cn('relative inline-flex items-center justify-center rounded-full status-ring', className)}
      data-status={status}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, hsl(${hue} 90% 22%), hsl(${hue} 80% 8%))`,
      }}
      aria-label={alt}
      title={alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size * 0.6} height={size * 0.6} />
      ) : (
        <Glyph size={size * 0.5} strokeWidth={1.75} style={{ color: `hsl(${hue} 95% 72%)` }} aria-hidden />
      )}
    </span>
  );
}
