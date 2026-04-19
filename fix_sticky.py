import re

with open('src/components/DynamicShowcase.tsx', 'r') as f:
    content = f.read()

# 1. Add IntersectionObserver to hide header
observer_code = """
  // Hide main header on mobile when entering showcase
  useEffect(() => {
    const showcaseContainer = document.querySelector('.dynamic-showcase-container');
    const header = document.querySelector('.landing-header') as HTMLElement;
    
    if (!showcaseContainer || !header) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (window.innerWidth <= 900) {
        if (entry.isIntersecting) {
          header.style.transform = 'translateY(-100%)';
          header.style.transition = 'transform 0.3s ease';
        } else {
          header.style.transform = 'translateY(0)';
        }
      }
    }, { rootMargin: '-10% 0px -10% 0px', threshold: 0 });

    observer.observe(showcaseContainer);
    return () => {
      observer.disconnect();
      if (header) header.style.transform = 'translateY(0)';
    };
  }, []);
"""

content = content.replace("  useEffect(() => {\n    const observers = SHOWCASE_DATA.map", observer_code + "\n  useEffect(() => {\n    const observers = SHOWCASE_DATA.map")

# 2. Fix the sticky header structure
old_mobile_header = """             <div className="ds-mobile-header show-mobile">
                <div style={{
                  position: 'sticky',
                  top: '70px',
                  zIndex: 20,
                  background: 'rgba(8, 8, 8, 0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: '1rem 0',
                  margin: '-1rem 0 1rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div className="ds-category">{item.category}</div>
                  <h3 className="ds-subcategory" style={{ margin: 0 }}>{item.subcategory}</h3>
                </div>

                <div className="ds-usecases" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>"""

new_mobile_header = """             <div className="show-mobile" style={{
                  position: 'sticky',
                  top: '-1px',
                  zIndex: 30,
                  background: 'rgba(8, 8, 8, 0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: '1rem 0',
                  margin: '0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div className="ds-category">{item.category}</div>
                  <h3 className="ds-subcategory" style={{ margin: 0, fontSize: '1.5rem' }}>{item.subcategory}</h3>
             </div>

             <div className="ds-mobile-header show-mobile" style={{ marginTop: '1rem' }}>
                <div className="ds-usecases" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>"""

content = content.replace(old_mobile_header, new_mobile_header)

with open('src/components/DynamicShowcase.tsx', 'w') as f:
    f.write(content)

print("Fixed successfully")
