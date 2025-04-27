// import { render, screen, fireEvent } from '@testing-library/react';
// import { within } from '@testing-library/dom';

// describe('Responsiveness', () => {
//   it('should display correctly on desktop screens', () => {
//     // Set the viewport to a desktop size
//     global.innerWidth = 1920;
//     global.innerHeight = 1080;
//     global.dispatchEvent(new Event('resize'));

//     // Render the component
//     // render(<MyComponent />);

//     // Assert that the component is displayed correctly for desktop
//     // expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
//     // expect(screen.queryByTestId('mobile-layout')).not.toBeInTheDocument();
//   });

//   it('should display correctly on mobile screens', () => {
//     // Set the viewport to a mobile size
//     global.innerWidth = 375;
//     global.innerHeight = 667;
//     global.dispatchEvent(new Event('resize'));

//     // Render the component
//     // render(<MyComponent />);

//     // Assert that the component is displayed correctly for mobile
//     // expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
//     // expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument();
//   });

//   it('should adapt to different screen orientations', () => {
//     // Set the viewport to a landscape orientation
//     global.innerWidth = 667;
//     global.innerHeight = 375;
//     global.dispatchEvent(new Event('resize'));

//     // Render the component
//     // render(<MyComponent />);

//     // Assert that the component is displayed correctly in landscape orientation
//     // expect(screen.getByTestId('landscape-layout')).toBeInTheDocument();
//   });
// });