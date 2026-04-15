'use client';

import { useEffect } from 'react';
import gsap from 'gsap';

export function BubbleEffectInitializer() {
  useEffect(() => {
    // Function to setup bubble effect on a button
    const setupBubbleEffect = (button: HTMLButtonElement) => {
      // Skip if already setup
      if (button.querySelector('.bubble-effect-container')) {
        return;
      }

      // Skip buttons that are very small or hidden or menu/close buttons
      const text = button.textContent?.trim().toLowerCase() || '';
      
      // Create bubble container
      const bubbleContainer = document.createElement('div');
      bubbleContainer.className = 'bubble-effect-container';
      
      // Create top-left circles
      const topLeft = document.createElement('div');
      topLeft.className = 'circle top-left';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'circle-dot';
        topLeft.appendChild(dot);
      }
      
      bubbleContainer.appendChild(topLeft);

      // Create bottom-right circles
      const bottomRight = document.createElement('div');
      bottomRight.className = 'circle bottom-right';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'circle-dot';
        bottomRight.appendChild(dot);
      }
      
      bubbleContainer.appendChild(bottomRight);
      button.appendChild(bubbleContainer);

      // Get all circles as NodeList and convert to arrays
      const circlesTopLeftNodeList = topLeft.querySelectorAll('.circle-dot');
      const circlesBottomRightNodeList = bottomRight.querySelectorAll('.circle-dot');
      
      const circlesTopLeft = Array.from(circlesTopLeftNodeList) as HTMLElement[];
      const circlesBottomRight = Array.from(circlesBottomRightNodeList) as HTMLElement[];

      // Create timelines
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

      // Create button timelines
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

      // Add hover listener
      const handleMouseOver = () => {
        btTl.restart();
      };

      button.addEventListener('mouseover', handleMouseOver);
      
      // Store cleanup function
      (button as any)._bubbleCleanup = () => {
        button.removeEventListener('mouseover', handleMouseOver);
        btTl.kill();
      };
    };

    // Initial setup for all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      setupBubbleEffect(btn as HTMLButtonElement);
    });

    // Watch for new buttons added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            if (element.tagName === 'BUTTON') {
              setupBubbleEffect(element as HTMLButtonElement);
            }
            // Also check for buttons inside the added node
            element.querySelectorAll('button').forEach((btn) => {
              setupBubbleEffect(btn as HTMLButtonElement);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      // Cleanup all bubble effects
      const allButtons = document.querySelectorAll('button');
      allButtons.forEach((btn: any) => {
        if (btn._bubbleCleanup) {
          btn._bubbleCleanup();
        }
      });
    };
  }, []);

  return null;
}
