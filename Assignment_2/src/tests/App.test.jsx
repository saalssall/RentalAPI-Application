import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Search from '../pages/Search';
import About from '../pages/About';

// ── Login ────────────────────────────────────────────────────
describe('Login Page', () => {
  test('renders login form', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('renders link to register', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByText(/click here to register/i)).toBeInTheDocument();
  });
});

// ── Register ─────────────────────────────────────────────────
describe('Register Page', () => {
  test('renders register form', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('renders link to login', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByText(/click here to login/i)).toBeInTheDocument();
  });
});

// ── Search ───────────────────────────────────────────────────
describe('Search Page', () => {
  test('renders search form', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByText(/search rentals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('renders all state chips', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'].forEach((state) => {
      expect(screen.getByText(state)).toBeInTheDocument();
    });
  });

  test('reset clears postcode', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    const postcode = screen.getByLabelText(/postcode/i);
    fireEvent.change(postcode, { target: { value: '4000' } });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(postcode.value).toBe('');
  });

  test('shows initial prompt before search', () => {
    render(<MemoryRouter><Search /></MemoryRouter>);
    expect(screen.getByText(/use the filters above/i)).toBeInTheDocument();
  });
});

// ── About ────────────────────────────────────────────────────
describe('About Page', () => {
  test('renders welcome message', () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getByText(/rental search/i)).toBeInTheDocument();
  });

  test('renders search properties link', () => {
    render(<MemoryRouter><About /></MemoryRouter>);
    expect(screen.getByText(/search properties/i)).toBeInTheDocument();
  });
});