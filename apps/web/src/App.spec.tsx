import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders Agri-Coop ERP title properly', () => {
    render(<App />);
    const headingElements = screen.getAllByText('Agri-Coop ERP');
    expect(headingElements.length).toBeGreaterThan(0);
  });

  it('renders Milestone 0 foundation indicators', () => {
    render(<App />);
    expect(screen.getByText('Trạng thái Nền tảng (Milestone 0)')).toBeInTheDocument();
    expect(screen.getByText('NestJS 10.4')).toBeInTheDocument();
  });
});
