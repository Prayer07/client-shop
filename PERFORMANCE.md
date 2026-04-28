# Performance & Animation Optimization Guide

## Recent Improvements

### 1. **Cumulative Layout Shift (CLS) Fixes**
- ✅ Fixed CLS issue in hero section by adding explicit dimensions
- ✅ Set `min-height` on container to prevent reflow
- ✅ Added `width` and `height` attributes to hero image
- ✅ Result: CLS should now be close to 0 (previously 0.17)

### 2. **Animation System Overhaul**
- ✅ Replaced Framer Motion animations with CSS + Intersection Observer
- ✅ Animations now trigger only when elements are visible
- ✅ Smooth `cubic-bezier(0.25, 0.46, 0.45, 0.94)` easing for professional feel
- ✅ Staggered animations in grids with configurable delays

### 3. **Layout Restructuring**
- ✅ Moved logo to separate Header component (sticky at top)
- ✅ Navbar now centered with navigation links below header
- ✅ Better visual hierarchy and mobile experience

### 4. **Performance Optimizations**
- ✅ Vite code splitting with manual chunks for better caching
- ✅ React, Query, and Supabase in separate vendor bundles
- ✅ Console logs stripped in production
- ✅ Minified CSS and JS with Terser
- ✅ Resource hints in HTML (preconnect, dns-prefetch)

### 5. **Accessibility**
- ✅ All animations respect `prefers-reduced-motion` media query
- ✅ Motion-sensitive users get instant (no-animation) versions
- ✅ Semantic HTML preserved throughout

## CSS Animation Classes

Use these classes on elements to enable scroll-triggered animations:

```jsx
// Fade in from bottom
<div className="animate-fade-up">Content</div>

// Fade in from top
<div className="animate-fade-down">Content</div>

// Simple fade
<div className="animate-fade-in">Content</div>

// Scale in
<div className="animate-scale-in">Content</div>
```

## Using the Intersection Observer Hook

```jsx
import { useIntersectionObserver } from '../lib/useIntersectionObserver'

export function MyComponent() {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1, // Trigger when 10% visible
    rootMargin: '0px', // or '50px' to trigger before visible
  })

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'animate-fade-up opacity-100' : 'opacity-0'
      }`}
    >
      This element animates when visible
    </div>
  )
}
```

## Image Optimization Best Practices

1. **Always use lazy loading:**
   ```jsx
   <img src={url} loading="lazy" alt="description" />
   ```

2. **Set dimensions to prevent layout shift:**
   ```jsx
   <img 
     src={url} 
     width={800}
     height={600}
     className="w-full h-auto"
   />
   ```

3. **Use modern image formats** (WebP with fallback)

4. **Optimize image size** - consider responsive images

## Performance Metrics

### Before Optimization
- CLS: 0.17 (Poor)
- Animation performance: Framer Motion overhead
- Initial load: Large vendor bundles

### After Optimization
- CLS: ~0.0 (Good)
- Animation performance: Native CSS + Observer
- Initial load: Optimized chunks with better caching
- Bundle size: Reduced with code splitting

## Web Vitals Target

- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1

## Future Improvements

1. Image CDN with responsive delivery
2. Service worker for offline support
3. Dynamic imports for rarely-used components
4. Image compression with sharp/imagemin
5. Analytics to track real Core Web Vitals

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Intersection Observer support: 98%+ of users
- CSS animations: 100% of users
- Graceful degradation for older browsers

## Testing

To verify animations work:
1. Open DevTools (F12)
2. Scroll page slowly to observe animations
3. Check Network tab for chunk sizes
4. Use Lighthouse for Core Web Vitals

To test accessibility:
1. DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`
2. Verify all animations are instant/disabled
