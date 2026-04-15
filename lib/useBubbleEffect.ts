import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useBubbleEffect(buttonRef: React.RefObject<HTMLButtonElement>) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    
    // Find or create bubble container
    let bubbleContainer = button.querySelector('.bubble-effect-container') as HTMLElement;
    if (!bubbleContainer) {
      bubbleContainer = document.createElement('div');
      bubbleContainer.className = 'bubble-effect-container';
      button.appendChild(bubbleContainer);
      
      // Create circles
      const topLeft = document.createElement('div');
      topLeft.className = 'circle top-left';
      bubbleContainer.appendChild(topLeft);
      
      const topLeftCircles = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      topLeftCircles.forEach(circle => {
        circle.className = 'circle-dot';
        topLeft.appendChild(circle);
      });

      const bottomRight = document.createElement('div');
      bottomRight.className = 'circle bottom-right';
      bubbleContainer.appendChild(bottomRight);

      const bottomRightCircles = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      bottomRightCircles.forEach(circle => {
        circle.className = 'circle-dot';
        bottomRight.appendChild(circle);
      });
    }

    const circlesTopLeft = bubbleContainer.querySelectorAll('.top-left .circle-dot');
    const circlesBottomRight = bubbleContainer.querySelectorAll('.bottom-right .circle-dot');

    const tl = gsap.timeline();
    const tl2 = gsap.timeline();
    const btTl = gsap.timeline({ paused: true });

    // Top-left animation
    tl.to(circlesTopLeft, 1.2, { 
      x: -25, 
      y: -25, 
      scaleY: 2, 
      ease: 'power1.inOut' 
    }, 0);
    tl.to(circlesTopLeft[0], 0.1, { scale: 0.2, x: '+=6', y: '-=2' });
    tl.to(circlesTopLeft[1], 0.1, { scaleX: 1, scaleY: 0.8, x: '-=10', y: '-=7' }, '-=0.1');
    tl.to(circlesTopLeft[2], 0.1, { scale: 0.2, x: '-=15', y: '+=6' }, '-=0.1');
    tl.to(circlesTopLeft[0], 1, { scale: 0, x: '-=5', y: '-=15', opacity: 0 });
    tl.to(circlesTopLeft[1], 1, { scaleX: 0.4, scaleY: 0.4, x: '-=10', y: '-=10', opacity: 0 }, '-=1');
    tl.to(circlesTopLeft[2], 1, { scale: 0, x: '-=15', y: '+=5', opacity: 0 }, '-=1');

    // Bottom-right animation
    tl2.set(circlesBottomRight, { x: 0, y: 0 }, 0);
    tl2.to(circlesBottomRight, 1.1, { 
      x: 30, 
      y: 30, 
      ease: 'power1.inOut' 
    });
    tl2.to(circlesBottomRight[0], 0.1, { scale: 0.2, x: '-=6', y: '+=3' });
    tl2.to(circlesBottomRight[1], 0.1, { scale: 0.8, x: '+=7', y: '+=3' }, '-=0.1');
    tl2.to(circlesBottomRight[2], 0.1, { scale: 0.2, x: '+=15', y: '-=6' }, '-=0.1');
    tl2.to(circlesBottomRight[0], 1, { scale: 0, x: '+=5', y: '+=15', opacity: 0 });
    tl2.to(circlesBottomRight[1], 1, { scale: 0.4, x: '+=7', y: '+=7', opacity: 0 }, '-=1');
    tl2.to(circlesBottomRight[2], 1, { scale: 0, x: '+=15', y: '-=5', opacity: 0 }, '-=1');

    const tlBt1 = gsap.timeline();
    const tlBt2 = gsap.timeline();

    tlBt1.set(circlesTopLeft, { x: 0, y: 0, rotation: -45 }, 0);
    tlBt1.add(tl);

    tlBt2.set(circlesBottomRight, { x: 0, y: 0, rotation: 45 }, 0);
    tlBt2.add(tl2);

    btTl.add(tlBt1, 0);
    btTl.to(button, 0.8, { scaleY: 1.1 }, 0.1);
    btTl.add(tlBt2, 0.2);
    btTl.to(button, 1.8, { scale: 1, ease: 'elastic.out(1.2, 0.4)' }, 1.2);

    btTl.timeScale(2.6);
    tlRef.current = btTl;

    const handleMouseOver = () => {
      if (tlRef.current) {
        tlRef.current.restart();
      }
    };

    button.addEventListener('mouseover', handleMouseOver);

    return () => {
      button.removeEventListener('mouseover', handleMouseOver);
      if (tlRef.current) {
        tlRef.current.kill();
      }
    };
  }, [buttonRef]);
}
