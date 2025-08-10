import type { Transform } from './transforms';

export interface TransformCache {
  x: number;
  y: number;
  scale: number;
}

export interface PanzoomOptions {
  maxScale?: number;
  minScale?: number;
  step?: number;
  animate?: boolean;
  duration?: number;
  onStart?: () => void;
  setTransform?: (elem: SVGGElement, transform: Transform) => void;
}

export interface PanzoomInstance {
  instance: any;
  destroy: () => void;
  setTransform: (x: number, y: number, scale: number, animate?: boolean) => void;
}

let Panzoom: any;

export async function initPanzoom(
  group: SVGGElement,
  options: PanzoomOptions = {}
): Promise<PanzoomInstance> {
  // Dynamic import to avoid SSR issues
  if (typeof window !== 'undefined' && !Panzoom) {
    const panzoomModule = await import('@panzoom/panzoom');
    Panzoom = panzoomModule.default;
  }

  const {
    maxScale = 3,
    minScale = 0.5,
    step = 0.2,
    animate = true,
    duration = 180,
    onStart,
    setTransform
  } = options;

  // Create transform cache
  const cache: TransformCache = { x: 0, y: 0, scale: 1 };

  const pz = Panzoom(group, {
    maxScale,
    minScale,
    step,
    animate,
    duration,
    setTransform: (elem: SVGGElement, { x, y, scale }: Transform) => {
      cache.x = x;
      cache.y = y;
      cache.scale = scale;
      if (setTransform) {
        setTransform(elem, { x, y, scale });
      } else {
        elem.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
      }
    }
  });

  // Mark interaction on any gesture start
  if (onStart) {
    group.addEventListener('panzoomstart', onStart, { passive: true });
  }

  // Make the surface capture touch gestures
  const svgElement = group.closest('svg');
  if (svgElement) {
    svgElement.style.touchAction = 'none';
    (svgElement.style as any)['overscrollBehavior'] = 'contain';
  }

  // Micro-perf: smoother transforms
  (group.style as any).willChange = 'transform';

  return {
    instance: pz,
    destroy: () => {
      if (pz) {
        pz.destroy();
      }
      if (onStart) {
        group.removeEventListener('panzoomstart', onStart);
      }
    },
    setTransform: (x: number, y: number, scale: number, animate = false) => {
      cache.x = x;
      cache.y = y;
      cache.scale = scale;
      if (pz) {
        try {
          pz.zoom(scale, { animate });
          pz.pan(x, y, { animate });
        } catch {
          group.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
        }
      } else {
        group.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
      }
    }
  };
}
