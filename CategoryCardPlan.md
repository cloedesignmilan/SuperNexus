Plan:
1. Extract the `div` inside the map loop of `ShowcaseCategories` into a new `function CategoryCard({ cat, idx })`.
2. Inside `CategoryCard`, use `useRef` for the card element.
3. Add a state `mousePosition` {x, y} and `isHovered`.
4. `onMouseMove`: calculate `clientX/Y` relative to the card's bounding rect.
5. Apply CSS transforms:
   - `rotateX` and `rotateY` based on the mouse position from the center of the card. Max tilt 15 degrees.
   - Spotlight gradient: a radial gradient using `mousePosition.x` and `mousePosition.y` that acts as a torch/glare effect on top of the card.
   - Parallax background: The background image transforms `translateX` and `translateY` slightly based on the tilt, creating a 3D depth effect.
6. The styling should be completely black with super vibrant highlights when hovered.
